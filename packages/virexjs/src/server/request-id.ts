import type { MiddlewareFn } from "./middleware";

/**
 * Request ID middleware — assigns a unique ID to each request.
 *
 * Sets `X-Request-ID` header on the response and `ctx.locals.requestId`.
 * Reuses the incoming `X-Request-ID` header if present (from reverse proxy).
 *
 * Usage:
 *   import { requestId } from "virexjs";
 *   export default requestId();
 */
export function requestId(options?: {
	/** Header name. Default: "X-Request-ID" */
	header?: string;
}): MiddlewareFn {
	const headerName = options?.header ?? "X-Request-ID";

	return async (ctx, next) => {
		const id = ctx.request.headers.get(headerName) ?? generateId();
		ctx.locals.requestId = id;

		const response = await next();
		response.headers.set(headerName, id);
		return response;
	};
}

function generateId(): string {
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	// Format as UUID-like: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
	const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
