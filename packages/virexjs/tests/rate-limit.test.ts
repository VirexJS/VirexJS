import { describe, expect, test } from "bun:test";
import { type MiddlewareContext, runMiddleware } from "../src/server/middleware";
import { rateLimit } from "../src/server/rate-limit";

function makeCtx(ip?: string): MiddlewareContext {
	const headers = new Headers();
	if (ip) headers.set("X-Forwarded-For", ip);
	return {
		request: new Request("http://localhost/api/test", { headers }),
		params: {},
		locals: {},
	};
}

// ─── Basic rate limiting ────────────────────────────────────────────────────

describe("rateLimit", () => {
	test("allows requests under the limit", async () => {
		const mw = rateLimit({ max: 5, windowMs: 60_000 });

		for (let i = 0; i < 5; i++) {
			const res = await runMiddleware([mw], makeCtx("1.2.3.4"), async () => new Response("ok"));
			expect(res.status).toBe(200);
		}
	});

	test("blocks requests over the limit", async () => {
		const mw = rateLimit({ max: 3, windowMs: 60_000 });

		for (let i = 0; i < 3; i++) {
			await runMiddleware([mw], makeCtx("5.6.7.8"), async () => new Response("ok"));
		}

		const blocked = await runMiddleware([mw], makeCtx("5.6.7.8"), async () => new Response("ok"));
		expect(blocked.status).toBe(429);
		const text = await blocked.text();
		expect(text).toBe("Too Many Requests");
	});

	test("different keys have separate limits", async () => {
		const mw = rateLimit({
			max: 2,
			windowMs: 60_000,
			keyGenerator: (req) => req.headers.get("X-Client-ID") ?? "anon",
		});

		const ctxA = (): MiddlewareContext => ({
			request: new Request("http://localhost/", { headers: { "X-Client-ID": "client-a" } }),
			params: {},
			locals: {},
		});
		const ctxB = (): MiddlewareContext => ({
			request: new Request("http://localhost/", { headers: { "X-Client-ID": "client-b" } }),
			params: {},
			locals: {},
		});

		// Client A: 2 requests
		await runMiddleware([mw], ctxA(), async () => new Response("ok"));
		await runMiddleware([mw], ctxA(), async () => new Response("ok"));

		// Client A: blocked
		const blockedA = await runMiddleware([mw], ctxA(), async () => new Response("ok"));
		expect(blockedA.status).toBe(429);

		// Client B: still allowed
		const allowedB = await runMiddleware([mw], ctxB(), async () => new Response("ok"));
		expect(allowedB.status).toBe(200);
	});
});

// ─── Headers ────────────────────────────────────────────────────────────────

describe("rate limit headers", () => {
	test("includes rate limit headers", async () => {
		const mw = rateLimit({ max: 10, windowMs: 60_000 });
		const res = await runMiddleware([mw], makeCtx("20.0.0.1"), async () => new Response("ok"));

		expect(res.headers.get("X-RateLimit-Limit")).toBe("10");
		expect(res.headers.get("X-RateLimit-Remaining")).toBe("9");
		expect(res.headers.get("X-RateLimit-Reset")).toBeDefined();
	});

	test("remaining decrements", async () => {
		const mw = rateLimit({ max: 5, windowMs: 60_000 });

		const r1 = await runMiddleware([mw], makeCtx("30.0.0.1"), async () => new Response("ok"));
		expect(r1.headers.get("X-RateLimit-Remaining")).toBe("4");

		const r2 = await runMiddleware([mw], makeCtx("30.0.0.1"), async () => new Response("ok"));
		expect(r2.headers.get("X-RateLimit-Remaining")).toBe("3");
	});

	test("blocked response includes Retry-After", async () => {
		const mw = rateLimit({ max: 1, windowMs: 60_000 });

		await runMiddleware([mw], makeCtx("40.0.0.1"), async () => new Response("ok"));
		const blocked = await runMiddleware([mw], makeCtx("40.0.0.1"), async () => new Response("ok"));

		expect(blocked.headers.get("Retry-After")).toBeDefined();
		expect(Number(blocked.headers.get("Retry-After"))).toBeGreaterThan(0);
	});

	test("headers disabled when headers: false", async () => {
		const mw = rateLimit({ max: 10, windowMs: 60_000, headers: false });
		const res = await runMiddleware([mw], makeCtx("50.0.0.1"), async () => new Response("ok"));

		expect(res.headers.get("X-RateLimit-Limit")).toBeNull();
		expect(res.headers.get("X-RateLimit-Remaining")).toBeNull();
	});
});

// ─── Custom options ─────────────────────────────────────────────────────────

describe("rate limit custom options", () => {
	test("custom message", async () => {
		const mw = rateLimit({ max: 1, windowMs: 60_000, message: "Slow down!" });

		await runMiddleware([mw], makeCtx("60.0.0.1"), async () => new Response("ok"));
		const blocked = await runMiddleware([mw], makeCtx("60.0.0.1"), async () => new Response("ok"));

		expect(await blocked.text()).toBe("Slow down!");
	});

	test("custom status code", async () => {
		const mw = rateLimit({ max: 1, windowMs: 60_000, statusCode: 503 });

		await runMiddleware([mw], makeCtx("70.0.0.1"), async () => new Response("ok"));
		const blocked = await runMiddleware([mw], makeCtx("70.0.0.1"), async () => new Response("ok"));

		expect(blocked.status).toBe(503);
	});

	test("custom key generator", async () => {
		const mw = rateLimit({
			max: 2,
			windowMs: 60_000,
			keyGenerator: (req) => req.headers.get("X-API-Key") ?? "anon",
		});

		const headers1 = new Headers({ "X-API-Key": "key-a" });
		const headers2 = new Headers({ "X-API-Key": "key-b" });

		const ctx1 = {
			request: new Request("http://localhost/", { headers: headers1 }),
			params: {},
			locals: {},
		};
		const ctx2 = {
			request: new Request("http://localhost/", { headers: headers2 }),
			params: {},
			locals: {},
		};

		// key-a: 2 requests
		await runMiddleware([mw], ctx1, async () => new Response("ok"));
		await runMiddleware([mw], ctx1, async () => new Response("ok"));

		// key-a: blocked
		const blocked = await runMiddleware([mw], ctx1, async () => new Response("ok"));
		expect(blocked.status).toBe(429);

		// key-b: still allowed
		const allowed = await runMiddleware([mw], ctx2, async () => new Response("ok"));
		expect(allowed.status).toBe(200);
	});
});
