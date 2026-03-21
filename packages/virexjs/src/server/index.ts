import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { bundleIslands, extractIslands, generateHydrationRuntime } from "@virexjs/bundler";
import { buildTree, matchRoute, scanPages } from "@virexjs/router";
import type { VirexConfig } from "../config/types";
import { PluginRunner } from "../plugin/runner";
import { renderPage } from "../render/index";
import { registerIsland } from "../render/jsx";
import { handleAPIRequest, handlePageRequest } from "./handler";
import { type MiddlewareFn, runMiddleware } from "./middleware";
import { serveBuiltAsset, serveStatic } from "./static";

/**
 * Create and start the VirexJS HTTP server.
 * Uses Bun.serve() with the following request pipeline:
 *
 * 1. Check /public static files → serve with correct MIME type
 * 2. Check /_virex/ built assets → serve with immutable cache headers
 * 3. Match API routes (src/api/) → call handler
 * 4. Match page routes (src/pages/) → run middleware → run loader → render
 * 5. Custom _404.tsx or default 404 fallback
 */
export function createServer(config: VirexConfig, options?: { devScript?: string }) {
	const cwd = process.cwd();
	const srcDir = resolve(cwd, config.srcDir);
	const pagesDir = join(srcDir, "pages");
	const apiDir = join(srcDir, "api");
	const middlewareDir = join(srcDir, "middleware");
	const publicDir = resolve(cwd, config.publicDir);
	const outDir = resolve(cwd, config.outDir);

	// Initialize plugin runner
	const pluginRunner = new PluginRunner(config.plugins ?? []);

	// Register island components and prepare hydration
	const islands = extractIslands(srcDir);
	for (const [name] of islands) {
		registerIsland(name);
	}

	// Generate hydration runtime if there are islands
	let hydrationScript = "";
	if (islands.size > 0) {
		hydrationScript = generateHydrationRuntime("/_virex/islands/");

		// Bundle islands for client-side delivery
		bundleIslands({
			srcDir,
			outDir,
			minify: false,
		}).catch((err) => {
			console.error("Failed to bundle islands:", err);
		});
	}

	// Combine dev script with hydration script
	const combinedDevScript = [options?.devScript, hydrationScript].filter(Boolean).join("\n");

	// Scan and build route tree
	const pageRoutes = scanPages(pagesDir);
	const routeTree = buildTree(pageRoutes);

	// Scan API routes
	const apiRoutes = scanPages(apiDir);
	const apiTree = buildTree(apiRoutes);

	// Load middleware from src/middleware/ and plugins
	const middlewares: MiddlewareFn[] = [];
	// Plugin middleware runs first (before user middleware)
	middlewares.push(...pluginRunner.collectMiddleware());
	const middlewarePromise = loadMiddleware(middlewareDir, middlewares);

	// Check for custom _404.tsx and _error.tsx
	const custom404Path = join(pagesDir, "_404.tsx");
	const customErrorPath = join(pagesDir, "_error.tsx");
	let has404Page = false;
	let hasErrorPage = false;
	try {
		has404Page = Bun.file(custom404Path).size > 0;
	} catch {
		has404Page = false;
	}
	try {
		hasErrorPage = Bun.file(customErrorPath).size > 0;
	} catch {
		hasErrorPage = false;
	}

	const server = Bun.serve({
		port: config.port,
		hostname: config.hostname,

		async fetch(request: Request): Promise<Response> {
			const response = await handleRequest(request);
			return maybeCompress(response, request);
		},
	});

	async function handleRequest(request: Request): Promise<Response> {
		const startTime = performance.now();

		// Ensure middleware is loaded
		await middlewarePromise;

		const url = new URL(request.url);
		let pathname = url.pathname;

		// Strip basePath prefix if configured
		const basePath = config.router.basePath;
		if (basePath && pathname.startsWith(basePath)) {
			pathname = pathname.slice(basePath.length) || "/";
		} else if (basePath && !pathname.startsWith(basePath)) {
			// Request outside basePath — 404
			return addTimingHeader(new Response("Not Found", { status: 404 }), startTime);
		}

		// Trailing slash redirect (except root)
		if (!config.router.trailingSlash && pathname.length > 1 && pathname.endsWith("/")) {
			const target = (basePath ?? "") + pathname.slice(0, -1) + url.search;
			return new Response(null, {
				status: 301,
				headers: { Location: target },
			});
		}

		// 1. Static files from /public (with ETag support)
		const staticResponse = await serveStatic(pathname, publicDir, request);
		if (staticResponse) {
			return addTimingHeader(staticResponse, startTime);
		}

		// 2. Built assets from /_virex/
		if (pathname.startsWith("/_virex/")) {
			const assetPath = pathname.slice(8);
			const assetResponse = await serveBuiltAsset(assetPath, outDir);
			if (assetResponse) {
				return addTimingHeader(assetResponse, startTime);
			}
		}

		// 3. API routes (src/api/)
		if (pathname.startsWith("/api/") || pathname === "/api") {
			const apiPath = pathname.replace(/^\/api\/?/, "/") || "/";
			const apiMatch = matchRoute(apiPath, apiTree);
			if (apiMatch?.route.filePath) {
				const res = await handleAPIRequest(apiMatch.route.filePath, request, apiMatch.params);
				return addTimingHeader(res, startTime);
			}
		}

		// 4. Page routes — run through middleware chain
		const pageMatch = matchRoute(pathname + url.search, routeTree);
		if (pageMatch) {
			const pageOptions = {
				devScript: combinedDevScript || undefined,
				errorPagePath: hasErrorPage ? customErrorPath : undefined,
			};
			let res: Response;
			if (middlewares.length > 0) {
				const ctx = {
					request,
					params: pageMatch.params,
					locals: {},
				};
				res = await runMiddleware(middlewares, ctx, () =>
					handlePageRequest(pageMatch, request, pageOptions),
				);
			} else {
				res = await handlePageRequest(pageMatch, request, pageOptions);
			}

			// Run transformHTML plugin hooks on page responses
			if (pluginRunner.count > 0) {
				const contentType = res.headers.get("Content-Type") ?? "";
				if (contentType.includes("text/html")) {
					const originalHtml = await res.text();
					const transformed = await pluginRunner.runTransformHTML(originalHtml, {
						pathname,
						params: pageMatch.params,
						request,
					});
					res = new Response(transformed, {
						status: res.status,
						headers: res.headers,
					});
				}
			}

			return addTimingHeader(res, startTime);
		}

		// 5. Custom _404 page or default fallback
		if (has404Page) {
			try {
				const mod = await import(custom404Path);
				if (mod.default) {
					const response = renderPage({
						component: mod.default,
						data: { data: {}, params: {}, url: new URL(request.url) },
						devScript: combinedDevScript || undefined,
					});
					return addTimingHeader(
						new Response(response.body, { status: 404, headers: response.headers }),
						startTime,
					);
				}
			} catch {
				// Fall through to default 404
			}
		}

		return addTimingHeader(
			new Response(
				`<!DOCTYPE html><html><head><title>404</title></head><body><h1>404 — Page Not Found</h1><p>The page <code>${escapeForHtml(pathname)}</code> does not exist.</p></body></html>`,
				{ status: 404, headers: { "Content-Type": "text/html" } },
			),
			startTime,
		);
	}

	// Run plugin lifecycle hooks
	pluginRunner.runConfigResolved(config).catch(() => {});
	pluginRunner
		.runServerCreated({
			port: config.port,
			hostname: config.hostname,
			routeCount: pageRoutes.length,
		})
		.catch(() => {});

	return {
		server,
		routeCount: pageRoutes.length,
		pluginRunner,
		stop: () => server.stop(),
	};
}

