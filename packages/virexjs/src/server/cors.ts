import type { MiddlewareFn } from "./middleware";

/** CORS configuration options */
export interface CORSOptions {
	/** Allowed origins. Use "*" for any, or an array of specific origins. Default: "*" */
	origin?: string | string[] | ((origin: string) => boolean);
	/** Allowed HTTP methods. Default: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"] */
	methods?: string[];
	/** Allowed request headers. Default: [] (mirror request headers) */
	allowedHeaders?: string[];
	/** Headers exposed to the browser. Default: [] */
	exposedHeaders?: string[];
	/** Whether to allow credentials (cookies, auth headers). Default: false */
	credentials?: boolean;
	/** Max age for preflight cache in seconds. Default: 86400 (24h) */
	maxAge?: number;
}

/**
 * Create a CORS middleware with the given options.
 *
 * Usage:
 *   import { cors } from "virexjs";
 *
 *   // In virex.config.ts with plugin middleware:
 *   definePlugin({
 *     name: "cors",
 *     middleware: () => cors({ origin: "https://example.com", credentials: true }),
 *   });
 *
 *   // Or in src/middleware/cors.ts:
 *   export default cors({ origin: "*" });
 */
export function cors(options: CORSOptions = {}): MiddlewareFn {
	const {
		origin = "*",
		methods = ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
		allowedHeaders = [],
		exposedHeaders = [],
		credentials = false,
		maxAge = 86400,
	} = options;

	return async (ctx, next) => {
		const requestOrigin = ctx.request.headers.get("Origin") ?? "";

		// Determine if origin is allowed
		const allowedOrigin = resolveOrigin(origin, requestOrigin);

		// Handle preflight (OPTIONS) requests
		if (ctx.request.method === "OPTIONS") {
			const headers = new Headers();
			if (allowedOrigin) {
				headers.set("Access-Control-Allow-Origin", allowedOrigin);
			}
			headers.set("Access-Control-Allow-Methods", methods.join(", "));

			const reqHeaders = ctx.request.headers.get("Access-Control-Request-Headers");
			if (allowedHeaders.length > 0) {
				headers.set("Access-Control-Allow-Headers", allowedHeaders.join(", "));
			} else if (reqHeaders) {
				// Mirror requested headers
				headers.set("Access-Control-Allow-Headers", reqHeaders);
			}

			if (credentials) {
				headers.set("Access-Control-Allow-Credentials", "true");
			}

			headers.set("Access-Control-Max-Age", String(maxAge));
			headers.set("Content-Length", "0");

			return new Response(null, { status: 204, headers });
		}

		// For actual requests, call next and add CORS headers to response
		const response = await next();

		if (allowedOrigin) {
			response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
		}

		if (credentials) {
			response.headers.set("Access-Control-Allow-Credentials", "true");
		}

		if (exposedHeaders.length > 0) {
			response.headers.set("Access-Control-Expose-Headers", exposedHeaders.join(", "));
		}

		// Vary header for caching correctness when origin is not "*"
		if (allowedOrigin && allowedOrigin !== "*") {
			response.headers.append("Vary", "Origin");
		}

		return response;
	};
}

/** Resolve the allowed origin value based on config and request */
function resolveOrigin(
	config: string | string[] | ((origin: string) => boolean),
	requestOrigin: string,
): string | null {
	if (config === "*") {
		return "*";
	}

	if (typeof config === "function") {
		return config(requestOrigin) ? requestOrigin : null;
	}

	if (typeof config === "string") {
		return config === requestOrigin ? requestOrigin : null;
	}

	if (Array.isArray(config)) {
		return config.includes(requestOrigin) ? requestOrigin : null;
	}

	return null;
}
