/**
 * In-memory cache with TTL support.
 *
 * Simple key-value cache for server-side data. Entries expire
 * automatically after the configured TTL.
 *
 * Usage:
 *   import { createCache } from "virexjs";
 *
 *   const cache = createCache<string>({ ttl: 60_000 }); // 1 minute TTL
 *   cache.set("key", "value");
 *   cache.get("key"); // "value"
 *
 *   // In a loader:
 *   const postsCache = createCache<Post[]>({ ttl: 300_000 }); // 5 min
 *   export async function loader() {
 *     let posts = postsCache.get("all");
 *     if (!posts) {
 *       posts = await fetchPosts();
 *       postsCache.set("all", posts);
 *     }
 *     return { posts };
 *   }
 */

interface CacheEntry<T> {
	value: T;
	expiresAt: number;
}

export interface Cache<T> {
	/** Get a value by key. Returns undefined if expired or not found. */
	get: (key: string) => T | undefined;
	/** Set a value with optional per-key TTL override (in ms). */
	set: (key: string, value: T, ttl?: number) => void;
	/** Delete a specific key. */
	delete: (key: string) => boolean;
	/** Check if a key exists and is not expired. */
	has: (key: string) => boolean;
	/** Clear all entries. */
	clear: () => void;
	/** Number of entries (including possibly expired). */
	readonly size: number;
	/** Get all keys. */
	keys: () => string[];
}

/**
 * Create a typed in-memory cache with TTL.
 */
export function createCache<T>(options?: {
	/** Default TTL in milliseconds. Default: 300_000 (5 minutes) */
	ttl?: number;
	/** Maximum number of entries. Oldest are evicted. Default: 1000 */
	maxSize?: number;
}): Cache<T> {
	const { ttl = 300_000, maxSize = 1000 } = options ?? {};
	const store = new Map<string, CacheEntry<T>>();

	function evictExpired(): void {
		const now = Date.now();
		for (const [key, entry] of store) {
			if (now >= entry.expiresAt) {
				store.delete(key);
			}
		}
	}

	function evictOldest(): void {
		if (store.size <= maxSize) return;
		// Map preserves insertion order — delete the first entry
		const firstKey = store.keys().next().value;
		if (firstKey !== undefined) {
			store.delete(firstKey);
		}
	}

	return {
		get(key: string): T | undefined {
			const entry = store.get(key);
			if (!entry) return undefined;
			if (Date.now() >= entry.expiresAt) {
				store.delete(key);
				return undefined;
			}
			return entry.value;
		},

		set(key: string, value: T, entryTtl?: number): void {
			store.set(key, {
				value,
				expiresAt: Date.now() + (entryTtl ?? ttl),
			});
			evictOldest();
		},

		delete(key: string): boolean {
			return store.delete(key);
		},

		has(key: string): boolean {
			const entry = store.get(key);
			if (!entry) return false;
			if (Date.now() >= entry.expiresAt) {
				store.delete(key);
				return false;
			}
			return true;
		},

		clear(): void {
			store.clear();
		},

		get size(): number {
			evictExpired();
			return store.size;
		},

		keys(): string[] {
			evictExpired();
			return Array.from(store.keys());
		},
	};
}
