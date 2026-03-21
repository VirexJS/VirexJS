import { describe, test, expect } from "bun:test";
import { defineAction, actionRedirect, actionJson, parseFormData } from "../src/server/action";

describe("defineAction", () => {
	test("returns the handler function", () => {
		const handler = defineAction(async () => ({ success: true }));
		expect(typeof handler).toBe("function");
	});

	test("handler receives context", async () => {
		const handler = defineAction(async (ctx) => {
			return { method: ctx.request.method };
		});

		const result = await handler({
			request: new Request("http://localhost/", { method: "POST" }),
			params: {},
			locals: {},
		});
		expect(result).toEqual({ method: "POST" });
	});

	test("handler can return Response", async () => {
		const handler = defineAction(async () => {
			return new Response("redirect", { status: 302 });
		});

		const result = await handler({
			request: new Request("http://localhost/", { method: "POST" }),
			params: {},
			locals: {},
		});
		expect(result).toBeInstanceOf(Response);
	});
});

describe("actionRedirect", () => {
	test("creates redirect with default 303", () => {
		const res = actionRedirect("/success");
		expect(res.status).toBe(303);
		expect(res.headers.get("Location")).toBe("/success");
	});

	test("creates redirect with custom status", () => {
		const res = actionRedirect("/home", 301);
		expect(res.status).toBe(301);
	});
});

describe("actionJson", () => {
	test("creates JSON response", async () => {
		const res = actionJson({ ok: true, count: 5 });
		expect(res.headers.get("Content-Type")).toBe("application/json");
		const body = await res.json();
		expect(body.ok).toBe(true);
		expect(body.count).toBe(5);
	});

	test("custom status code", async () => {
		const res = actionJson({ error: "bad" }, { status: 400 });
		expect(res.status).toBe(400);
	});
});

describe("parseFormData", () => {
	test("parses JSON body", async () => {
		const req = new Request("http://localhost/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: "Alice", age: 30 }),
		});
		const data = await parseFormData(req);
		expect(data.name).toBe("Alice");
		expect(data.age).toBe("30");
	});

	test("parses URL-encoded body", async () => {
		const req = new Request("http://localhost/", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: "name=Bob&email=bob%40test.com",
		});
		const data = await parseFormData(req);
		expect(data.name).toBe("Bob");
		expect(data.email).toBe("bob@test.com");
	});

	test("returns empty for unknown content type", async () => {
		const req = new Request("http://localhost/", {
			method: "POST",
			headers: { "Content-Type": "text/plain" },
			body: "hello",
		});
		const data = await parseFormData(req);
		expect(Object.keys(data)).toHaveLength(0);
	});
});
