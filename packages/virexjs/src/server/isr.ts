/**
 * Incremental Static Regeneration (ISR) for VirexJS.
 *
 * Like Next.js revalidate but simpler and more efficient:
 * - Cache rendered HTML with a TTL
 * - Serve stale content instantly while revalidating in background
 * - No build step required — works in dev and production
 *
 * Usage in a page:
 *   export const revalidate = 60; // revalidate every 60 seconds
 *
 *   export async function loader(ctx) {
 *     return await fetchExpensiveData();
 *   }
 *
 * Or use the ISR cache directly:
 *   import { isrCache } from "virexjs";
 *   const html = isrCache.get("/blog/post-1");
 */

interface ISREntry {
	html: string;
	headers: Record<string, string>;
	status: number;
	createdAt: number;
	revalidateAfter: number;
	revalidating: boolean;
}

const cache = new Map<string, ISREntry>();

/**
 * Get a cached response for a path, or null if not cached/expired.
 * Returns stale content while revalidating in background.
 */
export function getISRCache(path: string): Response | null {
	const entry = cache.get(path);
	if (!entry) return null;

	const now = Date.now();
	const isStale = now >= entry.revalidateAfter;

	// Return cached content (even if stale — SWR pattern)
	const response = new Response(entry.html, {
		status: entry.status,
		headers: {
			"Content-Type": "text/html; charset=utf-8",
			...entry.headers,
			"X-VirexJS-Cache": isStale ? "STALE" : "HIT",
			"X-VirexJS-Age": String(Math.round((now - entry.createdAt) / 1000)),
		},
	});

	return response;
}

/**
 * Check if a cached entry needs background revalidation.
 */
export function needsRevalidation(path: string): boolean {
	const entry = cache.get(path);
	if (!entry) return false;
	if (entry.revalidating) return false;
	return Date.now() >= entry.revalidateAfter;
}

/**
 * Mark a path as currently revalidating (prevents duplicate revalidations).
 */
export function markRevalidating(path: string): void {
	const entry = cache.get(path);
	if (entry) entry.revalidating = true;
}

/**
 * Store a rendered response in the ISR cache.
 */
export function setISRCache(
	path: string,
	html: string,
	revalidateSeconds: number,
	status = 200,
	headers: Record<string, string> = {},
): void {
	cache.set(path, {
		html,
		headers,
		status,
		createdAt: Date.now(),
		revalidateAfter: Date.now() + revalidateSeconds * 1000,
		revalidating: false,
	});
}

/**
 * Invalidate a specific path or pattern.
 */
export function invalidateISR(pathOrPattern: string | RegExp): number {
	let count = 0;
	if (typeof pathOrPattern === "string") {
		if (cache.delete(pathOrPattern)) count++;
	} else {
		for (const key of cache.keys()) {
			if (pathOrPattern.test(key)) {
				cache.delete(key);
				count++;
			}
		}
	}
	return count;
}

/** Get ISR cache stats */
export function getISRStats(): { entries: number; paths: string[] } {
	return {
		entries: cache.size,
		paths: Array.from(cache.keys()),
	};
}
