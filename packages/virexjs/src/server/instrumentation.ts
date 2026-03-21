/**
 * Instrumentation — request tracing and performance metrics.
 *
 * Like Next.js instrumentation.ts but built-in.
 * Tracks request duration, status codes, error rates.
 *
 * Usage:
 *   import { createInstrumentation } from "virexjs";
 *
 *   const metrics = createInstrumentation();
 *
 *   // Use as middleware
 *   export default metrics.middleware();
 *
 *   // Get metrics
 *   const stats = metrics.getStats();
 *   // { totalRequests, avgResponseTime, errorRate, ... }
 */

export interface RequestMetric {
	path: string;
	method: string;
	status: number;
	duration: number;
	timestamp: number;
}

export interface MetricsStats {
	totalRequests: number;
	avgResponseTime: number;
	errorRate: number;
	statusCodes: Record<number, number>;
	slowestPaths: Array<{ path: string; avgMs: number; count: number }>;
	requestsPerMinute: number;
	uptime: number;
}

export interface Instrumentation {
	/** Middleware that tracks all requests */
	middleware: () => import("../server/middleware").MiddlewareFn;
	/** Get aggregated metrics */
	getStats: () => MetricsStats;
	/** Get recent requests (last N) */
	getRecent: (limit?: number) => RequestMetric[];
	/** Reset all metrics */
	reset: () => void;
}

/**
 * Create an instrumentation instance for request tracking.
 */
export function createInstrumentation(options?: {
	/** Max stored request metrics. Default: 10000 */
	maxHistory?: number;
}): Instrumentation {
	const { maxHistory = 10_000 } = options ?? {};
	const history: RequestMetric[] = [];
	const startTime = Date.now();

	return {
		middleware() {
			return async (ctx, next) => {
				const start = performance.now();
				const url = new URL(ctx.request.url);

				const response = await next();

				const duration = performance.now() - start;
				const metric: RequestMetric = {
					path: url.pathname,
					method: ctx.request.method,
					status: response.status,
					duration: Math.round(duration * 100) / 100,
					timestamp: Date.now(),
				};

				history.push(metric);
				if (history.length > maxHistory) {
					history.shift();
				}

				return response;
			};
		},

		getStats(): MetricsStats {
			const total = history.length;
			if (total === 0) {
				return {
					totalRequests: 0,
					avgResponseTime: 0,
					errorRate: 0,
					statusCodes: {},
					slowestPaths: [],
					requestsPerMinute: 0,
					uptime: Math.round((Date.now() - startTime) / 1000),
				};
			}

			const totalDuration = history.reduce((sum, m) => sum + m.duration, 0);
			const errors = history.filter((m) => m.status >= 500).length;

			// Status code distribution
			const statusCodes: Record<number, number> = {};
			for (const m of history) {
				statusCodes[m.status] = (statusCodes[m.status] ?? 0) + 1;
			}

			// Slowest paths (aggregated)
			const pathStats = new Map<string, { total: number; count: number }>();
			for (const m of history) {
				const existing = pathStats.get(m.path) ?? { total: 0, count: 0 };
				existing.total += m.duration;
				existing.count++;
				pathStats.set(m.path, existing);
			}

			const slowestPaths = Array.from(pathStats.entries())
				.map(([path, stats]) => ({
					path,
					avgMs: Math.round((stats.total / stats.count) * 100) / 100,
					count: stats.count,
				}))
				.sort((a, b) => b.avgMs - a.avgMs)
				.slice(0, 10);

			// Requests per minute (last minute)
			const oneMinuteAgo = Date.now() - 60_000;
			const recentCount = history.filter((m) => m.timestamp > oneMinuteAgo).length;

			return {
				totalRequests: total,
				avgResponseTime: Math.round((totalDuration / total) * 100) / 100,
				errorRate: Math.round((errors / total) * 10000) / 100,
				statusCodes,
				slowestPaths,
				requestsPerMinute: recentCount,
				uptime: Math.round((Date.now() - startTime) / 1000),
			};
		},

		getRecent(limit = 50) {
			return history.slice(-limit).reverse();
		},

		reset() {
			history.length = 0;
		},
	};
}
