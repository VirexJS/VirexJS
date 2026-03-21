import { join, resolve } from "node:path";
import { readdirSync } from "node:fs";
import type { VirexConfig } from "../config/types";
import { scanPages, buildTree, matchRoute } from "@virexjs/router";
import { extractIslands } from "@virexjs/bundler";
import { registerIsland } from "../render/jsx";
import { handlePageRequest, handleAPIRequest } from "./handler";
import { serveStatic, serveBuiltAsset } from "./static";
import { runMiddleware, type MiddlewareFn } from "./middleware";
import { renderPage } from "../render/index";

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

	// Register island components
	const islands = extractIslands(srcDir);
	for (const [name] of islands) {
		registerIsland(name);
	}

	// Scan and build route tree
	const pageRoutes = scanPages(pagesDir);
	const routeTree = buildTree(pageRoutes);

	// Scan API routes
	const apiRoutes = scanPages(apiDir);
	const apiTree = buildTree(apiRoutes);

	// Load middleware from src/middleware/
	const middlewares: MiddlewareFn[] = [];
	const middlewarePromise = loadMiddleware(middlewareDir, middlewares);

	// Check for custom _404.tsx
	const custom404Path = join(pagesDir, "_404.tsx");
	let has404Page = false;
	try {
		has404Page = Bun.file(custom404Path).size > 0;
	} catch {
		has404Page = false;
	}

	const server = Bun.serve({
		port: config.port,
		hostname: config.hostname,

		async fetch(request: Request): Promise<Response> {
			// Ensure middleware is loaded
			await middlewarePromise;

			const url = new URL(request.url);
			const pathname = url.pathname;

			// 1. Static files from /public
			const staticResponse = await serveStatic(pathname, publicDir);
			if (staticResponse) {
				return staticResponse;
			}

			// 2. Built assets from /_virex/
			if (pathname.startsWith("/_virex/")) {
				const assetPath = pathname.slice(8);
				const assetResponse = await serveBuiltAsset(assetPath, outDir);
				if (assetResponse) {
					return assetResponse;
				}
			}

			// 3. API routes (src/api/)
			if (pathname.startsWith("/api/") || pathname === "/api") {
				const apiPath = pathname.replace(/^\/api\/?/, "/") || "/";
				const apiMatch = matchRoute(apiPath, apiTree);
				if (apiMatch?.route.filePath) {
					return handleAPIRequest(apiMatch.route.filePath, request, apiMatch.params);
				}
			}

			// 4. Page routes — run through middleware chain
			const pageMatch = matchRoute(pathname + url.search, routeTree);
			if (pageMatch) {
				if (middlewares.length > 0) {
					const ctx = {
						request,
						params: pageMatch.params,
						locals: {},
					};
					return runMiddleware(middlewares, ctx, () =>
						handlePageRequest(pageMatch, request, {
							devScript: options?.devScript,
						}),
					);
				}
				return handlePageRequest(pageMatch, request, {
					devScript: options?.devScript,
				});
			}

			// 5. Custom _404 page or default fallback
			if (has404Page) {
				try {
					const mod = await import(custom404Path);
					if (mod.default) {
						const response = renderPage({
							component: mod.default,
							data: { data: {}, params: {}, url: new URL(request.url) },
							devScript: options?.devScript,
						});
						return new Response(response.body, {
							status: 404,
							headers: response.headers,
						});
					}
				} catch {
					// Fall through to default 404
				}
			}

			return new Response(
				`<!DOCTYPE html><html><head><title>404</title></head><body><h1>404 — Page Not Found</h1><p>The page <code>${escapeForHtml(pathname)}</code> does not exist.</p></body></html>`,
				{ status: 404, headers: { "Content-Type": "text/html" } },
			);
		},
	});

	return {
		server,
		routeCount: pageRoutes.length,
		stop: () => server.stop(),
	};
}

/**
 * Dynamically load middleware files from the middleware directory.
 * Each file should export a default middleware function.
 */
async function loadMiddleware(
	middlewareDir: string,
	middlewares: MiddlewareFn[],
): Promise<void> {
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

function escapeForHtml(str: string): string {
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