/**
 * Dynamically load middleware files from the middleware directory.
 * Each file should export a default middleware function.
 */
async function loadMiddleware(middlewareDir: string, middlewares: MiddlewareFn[]): Promise<void> {
	let entries: string[];
	try {
		entries = readdirSync(middlewareDir);
	} catch {
		return;
	}

	for (const entry of entries) {
		if (!entry.endsWith(".ts") && !entry.endsWith(".tsx")) {
			continue;
		}
		try {
			const mod = await import(join(middlewareDir, entry));
			const fn = mod.default ?? Object.values(mod)[0];
			if (typeof fn === "function") {
				middlewares.push(fn as MiddlewareFn);
			}
		} catch {
			// Skip invalid middleware files
		}
	}
}

/** Add X-Response-Time header and optionally compress the response */
function addTimingHeader(response: Response, startTime: number, _request?: Request): Response {
	const elapsed = (performance.now() - startTime).toFixed(1);
	response.headers.set("X-Response-Time", `${elapsed}ms`);
	return response;
}

/** Compressible content types */
const COMPRESSIBLE_TYPES = new Set([
	"text/html",
	"text/css",
	"application/javascript",
	"application/json",
	"image/svg+xml",
	"text/plain",
	"text/xml",
	"application/xml",
]);

/**
 * Compress a response body with gzip if the client supports it
 * and the content type is compressible.
 */
async function maybeCompress(response: Response, request: Request): Promise<Response> {
	const acceptEncoding = request.headers.get("Accept-Encoding") ?? "";
	if (!acceptEncoding.includes("gzip")) {
		return response;
	}

	const contentType = response.headers.get("Content-Type") ?? "";
	const baseType = contentType.split(";")[0] ?? "";
	if (!COMPRESSIBLE_TYPES.has(baseType.trim())) {
		return response;
	}

	// Don't compress small responses or streaming
	const body = await response.arrayBuffer();
	if (body.byteLength < 256) {
		return new Response(body, {
			status: response.status,
			headers: response.headers,
		});
	}

	const compressed = Bun.gzipSync(new Uint8Array(body));
	const newHeaders = new Headers(response.headers);
	newHeaders.set("Content-Encoding", "gzip");
	newHeaders.delete("Content-Length");

	return new Response(compressed, {
		status: response.status,
		headers: newHeaders,
	});
}

function escapeForHtml(str: string): string {
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
