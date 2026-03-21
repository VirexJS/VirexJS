import { describe, test, expect } from "bun:test";
import { redirect, json, html, notFound, text, setCookie, parseCookies } from "../src/server/response";

describe("redirect", () => {
	test("returns 302 by default", () => {
		const res = redirect("/login");
		expect(res.status).toBe(302);
		expect(res.headers.get("Location")).toBe("/login");
	});

	test("supports custom status codes", () => {
		expect(redirect("/new", 301).status).toBe(301);
		expect(redirect("/temp", 307).status).toBe(307);
		expect(redirect("/perm", 308).status).toBe(308);
	});
});

describe("json", () => {
	test("returns JSON with correct content type", async () => {
		const res = json({ hello: "world" });
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toBe("application/json");
		expect(await res.json()).toEqual({ hello: "world" });
	});

	test("supports custom status", async () => {
		const res = json({ error: "not found" }, { status: 404 });
		expect(res.status).toBe(404);
	});

	test("supports custom headers", () => {
		const res = json({}, { headers: { "X-Custom": "test" } });
		expect(res.headers.get("X-Custom")).toBe("test");
	});
});

describe("html", () => {
	test("returns HTML with correct content type", async () => {
		const res = html("<h1>Hello</h1>");
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
		expect(await res.text()).toBe("<h1>Hello</h1>");
	});

	test("supports custom status", () => {
		expect(html("error", { status: 500 }).status).toBe(500);
	});
});

describe("notFound", () => {
	test("returns 404", async () => {
		const res = notFound();
		expect(res.status).toBe(404);
		expect(await res.text()).toBe("Not Found");
	});

	test("supports custom message", async () => {
		const res = notFound("Page not found");
		expect(await res.text()).toBe("Page not found");
	});
});

describe("text", () => {
	test("returns plain text", async () => {
		const res = text("hello");
		expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
		expect(await res.text()).toBe("hello");
	});
});

describe("setCookie", () => {
	test("sets basic cookie", () => {
		const res = new Response("ok");
		setCookie(res, "token", "abc123");
		expect(res.headers.get("Set-Cookie")).toContain("token=abc123");
	});

	test("sets cookie with options", () => {
		const res = new Response("ok");
		setCookie(res, "session", "xyz", {
			maxAge: 3600,
			path: "/",
			httpOnly: true,
			secure: true,
			sameSite: "Lax",
		});
		const cookie = res.headers.get("Set-Cookie")!;
		expect(cookie).toContain("session=xyz");
		expect(cookie).toContain("Max-Age=3600");
		expect(cookie).toContain("Path=/");
		expect(cookie).toContain("HttpOnly");
		expect(cookie).toContain("Secure");
		expect(cookie).toContain("SameSite=Lax");
	});

	test("encodes special characters", () => {
		const res = new Response("ok");
		setCookie(res, "data", "hello world");
		expect(res.headers.get("Set-Cookie")).toContain("hello%20world");
	});
});

describe("parseCookies", () => {
	test("parses cookie header", () => {
		const req = new Request("http://localhost/", {
			headers: { Cookie: "a=1; b=hello; c=world" },
		});
		expect(parseCookies(req)).toEqual({ a: "1", b: "hello", c: "world" });
	});

	test("returns empty object for no cookies", () => {
		const req = new Request("http://localhost/");
		expect(parseCookies(req)).toEqual({});
	});

	test("decodes URL-encoded values", () => {
		const req = new Request("http://localhost/", {
			headers: { Cookie: "name=hello%20world" },
		});
		expect(parseCookies(req)).toEqual({ name: "hello world" });
	});
});
