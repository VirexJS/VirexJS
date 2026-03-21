import type { MiddlewareFn } from "./middleware";

/**
 * Request body size limiter middleware.
 *
 * Rejects requests with bodies larger than the configured limit.
 * Prevents DoS attacks via oversized payloads.
 *
 * Usage:
 *   import { bodyLimit } from "virexjs";
 *
 *   // Limit all requests to 1MB
 *   export default bodyLimit({ maxSize: 1_048_576 });
 *
 *   // Limit to 100KB with custom message
 *   export default bodyLimit({
 *     maxSize: 102_400,
 *     message: "Request too large",
 *   });
 */
export function bodyLimit(options?: {
	/** Maximum body size in bytes. Default: 1_048_576 (1MB) */
	maxSize?: number;
	/** HTTP status code for rejection. Default: 413 */
	statusCode?: number;
	/** Error message. Default: "Payload Too Large" */
	message?: string;
	/** Methods to check. Default: POST, PUT, PATCH */
	methods?: string[];
}): MiddlewareFn {
	const {
		maxSize = 1_048_576,
		statusCode = 413,
		message = "Payload Too Large",
		methods = ["POST", "PUT", "PATCH"],
	} = options ?? {};

	const methodSet = new Set(methods);

	return async (ctx, next) => {
		if (!methodSet.has(ctx.request.method)) {
			return next();
		}

		// Check Content-Length header first (fast path)
		const contentLength = ctx.request.headers.get("Content-Length");
		if (contentLength) {
			const size = Number.parseInt(contentLength, 10);
			if (!Number.isNaN(size) && size > maxSize) {
				return new Response(message, {
					status: statusCode,
					headers: { "Content-Type": "text/plain" },
				});
			}
		}

		// For chunked/unknown length, read and check
		if (!contentLength && ctx.request.body) {
			const reader = ctx.request.body.getReader();
			const chunks: Uint8Array[] = [];
			let totalSize = 0;

			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					totalSize += value.byteLength;
					if (totalSize > maxSize) {
						reader.cancel();
						return new Response(message, {
							status: statusCode,
							headers: { "Content-Type": "text/plain" },
						});
					}
					chunks.push(value);
				}
			} catch {
				return new Response("Bad Request", { status: 400 });
			}

			// Reconstruct request with buffered body
			const body = new Uint8Array(totalSize);
			let offset = 0;
			for (const chunk of chunks) {
				body.set(chunk, offset);
				offset += chunk.byteLength;
			}

			// Replace request with buffered version
			const newRequest = new Request(ctx.request.url, {
				method: ctx.request.method,
				headers: ctx.request.headers,
				body,
			});
			ctx.request = newRequest;
		}

		return next();
	};
}
