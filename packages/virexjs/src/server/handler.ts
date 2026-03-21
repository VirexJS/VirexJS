import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import type { MatchResult } from "@virexjs/router";
import { getRevalidateTime, isCachedPage, withCache } from "../directives/index";
import { renderPage } from "../render/index";
import type { VNode } from "../render/jsx";
import type { MetaData } from "../render/meta";

interface PageModule {
	default: (props: Record<string, unknown>) => VNode;
	/** ISR revalidation time in seconds */
	revalidate?: number;
	loader?: (ctx: {
		params: Record<string, string>;
		request: Request;
		headers: Headers;
	}) => Promise<Record<string, unknown>> | Record<string, unknown>;
	meta?: (ctx: { data: Record<string, unknown>; params: Record<string, string> }) => MetaData;
}

interface APIModule {
	GET?: (ctx: { request: Request; params: Record<string, string> }) => Response | Promise<Response>;
	POST?: (ctx: {
		request: Request;
		params: Record<string, string>;
	}) => Response | Promise<Response>;
	PUT?: (ctx: { request: Request; params: Record<string, string> }) => Response | Promise<Response>;
	DELETE?: (ctx: {
		request: Request;
		params: Record<string, string>;
	}) => Response | Promise<Response>;
	PATCH?: (ctx: {
		request: Request;
		params: Record<string, string>;
	}) => Response | Promise<Response>;
}

export interface PageRequestOptions {
	layout?: (props: { children: unknown }) => VNode;
	cssLinks?: string[];
	devScript?: string;
	errorPagePath?: string;
}

/**
 * Handle a matched page route:
 * 1. Import the page module dynamically
 * 2. Call loader() export (if exists) with { params, request, headers }
 * 3. Call meta() export (if exists) with { data }
 * 4. Render page component with { data }
 * 5. Return streaming HTML Response
 * 6. On error: render _error.tsx if available, otherwise fallback
 */
export async function handlePageRequest(
	match: MatchResult,
	request: Request,
	options?: PageRequestOptions,
): Promise<Response> {
	try {
		// Add timestamp to bypass Bun's module cache in dev mode
		const cacheBust = process.env.NODE_ENV !== "production" ? `?t=${Date.now()}` : "";
		const mod = (await import(match.route.filePath! + cacheBust)) as PageModule;
		const component = mod.default;

		if (!component) {
			return new Response("Page module has no default export", { status: 500 });
		}

		// "use cache" / revalidate — ISR support
		const revalidate =
			getRevalidateTime(mod as unknown as Record<string, unknown>) ??
			(isCachedPage(match.route.filePath!) ? 60 : null);

		if (revalidate) {
			const url = new URL(request.url);
			return withCache(url.pathname, revalidate, () =>
				renderPageFull(mod, match, request, options),
			);
		}

		return renderPageFull(mod, match, request, options);
	} catch (error) {
		return handlePageError(error, request, options);
	}
}

/** Full page render pipeline */
async function renderPageFull(
	mod: PageModule,
	match: MatchResult,
	request: Request,
	options?: PageRequestOptions,
): Promise<Response> {
	// Run loader
	let data: Record<string, unknown> = {};
	if (mod.loader) {
		data = await mod.loader({
			params: match.params,
			request,
			headers: request.headers,
		});
	}

	// Get meta
	let metaData: MetaData | undefined;
	if (mod.meta) {
		metaData = mod.meta({ data, params: match.params });
	}

	// Auto-detect _layout.tsx in the page's directory or parent directories
	let layout = options?.layout;
	if (!layout) {
		layout = await findLayout(match.route.filePath!);
	}

	const component = mod.default;
	return renderPage({
		component,
		layout,
		data: { data, params: match.params, url: new URL(request.url) },
		meta: metaData,
		cssLinks: options?.cssLinks,
		devScript: options?.devScript,
	});
}

/** Handle page rendering errors */
async function handlePageError(
	error: unknown,
	request: Request,
	options?: PageRequestOptions,
): Promise<Response> {
	{
		const isDev = process.env.NODE_ENV !== "production";
		const message = error instanceof Error ? error.message : "Unknown error";
		const safeMessage = isDev ? message : "Internal Server Error";
		const safeStack = isDev ? (error instanceof Error ? error.stack : undefined) : undefined;

		// Try custom _error.tsx page
		if (options?.errorPagePath) {
			try {
				const errorMod = await import(options.errorPagePath);
				if (errorMod.default) {
					const response = renderPage({
						component: errorMod.default,
						data: {
							data: { error: safeMessage, stack: safeStack },
							params: {},
							url: new URL(request.url),
						},
						devScript: options?.devScript,
					});
					return new Response(response.body, {
						status: 500,
						headers: response.headers,
					});
				}
			} catch {
				// Fall through to default error page
			}
		}

		return new Response(
			`<h1>500 — Server Error</h1>${isDev ? `<pre>${escapeForHtml(message)}</pre>` : "<p>Internal Server Error</p>"}`,
			{ status: 500, headers: { "Content-Type": "text/html" } },
		);
	}
}

/**
 * Handle an API route:
 * 1. Import the API module dynamically
 * 2. Call the appropriate exported function (GET, POST, PUT, DELETE)
 * 3. Return the Response
 */
export async function handleAPIRequest(
	filePath: string,
	request: Request,
	params: Record<string, string> = {},
): Promise<Response> {
	try {
		const cacheBust = process.env.NODE_ENV !== "production" ? `?t=${Date.now()}` : "";
		const mod = (await import(filePath + cacheBust)) as APIModule;
		const method = request.method.toUpperCase() as keyof APIModule;
		const handler = mod[method];

		if (!handler) {
			return new Response(JSON.stringify({ error: `Method ${method} not allowed` }), {
				status: 405,
				headers: { "Content-Type": "application/json" },
			});
		}

		return await handler({ request, params });
	} catch (error) {
		const isDev = process.env.NODE_ENV !== "production";
		const message = isDev
			? error instanceof Error
				? error.message
				: "Unknown error"
			: "Internal Server Error";
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}

/**
 * Walk up from a page's directory looking for _layout.tsx.
 * Stops when it reaches a directory that no longer contains pages or the src root.
 */
async function findLayout(
	pageFilePath: string,
): Promise<((props: { children: unknown }) => VNode) | undefined> {
	let dir = dirname(pageFilePath);
	const maxDepth = 10;
	let depth = 0;

	while (depth < maxDepth) {
		const layoutPath = join(dir, "_layout.tsx");
		if (existsSync(layoutPath)) {
			try {
				const cb = process.env.NODE_ENV !== "production" ? `?t=${Date.now()}` : "";
				const mod = await import(layoutPath + cb);
				if (mod.default) {
					return mod.default as (props: { children: unknown }) => VNode;
				}
			} catch {
				// Invalid layout file, skip
			}
		}

		const parentDir = dirname(dir);
		if (parentDir === dir) break;
		dir = parentDir;
		depth++;
	}

	return undefined;
}

function escapeForHtml(str: string): string {
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
