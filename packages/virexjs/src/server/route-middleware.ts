import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import type { MiddlewareFn } from "./middleware";

/**
 * Per-route middleware — auto-discovered from `_middleware.ts` files.
 *
 * Like Next.js middleware.ts but more powerful:
 * - Place `_middleware.ts` in any page directory
 * - Applies to all pages in that directory and subdirectories
 * - Multiple middleware files stack (parent → child order)
 * - Standard VirexJS middleware signature
 *
 * Example:
 *   src/pages/admin/_middleware.ts  → applies to /admin/*
 *   src/pages/_middleware.ts        → applies to all pages
 *
 * Each file exports a default middleware:
 *   export default defineMiddleware(async (ctx, next) => {
 *     if (!ctx.locals.user) return redirect("/login");
 *     return next();
 *   });
 */

const middlewareCache = new Map<string, MiddlewareFn | null>();

/**
 * Find and load route-specific middleware for a page file path.
 * Walks up from the page directory looking for _middleware.ts files.
 * Returns middleware in parent-first order.
 */
export async function loadRouteMiddleware(pageFilePath: string): Promise<MiddlewareFn[]> {
	const middlewares: MiddlewareFn[] = [];
	let dir = dirname(pageFilePath);
	const dirs: string[] = [];
	const maxDepth = 10;

	// Collect directories from page up to root
	for (let i = 0; i < maxDepth; i++) {
		dirs.unshift(dir); // prepend for parent-first order
		const parent = dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}

	// Load middleware from each directory
	for (const d of dirs) {
		const mwPath = join(d, "_middleware.ts");
		let mw = middlewareCache.get(mwPath);

		if (mw === undefined) {
			if (existsSync(mwPath)) {
				try {
					const mod = await import(mwPath);
					mw = (mod.default ?? null) as MiddlewareFn | null;
				} catch {
					mw = null;
				}
			} else {
				mw = null;
			}
			middlewareCache.set(mwPath, mw);
		}

		if (mw) middlewares.push(mw);
	}

	return middlewares;
}
