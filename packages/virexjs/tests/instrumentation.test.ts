import { describe, expect, test } from "bun:test";
import { createInstrumentation } from "../src/server/instrumentation";
import { runMiddleware } from "../src/server/middleware";

describe("createInstrumentation", () => {
	test("tracks requests via middleware", async () => {
		const metrics = createInstrumentation();
		const mw = metrics.middleware();

		const ctx = {
			request: new Request("http://localhost/test"),
			params: {},
			locals: {},
		};

		await runMiddleware([mw], ctx, async () => new Response("ok"));

		const stats = metrics.getStats();
		expect(stats.totalRequests).toBe(1);
		expect(stats.avgResponseTime).toBeGreaterThanOrEqual(0);
	});

	test("tracks status codes", async () => {
		const metrics = createInstrumentation();
		const mw = metrics.middleware();

		const ctx = { request: new Request("http://localhost/"), params: {}, locals: {} };
		await runMiddleware([mw], ctx, async () => new Response("ok", { status: 200 }));
		await runMiddleware([mw], ctx, async () => new Response("err", { status: 500 }));

		const stats = metrics.getStats();
		expect(stats.statusCodes[200]).toBe(1);
		expect(stats.statusCodes[500]).toBe(1);
		expect(stats.errorRate).toBeGreaterThan(0);
	});

	test("getRecent returns latest requests", async () => {
		const metrics = createInstrumentation();
		const mw = metrics.middleware();

		for (let i = 0; i < 5; i++) {
			const ctx = {
				request: new Request(`http://localhost/page-${i}`),
				params: {},
				locals: {},
			};
			await runMiddleware([mw], ctx, async () => new Response("ok"));
		}

		const recent = metrics.getRecent(3);
		expect(recent).toHaveLength(3);
		expect(recent[0]!.path).toBe("/page-4"); // most recent first
	});

	test("reset clears metrics", async () => {
		const metrics = createInstrumentation();
		const mw = metrics.middleware();
		const ctx = { request: new Request("http://localhost/"), params: {}, locals: {} };
		await runMiddleware([mw], ctx, async () => new Response("ok"));

		metrics.reset();
		expect(metrics.getStats().totalRequests).toBe(0);
	});

	test("slowestPaths aggregates by path", async () => {
		const metrics = createInstrumentation();
		const mw = metrics.middleware();

		for (let i = 0; i < 3; i++) {
			const ctx = { request: new Request("http://localhost/slow"), params: {}, locals: {} };
			await runMiddleware([mw], ctx, async () => new Response("ok"));
		}

		const stats = metrics.getStats();
		expect(stats.slowestPaths.length).toBeGreaterThanOrEqual(1);
		expect(stats.slowestPaths[0]!.count).toBe(3);
	});

	test("uptime increases", () => {
		const metrics = createInstrumentation();
		expect(metrics.getStats().uptime).toBeGreaterThanOrEqual(0);
	});
});
