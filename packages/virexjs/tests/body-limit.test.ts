import { describe, test, expect } from "bun:test";
import { bodyLimit } from "../src/server/body-limit";
import { runMiddleware, type MiddlewareContext } from "../src/server/middleware";

function makeCtx(method: string, body?: string, contentLength?: string): MiddlewareContext {
	const headers = new Headers();
	if (contentLength) headers.set("Content-Length", contentLength);
	if (body) headers.set("Content-Type", "application/json");

	return {
		request: new Request("http://localhost/api/upload", {
			method,
			headers,
			body: method !== "GET" ? body : undefined,
		}),
		params: {},
		locals: {},
	};
}

describe("bodyLimit", () => {
	test("GET requests pass through", async () => {
		const mw = bodyLimit({ maxSize: 10 });
		const ctx = makeCtx("GET");
		const res = await runMiddleware([mw], ctx, async () => new Response("ok"));
		expect(res.status).toBe(200);
	});

	test("small POST passes", async () => {
		const mw = bodyLimit({ maxSize: 1000 });
		const body = JSON.stringify({ name: "test" });
		const ctx = makeCtx("POST", body, String(body.length));
		const res = await runMiddleware([mw], ctx, async () => new Response("ok"));
		expect(res.status).toBe(200);
	});

	test("large POST rejected by Content-Length header", async () => {
		const mw = bodyLimit({ maxSize: 100 });
		const ctx = makeCtx("POST", undefined, "5000");
		const res = await runMiddleware([mw], ctx, async () => new Response("ok"));
		expect(res.status).toBe(413);
		expect(await res.text()).toBe("Payload Too Large");
	});

	test("custom status code", async () => {
		const mw = bodyLimit({ maxSize: 10, statusCode: 400 });
		const ctx = makeCtx("POST", undefined, "5000");
		const res = await runMiddleware([mw], ctx, async () => new Response("ok"));
		expect(res.status).toBe(400);
	});

	test("custom error message", async () => {
		const mw = bodyLimit({ maxSize: 10, message: "Too big!" });
		const ctx = makeCtx("POST", undefined, "5000");
		const res = await runMiddleware([mw], ctx, async () => new Response("ok"));
		expect(await res.text()).toBe("Too big!");
	});

	test("PUT also checked by default", async () => {
		const mw = bodyLimit({ maxSize: 10 });
		const ctx = makeCtx("PUT", undefined, "5000");
		const res = await runMiddleware([mw], ctx, async () => new Response("ok"));
		expect(res.status).toBe(413);
	});

	test("DELETE not checked by default", async () => {
		const mw = bodyLimit({ maxSize: 10 });
		const headers = new Headers({ "Content-Length": "5000" });
		const ctx: MiddlewareContext = {
			request: new Request("http://localhost/api/data", { method: "DELETE", headers }),
			params: {},
			locals: {},
		};
		const res = await runMiddleware([mw], ctx, async () => new Response("ok"));
		expect(res.status).toBe(200);
	});

	test("exact limit passes", async () => {
		const body = "x".repeat(100);
		const mw = bodyLimit({ maxSize: 100 });
		const ctx = makeCtx("POST", body, "100");
		const res = await runMiddleware([mw], ctx, async () => new Response("ok"));
		expect(res.status).toBe(200);
	});

	test("one over limit rejected", async () => {
		const mw = bodyLimit({ maxSize: 100 });
		const ctx = makeCtx("POST", undefined, "101");
		const res = await runMiddleware([mw], ctx, async () => new Response("ok"));
		expect(res.status).toBe(413);
	});
});
