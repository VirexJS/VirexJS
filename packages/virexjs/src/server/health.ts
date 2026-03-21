import type { MiddlewareFn } from "./middleware";

/**
 * Health check middleware — responds to health check requests.
 *
 * Returns a JSON response with status and optional checks.
 * Useful for load balancers, Kubernetes probes, and monitoring.
 *
 * Usage:
 *   import { healthCheck } from "virexjs";
 *
 *   export default healthCheck({
 *     path: "/health",
 *     checks: {
 *       database: async () => { await db.query("SELECT 1"); return true; },
 *       cache: () => cache.size >= 0,
 *     },
 *   });
 */
export function healthCheck(options?: {
	/** URL path for health check. Default: "/health" */
	path?: string;
	/** Named health checks. Return true for healthy, false or throw for unhealthy. */
	checks?: Record<string, () => boolean | Promise<boolean>>;
}): MiddlewareFn {
	const { path = "/health", checks = {} } = options ?? {};

	return async (ctx, next) => {
		const url = new URL(ctx.request.url);

		if (url.pathname !== path) {
			return next();
		}

		const results: Record<string, { status: string; ms?: number }> = {};
		let allHealthy = true;

		for (const [name, check] of Object.entries(checks)) {
			const start = performance.now();
			try {
				const result = await check();
				const ms = Math.round(performance.now() - start);
				results[name] = { status: result ? "healthy" : "unhealthy", ms };
				if (!result) allHealthy = false;
			} catch {
				const ms = Math.round(performance.now() - start);
				results[name] = { status: "unhealthy", ms };
				allHealthy = false;
			}
		}

		const status = allHealthy ? 200 : 503;
		const body = {
			status: allHealthy ? "healthy" : "unhealthy",
			timestamp: new Date().toISOString(),
			uptime: Math.round(process.uptime()),
			checks: Object.keys(results).length > 0 ? results : undefined,
		};

		return new Response(JSON.stringify(body), {
			status,
			headers: { "Content-Type": "application/json" },
		});
	};
}
