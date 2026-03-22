/**
 * ETag middleware for automatic conditional responses.
 *
 * Generates weak ETags for response bodies and returns 304 Not Modified
 * when the client's If-None-Match header matches — saving bandwidth.
 *
 * Usage (per-route):
 *   import { withETag } from "virexjs";
 *
 *   export async function GET(ctx) {
 *     const data = await db.select("posts").all();
 *     return withETag(ctx.request, Response.json(data));
 *   }
 *
 * Usage (middleware):
 *   import { etagMiddleware } from "virexjs";
 *   // Apply to all routes via middleware stack
 */

import { createHash } from "node:crypto";

/**
 * Add ETag to a response and check If-None-Match for 304.
 * Returns original response with ETag header, or 304 if client cache is fresh.
 */
export async function withETag(request: Request, response: Response): Promise<Response> {
	// Only ETag successful GET responses
	if (request.method !== "GET" || response.status !== 200) {
		return response;
	}

	// Clone body for reading (so original response is still consumable)
	const body = await response.clone().arrayBuffer();
	const hash = createHash("md5").update(new Uint8Array(body)).digest("hex");
	const etag = `W/"${hash}"`;

	// Check If-None-Match
	const ifNoneMatch = request.headers.get("If-None-Match");
	if (ifNoneMatch === etag) {
		return new Response(null, {
			status: 304,
			headers: {
				ETag: etag,
				"Cache-Control": response.headers.get("Cache-Control") ?? "",
			},
		});
	}

	// Add ETag to response
	const headers = new Headers(response.headers);
	headers.set("ETag", etag);

	return new Response(body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

/**
 * ETag middleware — automatically adds ETags to all GET responses.
 * For use in the middleware pipeline.
 */
export function etagMiddleware() {
	return async (
		ctx: { request: Request },
		next: () => Promise<Response>,
	): Promise<Response> => {
		const response = await next();
		return withETag(ctx.request, response);
	};
}
