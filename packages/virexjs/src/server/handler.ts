import type { MatchResult } from "@virexjs/router";
import { renderPage } from "../render/index";
import type { VNode } from "../render/jsx";
import type { MetaData } from "../render/meta";

interface PageModule {
	default: (props: Record<string, unknown>) => VNode;
	loader?: (ctx: { params: Record<string, string>; request: Request; headers: Headers }) => Promise<Record<string, unknown>> | Record<string, unknown>;
	meta?: (ctx: { data: Record<string, unknown>; params: Record<string, string> }) => MetaData;
}

interface APIModule {
	GET?: (ctx: { request: Request; params: Record<string, string> }) => Response | Promise<Response>;
	POST?: (ctx: { request: Request; params: Record<string, string> }) => Response | Promise<Response>;
	PUT?: (ctx: { request: Request; params: Record<string, string> }) => Response | Promise<Response>;
	DELETE?: (ctx: { request: Request; params: Record<string, string> }) => Response | Promise<Response>;
	PATCH?: (ctx: { request: Request; params: Record<string, string> }) => Response | Promise<Response>;
}

/**
 * Handle a matched page route:
 * 1. Import the page module dynamically
 * 2. Call loader() export (if exists) with { params, request, headers }
 * 3. Call meta() export (if exists) with { data }
 * 4. Render page component with { data }
 * 5. Return streaming HTML Response
 */
export async function handlePageRequest(
	match: MatchResult,
	request: Request,
	options?: { layout?: (props: { children: unknown }) => VNode; cssLinks?: string[]; devScript?: string },
): Promise<Response> {
	try {
		const mod = await import(match.route.filePath!) as PageModule;
		const component = mod.default;

		if (!component) {
			return new Response("Page module has no default export", { status: 500 });
		}

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

		return renderPage({
			component,
			layout: options?.layout,
			data: { data, params: match.params, url: new URL(request.url) },
			meta: metaData,
			cssLinks: options?.cssLinks,
			devScript: options?.devScript,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return new Response(`<h1>500 — Server Error</h1><pre>${escapeForHtml(message)}</pre>`, {
			status: 500,
			headers: { "Content-Type": "text/html" },
		});
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
		const mod = await import(filePath) as APIModule;
		const method = request.method.toUpperCase() as keyof APIModule;
		const handler = mod[method];

		if (!handler) {
			return new Response(
				JSON.stringify({ error: `Method ${method} not allowed` }),
				{ status: 405, headers: { "Content-Type": "application/json" } },
			);
		}

		return await handler({ request, params });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return new Response(
			JSON.stringify({ error: message }),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}
}

function escapeForHtml(str: string): string {
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
