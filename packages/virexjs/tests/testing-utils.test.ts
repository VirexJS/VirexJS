import { describe, expect, test } from "bun:test";
import { Head } from "../src/render/head";
import type { VNode } from "../src/render/jsx";
import { h } from "../src/render/jsx";
import {
	assertHTML,
	createTestLoaderContext,
	createTestMiddlewareContext,
	createTestRequest,
	renderComponent,
} from "../src/testing/index";

// ─── renderComponent ────────────────────────────────────────────────────────

describe("renderComponent", () => {
	test("renders a simple component", () => {
		function Hello(props: { name: string }) {
			return h("p", null, `Hello ${props.name}`);
		}
		const { html } = renderComponent(Hello, { name: "World" });
		expect(html).toBe("<p>Hello World</p>");
	});

	test("collects head tags", () => {
		function Page(_props: Record<string, unknown>): VNode {
			return h("div", null, h(Head, null, h("title", null, "Test Page")), h("p", null, "content"));
		}
		const { html, head } = renderComponent(Page, {});
		expect(html).toBe("<div><p>content</p></div>");
		expect(head).toContain("<title>Test Page</title>");
	});

	test("resets head between renders", () => {
		function Page1(_props: Record<string, unknown>): VNode {
			return h(Head, null, h("title", null, "Page 1"));
		}
		function Page2(_props: Record<string, unknown>): VNode {
			return h(Head, null, h("title", null, "Page 2"));
		}

		renderComponent(Page1, {});
		const { head } = renderComponent(Page2, {});
		expect(head).toContain("Page 2");
		expect(head).not.toContain("Page 1");
	});
});

// ─── createTestRequest ──────────────────────────────────────────────────────

describe("createTestRequest", () => {
	test("creates GET request by default", () => {
		const req = createTestRequest("/api/users");
		expect(req.method).toBe("GET");
		expect(new URL(req.url).pathname).toBe("/api/users");
	});

	test("creates POST request with JSON body", () => {
		const req = createTestRequest("/api/users", {
			method: "POST",
			body: { name: "Alice" },
		});
		expect(req.method).toBe("POST");
		expect(req.headers.get("Content-Type")).toBe("application/json");
	});

	test("adds query parameters", () => {
		const req = createTestRequest("/search", {
			query: { q: "test", page: "2" },
		});
		const url = new URL(req.url);
		expect(url.searchParams.get("q")).toBe("test");
		expect(url.searchParams.get("page")).toBe("2");
	});

	test("adds custom headers", () => {
		const req = createTestRequest("/api", {
			headers: { Authorization: "Bearer token123" },
		});
		expect(req.headers.get("Authorization")).toBe("Bearer token123");
	});

	test("handles string body", () => {
		const req = createTestRequest("/api", {
			method: "POST",
			body: "raw text",
		});
		expect(req.method).toBe("POST");
	});
});

// ─── createTestLoaderContext ────────────────────────────────────────────────

describe("createTestLoaderContext", () => {
	test("creates context with params", () => {
		const ctx = createTestLoaderContext({ slug: "hello" });
		expect(ctx.params.slug).toBe("hello");
		expect(ctx.request).toBeDefined();
		expect(ctx.headers).toBeDefined();
	});

	test("creates context with custom path", () => {
		const ctx = createTestLoaderContext({}, { path: "/blog/test" });
		expect(new URL(ctx.request.url).pathname).toBe("/blog/test");
	});

	test("default params are empty", () => {
		const ctx = createTestLoaderContext();
		expect(ctx.params).toEqual({});
	});
});

// ─── createTestMiddlewareContext ─────────────────────────────────────────────

describe("createTestMiddlewareContext", () => {
	test("creates basic context", () => {
		const ctx = createTestMiddlewareContext("/api/test");
		expect(ctx.request).toBeDefined();
		expect(ctx.params).toEqual({});
		expect(ctx.locals).toEqual({});
	});

	test("creates context with custom params and locals", () => {
		const ctx = createTestMiddlewareContext("/user/42", {
			params: { id: "42" },
			locals: { userId: "abc" },
		});
		expect(ctx.params.id).toBe("42");
		expect(ctx.locals.userId).toBe("abc");
	});

	test("creates context with custom method", () => {
		const ctx = createTestMiddlewareContext("/api", { method: "DELETE" });
		expect(ctx.request.method).toBe("DELETE");
	});
});

// ─── assertHTML ─────────────────────────────────────────────────────────────

describe("assertHTML", () => {
	const html =
		'<div class="container"><h1>Hello World</h1><p>Test</p><a href="/about">About</a></div>';

	test("contains tag", () => {
		expect(() => assertHTML(html).contains("h1")).not.toThrow();
		expect(() => assertHTML(html).contains("h1", "Hello World")).not.toThrow();
	});

	test("contains throws for missing tag", () => {
		expect(() => assertHTML(html).contains("h2")).toThrow();
	});

	test("contains throws for wrong text", () => {
		expect(() => assertHTML(html).contains("h1", "Goodbye")).toThrow();
	});

	test("notContains passes for missing tag", () => {
		expect(() => assertHTML(html).notContains("script")).not.toThrow();
	});

	test("notContains throws for present tag", () => {
		expect(() => assertHTML(html).notContains("h1")).toThrow();
	});

	test("hasAttribute checks attribute value", () => {
		expect(() => assertHTML(html).hasAttribute("a", "href", "/about")).not.toThrow();
		expect(() => assertHTML(html).hasAttribute("div", "class", "container")).not.toThrow();
	});

	test("hasAttribute throws for wrong value", () => {
		expect(() => assertHTML(html).hasAttribute("a", "href", "/wrong")).toThrow();
	});

	test("containsText checks for text anywhere", () => {
		expect(() => assertHTML(html).containsText("Hello World")).not.toThrow();
	});

	test("containsText throws for missing text", () => {
		expect(() => assertHTML(html).containsText("Not Here")).toThrow();
	});

	test("notContainsText passes for missing text", () => {
		expect(() => assertHTML(html).notContainsText("Missing")).not.toThrow();
	});

	test("notContainsText throws for present text", () => {
		expect(() => assertHTML(html).notContainsText("Hello")).toThrow();
	});
});
