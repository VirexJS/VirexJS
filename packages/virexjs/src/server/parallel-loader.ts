/**
 * Parallel data loading — run multiple data sources concurrently.
 *
 * Dashboard pages often need data from 3-4 sources. Sequential loading
 * is slow; this runs them all in parallel and merges results.
 *
 * Usage:
 *   export const loader = defineParallelLoader({
 *     user:    (ctx) => db.select("users").where({ id: ctx.params.id }),
 *     posts:   (ctx) => db.select("posts").where({ authorId: ctx.params.id }),
 *     stats:   () => fetch("/api/stats").then(r => r.json()),
 *   });
 *
 *   // In your page component:
 *   export default function Dashboard({ data }) {
 *     const { user, posts, stats } = data;
 *   }
 *
 * Error handling:
 *   By default, if any loader fails, the whole request fails.
 *   With { settled: true }, failed loaders return null and errors are logged.
 */

import type { LoaderContext, LoaderFn } from "../types/index";

type LoaderMap = Record<string, LoaderFn<unknown>>;

type LoaderResults<T extends LoaderMap> = {
	[K in keyof T]: Awaited<ReturnType<T[K]>>;
};

/**
 * Define a parallel loader that runs multiple data sources concurrently.
 * Returns a standard loader function compatible with VirexJS page exports.
 */
export function defineParallelLoader<T extends LoaderMap>(
	loaders: T,
	options?: { settled?: boolean },
): LoaderFn<LoaderResults<T>> {
	const keys = Object.keys(loaders);
	const fns = Object.values(loaders);

	return async (ctx: LoaderContext): Promise<LoaderResults<T>> => {
		if (options?.settled) {
			// Run all, collect results (null for failures)
			const results = await Promise.allSettled(fns.map((fn) => fn(ctx)));
			const data = {} as Record<string, unknown>;
			for (let i = 0; i < keys.length; i++) {
				const result = results[i]!;
				if (result.status === "fulfilled") {
					data[keys[i]!] = result.value;
				} else {
					data[keys[i]!] = null;
					console.error(`[VirexJS] Parallel loader "${keys[i]}" failed:`, result.reason);
				}
			}
			return data as LoaderResults<T>;
		}

		// Run all, fail fast if any throws
		const results = await Promise.all(fns.map((fn) => fn(ctx)));
		const data = {} as Record<string, unknown>;
		for (let i = 0; i < keys.length; i++) {
			data[keys[i]!] = results[i];
		}
		return data as LoaderResults<T>;
	};
}
