import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import type { MatchResult } from "@virexjs/router";
import { getRevalidateTime, isCachedPage, withCache } from "../directives/index";
import { renderPage, renderPageAsync } from "../render/index";
import type { VNode } from "../render/jsx";
import { h, renderToString } from "../render/jsx";
import type { MetaData } from "../render/meta";

interface PageModule {
	default: (props: Record<string, unknown>) => VNode;
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
 * Handle a matched page route with Next.js-like features:
 * 1. Import the page module
 * 2. Find nested layouts (_layout.tsx cascade)
 * 3. Find per-route _loading.tsx and _error.tsx
 * 4. Run loader, render with layouts, stream response
 */
export async function handlePageRequest(
	match: MatchResult,
	request: Request,
	options?: PageRequestOptions,
): Promise<Response> {
	try {
		const cacheBust = process.env.NODE_ENV !== "production" ? `?t=${Date.now()}` : "";
		const mod = (await import(match.route.filePath! + cacheBust)) as PageModule;
		const component = mod.default;

		if (!component) {
			return new Response("Page module has no default export", { status: 500 });
		}

		// ISR support
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
		return handlePageError(error, match.route.filePath!, request, options);
	}
}

/** Full page render pipeline with nested layouts */
async function renderPageFull(
	mod: PageModule,
	match: MatchResult,
	request: Request,
	options?: PageRequestOptions,
): Promise<Response> {
	// Find _loading.tsx for this route (used as fallback shell)
	const loadingComponent = await findSpecialFile(match.route.filePath!, "_loading.tsx");

	// Find ALL nested layouts (root → leaf order)
	const layouts = options?.layout
		? [options.layout]
		: await findNestedLayouts(match.route.filePath!);

	// Build layout wrapper function
	const wrapInLayouts = (inner: VNode): VNode => {
		let node = inner;
		for (let i = layouts.length - 1; i >= 0; i--) {
			const layout = layouts[i]!;
			node = h(layout, { children: node });
		}
		return node;
	};

	// Async streaming: if page has async loader + loading component,
	// send loading shell immediately while data loads (Suspense-like)
	if (mod.loader && loadingComponent) {
		const dataPromise = Promise.resolve(
			mod.loader({ params: match.params, request, headers: request.headers }),
		);

		return renderPageAsync({
			component: (data) => {
				const pageVNode = h(mod.default, {
					data,
					params: match.params,
					url: new URL(request.url),
				});
				return wrapInLayouts(pageVNode);
			},
			dataPromise,
			metaFn: mod.meta
				? (data) => mod.meta!({ data, params: match.params })
				: undefined,
			cssLinks: options?.cssLinks,
			devScript: options?.devScript,
			loadingComponent,
		});
	}

	// Sync path: await data, then render
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

	// Build component tree: Layout1 → Layout2 → ... → Page
	const component = mod.default;
	let pageVNode: VNode = h(component, { data, params: match.params, url: new URL(request.url) });
	pageVNode = wrapInLayouts(pageVNode);

	// Render with streaming — send loading shell first if available
	return renderPageStreaming(pageVNode, metaData, options, loadingComponent);
}

/**
 * Streaming render — sends loading shell immediately, then full content.
 * Like Next.js loading.tsx + Suspense but without React.
 */
function renderPageStreaming(
	pageVNode: VNode,
	meta: MetaData | undefined,
	options?: PageRequestOptions,
	loadingComponent?: (props: Record<string, unknown>) => VNode,
): Response {
	return renderPage({
		// biome-ignore lint/suspicious/noExplicitAny: VNode component wrapper
		component: (() => pageVNode) as any,
		meta,
		cssLinks: options?.cssLinks,
		devScript: options?.devScript,
		loadingComponent,
	});
}

/**
 * Handle errors with per-route _error.tsx support.
 * Walks up from page directory looking for nearest _error.tsx.
 * Falls back to root _error.tsx, then default error page.
 */
async function handlePageError(
	error: unknown,
	pageFilePath: string,
	request: Request,
	options?: PageRequestOptions,
): Promise<Response> {
	const isDev = process.env.NODE_ENV !== "production";
	const message = error instanceof Error ? error.message : "Unknown error";
	const safeMessage = isDev ? message : "Internal Server Error";
	const safeStack = isDev ? (error instanceof Error ? error.stack : undefined) : undefined;

	// Walk up looking for nearest _error.tsx (per-route error boundary)
	const errorComponent = await findSpecialFile(pageFilePath, "_error.tsx");

	if (errorComponent) {
		try {
			const errorVNode = h(errorComponent, { error: safeMessage, stack: safeStack });
			const html = renderToString(errorVNode);
			return new Response(
				`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`,
				{ status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } },
			);
		} catch {
			// Error page itself failed, fall through
		}
	}

	// Try root error page from options
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
				return new Response(response.body, { status: 500, headers: response.headers });
			}
		} catch {
			// Fall through
		}
	}

	return new Response(
		`<h1>500 — Server Error</h1>${isDev ? `<pre>${escapeForHtml(message)}</pre>` : "<p>Internal Server Error</p>"}`,
		{ status: 500, headers: { "Content-Type": "text/html" } },
	);
}

/**
 * Find ALL nested layouts from root to page directory.
 * Like Next.js App Router — each _layout.tsx wraps its children.
 *
 * Example:
 *   src/pages/_layout.tsx         → Root layout
 *   src/pages/admin/_layout.tsx   → Admin layout
 *   src/pages/admin/users.tsx     → Page
 *
 * Result: [RootLayout, AdminLayout] (applied root → leaf)
 */
async function findNestedLayouts(
	pageFilePath: string,
): Promise<Array<(props: { children: unknown }) => VNode>> {
	const layouts: Array<{ depth: number; component: (props: { children: unknown }) => VNode }> = [];
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
					layouts.push({ depth, component: mod.default });
				}
			} catch {
				// Skip invalid layout
			}
		}

		const parentDir = dirname(dir);
		if (parentDir === dir) break;
		dir = parentDir;
		depth++;
	}

	// Sort by depth descending so root layout is first (outermost)
	return layouts.sort((a, b) => b.depth - a.depth).map((l) => l.component);
}

/**
 * Find a special file (_loading.tsx, _error.tsx) walking up from page directory.
 * Returns the nearest one's default export, or undefined.
 */
async function findSpecialFile(
	pageFilePath: string,
	fileName: string,
): Promise<((props: Record<string, unknown>) => VNode) | undefined> {
	let dir = dirname(pageFilePath);
	const maxDepth = 10;

	for (let i = 0; i < maxDepth; i++) {
		const filePath = join(dir, fileName);
		if (existsSync(filePath)) {
			try {
				const cb = process.env.NODE_ENV !== "production" ? `?t=${Date.now()}` : "";
				const mod = await import(filePath + cb);
				if (mod.default) return mod.default;
			} catch {
				// Skip
			}
		}
		const parentDir = dirname(dir);
		if (parentDir === dir) break;
		dir = parentDir;
	}

	return undefined;
}

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

function escapeForHtml(str: string): string {
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
