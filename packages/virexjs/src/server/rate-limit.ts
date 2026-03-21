import type { MiddlewareFn } from "./middleware";

/** Rate limiter configuration */
export interface RateLimitOptions {
	/** Maximum number of requests per window. Default: 100 */
	max?: number;
	/** Window duration in milliseconds. Default: 60000 (1 minute) */
	windowMs?: number;
	/** Response message when rate limit exceeded. Default: "Too Many Requests" */
	message?: string;
	/** HTTP status code when rate limited. Default: 429 */
	statusCode?: number;
	/** Key extractor — identifies the client. Default: IP-based */
	keyGenerator?: (request: Request) => string;
	/** Headers to include in responses. Default: true */
	headers?: boolean;
}

interface RateLimitEntry {
	count: number;
	resetTime: number;
}

/**
 * Create a rate limiting middleware.
 *
 * Usage:
 *   import { rateLimit } from "virexjs";
 *
 *   // In src/middleware/rate-limit.ts:
 *   export default rateLimit({ max: 100, windowMs: 60_000 });
 *
 *   // Strict API limiting:
 *   export default rateLimit({
 *     max: 10,
 *     windowMs: 60_000,
 *     keyGenerator: (req) => req.headers.get("Authorization") ?? "anon",
 *   });
 */
export function rateLimit(options: RateLimitOptions = {}): MiddlewareFn {
	const {
		max = 100,
		windowMs = 60_000,
		message = "Too Many Requests",
		statusCode = 429,
		keyGenerator = defaultKeyGenerator,
		headers = true,
	} = options;

	const store = new Map<string, RateLimitEntry>();

	// Cleanup expired entries periodically
	const cleanupInterval = Math.max(windowMs, 30_000);
	let lastCleanup = Date.now();

	return async (ctx, next) => {
		const now = Date.now();

		// Periodic cleanup
		if (now - lastCleanup > cleanupInterval) {
			lastCleanup = now;
			for (const [key, entry] of store) {
				if (now >= entry.resetTime) {
					store.delete(key);
				}
			}
		}

		const key = keyGenerator(ctx.request);
		let entry = store.get(key);

		if (!entry || now >= entry.resetTime) {
			entry = { count: 0, resetTime: now + windowMs };
			store.set(key, entry);
		}

		entry.count++;

		const remaining = Math.max(0, max - entry.count);
		const resetSeconds = Math.ceil((entry.resetTime - now) / 1000);

		if (entry.count > max) {
			const response = new Response(message, {
				status: statusCode,
				headers: { "Content-Type": "text/plain" },
			});

			if (headers) {
				response.headers.set("X-RateLimit-Limit", String(max));
				response.headers.set("X-RateLimit-Remaining", "0");
				response.headers.set("X-RateLimit-Reset", String(resetSeconds));
				response.headers.set("Retry-After", String(resetSeconds));
			}

			return response;
		}

		const response = await next();

		if (headers) {
			response.headers.set("X-RateLimit-Limit", String(max));
			response.headers.set("X-RateLimit-Remaining", String(remaining));
			response.headers.set("X-RateLimit-Reset", String(resetSeconds));
		}

		return response;
	};
}

/** Default key generator — uses client IP from headers or socket */
function defaultKeyGenerator(request: Request): string {
	// Check common proxy headers
	const forwarded = request.headers.get("X-Forwarded-For");
	if (forwarded) {
		return forwarded.split(",")[0]!.trim();
	}

	const realIp = request.headers.get("X-Real-IP");
	if (realIp) {
		return realIp;
	}

	// Fallback to a generic key
	return "default";
}
