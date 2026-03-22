import { gzipSync } from "node:zlib";

/**
 * Compression middleware — gzip responses for bandwidth savings.
 *
 * Automatically compresses text-based responses (HTML, JSON, CSS, JS, SVG)
 * when the client supports it via Accept-Encoding header.
 *
 * Usage (per-route):
 *   import { compress } from "virexjs";
 *
 *   export async function GET(ctx) {
 *     const data = await fetchLargeDataset();
 *     return compress(ctx.request, Response.json(data));
 *   }
 *
 * Usage (middleware):
 *   import { compressionMiddleware } from "virexjs";
 *   // Apply to all routes via middleware stack
 */

const COMPRESSIBLE_TYPES = new Set([
	"text/html",
	"text/plain",
	"text/css",
	"text/javascript",
	"application/json",
	"application/javascript",
	"application/xml",
	"image/svg+xml",
]);

const MIN_SIZE = 1024; // Don't compress responses smaller than 1KB

/**
 * Compress a response body with gzip if the client supports it.
 * Returns original response if compression isn't beneficial.
 */
export async function compress(request: Request, response: Response): Promise<Response> {
	// Check if client supports gzip
	const acceptEncoding = request.headers.get("Accept-Encoding") ?? "";
	if (!acceptEncoding.includes("gzip")) {
		return response;
	}

	// Only compress successful responses
	if (response.status !== 200) {
		return response;
	}

	// Check content type
	const contentType = response.headers.get("Content-Type") ?? "";
	const isCompressible = Array.from(COMPRESSIBLE_TYPES).some((t) => contentType.includes(t));
	if (!isCompressible) {
		return response;
	}

	// Read body
	const body = await response.clone().arrayBuffer();
	if (body.byteLength < MIN_SIZE) {
		return response;
	}

	// Compress
	const compressed = gzipSync(new Uint8Array(body));

	// Only use compressed version if it's actually smaller
	if (compressed.byteLength >= body.byteLength) {
		return response;
	}

	const headers = new Headers(response.headers);
	headers.set("Content-Encoding", "gzip");
	headers.set("Content-Length", String(compressed.byteLength));
	headers.delete("Content-Length"); // Let the runtime handle it
	headers.set("Vary", "Accept-Encoding");

	return new Response(compressed, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

/**
 * Compression middleware — automatically gzips all text responses.
 */
export function compressionMiddleware() {
	return async (
		ctx: { request: Request },
		next: () => Promise<Response>,
	): Promise<Response> => {
		const response = await next();
		return compress(ctx.request, response);
	};
}
