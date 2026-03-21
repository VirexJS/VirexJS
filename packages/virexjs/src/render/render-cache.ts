/**
 * Component render cache — memoizes renderToString results for
 * pure components that receive the same props.
 *
 * Useful for expensive server components (large lists, data tables).
 *
 * Usage:
 *   import { cachedRender } from "virexjs";
 *
 *   const html = cachedRender("user-list", props, () => {
 *     return h("ul", null, ...users.map(u => h("li", null, u.name)));
 *   });
 */

import type { VNode } from "./jsx";
import { renderToString } from "./jsx";

interface CacheEntry {
	html: string;
	propsHash: string;
	createdAt: number;
}

const cache = new Map<string, CacheEntry>();
const MAX_ENTRIES = 500;
const DEFAULT_TTL = 60_000; // 1 minute

/**
 * Render a VNode with caching. Returns cached HTML if props haven't changed.
 */
export function cachedRender(
	key: string,
	props: Record<string, unknown>,
	render: () => VNode,
	ttl = DEFAULT_TTL,
): string {
	const propsHash = hashProps(props);
	const entry = cache.get(key);

	if (entry && entry.propsHash === propsHash && Date.now() - entry.createdAt < ttl) {
		return entry.html;
	}

	const vnode = render();
	const html = renderToString(vnode);

	cache.set(key, { html, propsHash, createdAt: Date.now() });

	// Evict oldest if over limit
	if (cache.size > MAX_ENTRIES) {
		const firstKey = cache.keys().next().value;
		if (firstKey !== undefined) cache.delete(firstKey);
	}

	return html;
}

/** Clear the render cache */
export function clearRenderCache(): void {
	cache.clear();
}

/** Get cache stats */
export function renderCacheStats(): { size: number; keys: string[] } {
	return { size: cache.size, keys: Array.from(cache.keys()) };
}

function hashProps(props: Record<string, unknown>): string {
	const str = JSON.stringify(props);
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
	}
	return hash.toString(36);
}
