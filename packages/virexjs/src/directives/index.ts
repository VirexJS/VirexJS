/**
 * VirexJS Directives — inspired by Next.js but more powerful.
 *
 * "use client"  → Component hydrates on the client (alias for "use island")
 * "use server"  → Function runs only on the server, callable from client via RPC
 * "use cache"   → Response cached with ISR (stale-while-revalidate)
 *
 * Usage:
 *   // Component directive (top of file)
 *   "use client";
 *   export default function Counter() { ... }
 *
 *   // Function directive
 *   async function saveUser(data) {
 *     "use server";
 *     return await db.insert(data);
 *   }
 *
 *   // Cache directive (in loader)
 *   export async function loader(ctx) {
 *     "use cache";
 *     return await fetchExpensiveData();
 *   }
 */

import { readFileSync } from "node:fs";
import { getISRCache, markRevalidating, needsRevalidation, setISRCache } from "../server/isr";

/** Check if a file has a specific directive at the top */
export function hasDirective(filePath: string, directive: string): boolean {
	try {
		const content = readFileSync(filePath, "utf-8");
		// Check first 5 lines for the directive
		const lines = content.split("\n").slice(0, 5);
		for (const line of lines) {
			const trimmed = line.trim();
			if (
				trimmed === `"${directive}";` ||
				trimmed === `'${directive}';` ||
				trimmed === `"${directive}"` ||
				trimmed === `'${directive}'` ||
				trimmed === `// "${directive}"`
			) {
				return true;
			}
		}
		return false;
	} catch {
		return false;
	}
}

/** Check if file is a client component ("use client" or "use island") */
export function isClientComponent(filePath: string): boolean {
	return hasDirective(filePath, "use client") || hasDirective(filePath, "use island");
}

/** Check if file has "use cache" directive */
export function isCachedPage(filePath: string): boolean {
	return hasDirective(filePath, "use cache");
}

/**
 * Extract revalidate time from a module's exports.
 * Pages can export `const revalidate = 60;` for ISR.
 */
export function getRevalidateTime(mod: Record<string, unknown>): number | null {
	const val = mod.revalidate;
	if (typeof val === "number" && val > 0) {
		return val;
	}
	return null;
}

/**
 * Wrap a handler with ISR caching.
 * Returns cached response if available, otherwise renders and caches.
 */
export async function withCache(
	path: string,
	revalidateSeconds: number,
	render: () => Promise<Response>,
): Promise<Response> {
	// Try cache first
	const cached = getISRCache(path);
	if (cached) {
		// If stale, trigger background revalidation
		if (needsRevalidation(path)) {
			markRevalidating(path);
			// Background revalidation — don't await
			render()
				.then(async (res) => {
					const html = await res.text();
					setISRCache(path, html, revalidateSeconds, res.status);
				})
				.catch(() => {
					/* revalidation failed, keep stale */
				});
		}
		return cached;
	}

	// No cache — render and store
	const response = await render();
	const html = await response.text();
	setISRCache(path, html, revalidateSeconds, response.status);

	// Return fresh response
	return new Response(html, {
		status: response.status,
		headers: {
			...Object.fromEntries(response.headers.entries()),
			"X-VirexJS-Cache": "MISS",
		},
	});
}

/**
 * Create a server action wrapper.
 * Server actions can be called from the client via fetch POST.
 *
 * Usage:
 *   const saveUser = serverAction(async (data) => {
 *     return await db.insert(data);
 *   });
 *
 *   // Client calls: POST /api/__actions/saveUser
 */
export function serverAction<T, R>(fn: (input: T) => Promise<R>): (input: T) => Promise<R> {
	// On server: just call the function directly
	return fn;
}

/**
 * Register server actions for RPC-style calling from client.
 */
const actionRegistry = new Map<string, (input: unknown) => Promise<unknown>>();

export function registerAction(name: string, fn: (input: unknown) => Promise<unknown>): void {
	actionRegistry.set(name, fn);
}

export function getAction(name: string): ((input: unknown) => Promise<unknown>) | undefined {
	return actionRegistry.get(name);
}

export function listActions(): string[] {
	return Array.from(actionRegistry.keys());
}
