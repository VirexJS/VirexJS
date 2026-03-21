import { describe, expect, test } from "bun:test";
import { defineMiddleware, type MiddlewareContext, runMiddleware } from "../src/server/middleware";

function createCtx(url = "http://localhost/"): MiddlewareContext {
	return {
		request: new Request(url),
		params: {},
		locals: {},
	};
}

describe("runMiddleware", () => {
	test("calls final handler when no middlewares", async () => {
		const ctx = createCtx();
		const response = await runMiddleware([], ctx, async () => {
			return new Response("final");
		});
		expect(await response.text()).toBe("final");
	});

	test("middleware can call next and pass through", async () => {
		const middleware = defineMiddleware(async (_ctx, next) => {
			return next();
		});

		const ctx = createCtx();
		const response = await runMiddleware([middleware], ctx, async () => {
			return new Response("final");
		});
		expect(await response.text()).toBe("final");
	});

	test("middleware can short-circuit with own response", async () => {
		const middleware = defineMiddleware(async () => {
			return new Response("blocked", { status: 403 });
		});

		const ctx = createCtx();
		const response = await runMiddleware([middleware], ctx, async () => {
			return new Response("should not reach");
		});
		expect(response.status).toBe(403);
		expect(await response.text()).toBe("blocked");
	});

	test("middleware chain runs in order", async () => {
		const order: number[] = [];

		const m1 = defineMiddleware(async (_ctx, next) => {
			order.push(1);
			const res = await next();
			order.push(4);
			return res;
		});

		const m2 = defineMiddleware(async (_ctx, next) => {
			order.push(2);
			const res = await next();
			order.push(3);
			return res;
		});

		const ctx = createCtx();
		await runMiddleware([m1, m2], ctx, async () => {
			return new Response("done");
		});

		expect(order).toEqual([1, 2, 3, 4]);
	});

	test("middleware can set locals", async () => {
		const auth = defineMiddleware(async (ctx, next) => {
			ctx.locals.userId = "user-42";
			return next();
		});

		const ctx = createCtx();
		await runMiddleware([auth], ctx, async () => {
			return new Response("ok");
		});

		expect(ctx.locals.userId).toBe("user-42");
	});

	test("middleware can modify response headers", async () => {
		const cors = defineMiddleware(async (_ctx, next) => {
			const response = await next();
			response.headers.set("X-Custom", "virex");
			return response;
		});

		const ctx = createCtx();
		const response = await runMiddleware([cors], ctx, async () => {
			return new Response("ok");
		});

		expect(response.headers.get("X-Custom")).toBe("virex");
	});
});

describe("defineMiddleware", () => {
	test("returns the same function", () => {
		const fn = async () => new Response("ok");
		const result = defineMiddleware(fn);
		expect(result).toBe(fn);
	});
});
