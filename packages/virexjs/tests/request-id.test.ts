import { describe, test, expect } from "bun:test";
import { requestId } from "../src/server/request-id";
import { runMiddleware, type MiddlewareContext } from "../src/server/middleware";

function makeCtx(existingId?: string): MiddlewareContext {
	const headers = new Headers();
	if (existingId) headers.set("X-Request-ID", existingId);
	return {
		request: new Request("http://localhost/", { headers }),
		params: {},
		locals: {},
	};
}

describe("requestId", () => {
	test("generates a unique request ID", async () => {
		const ctx = makeCtx();
		const mw = requestId();
		const res = await runMiddleware([mw], ctx, async () => new Response("ok"));

		const id = res.headers.get("X-Request-ID");
		expect(id).toBeTruthy();
		expect(id!.length).toBe(36); // UUID-like format
		expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
	});

	test("reuses existing request ID from header", async () => {
		const ctx = makeCtx("existing-id-123");
		const mw = requestId();
		const res = await runMiddleware([mw], ctx, async () => new Response("ok"));

		expect(res.headers.get("X-Request-ID")).toBe("existing-id-123");
	});

	test("sets requestId on ctx.locals", async () => {
		const ctx = makeCtx();
		const mw = requestId();
		await runMiddleware([mw], ctx, async () => new Response("ok"));

		expect(ctx.locals.requestId).toBeTruthy();
		expect(typeof ctx.locals.requestId).toBe("string");
	});

	test("generates different IDs for different requests", async () => {
		const mw = requestId();
		const ctx1 = makeCtx();
		const ctx2 = makeCtx();

		const res1 = await runMiddleware([mw], ctx1, async () => new Response("ok"));
		const res2 = await runMiddleware([mw], ctx2, async () => new Response("ok"));

		expect(res1.headers.get("X-Request-ID")).not.toBe(res2.headers.get("X-Request-ID"));
	});

	test("custom header name", async () => {
		const ctx = makeCtx();
		const mw = requestId({ header: "X-Trace-ID" });
		const res = await runMiddleware([mw], ctx, async () => new Response("ok"));

		expect(res.headers.get("X-Trace-ID")).toBeTruthy();
		expect(res.headers.get("X-Request-ID")).toBeNull();
	});
});
