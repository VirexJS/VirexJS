import { describe, expect, test } from "bun:test";
import { Fragment, h, renderToString } from "../src/render/jsx";
import { route } from "../src/render/routes";
import { createCache } from "../src/server/cache";
import { cors } from "../src/server/cors";
import { runMiddleware } from "../src/server/middleware";
import { number, string, validate } from "../src/validation/index";

describe("JSX edge cases", () => {
	test("deeply nested fragments", () => {
		const html = renderToString(h(Fragment, null, h(Fragment, null, h(Fragment, null, "deep"))));
		expect(html).toBe("deep");
	});

	test("empty children array", () => {
		const html = renderToString(h("div", null));
		expect(html).toBe("<div></div>");
	});

	test("mixed children types", () => {
		const html = renderToString(h("p", null, "text", 42, true, null, undefined, false));
		expect(html).toBe("<p>text42</p>");
	});

	test("style with zero values", () => {
		const html = renderToString(h("div", { style: { margin: 0, padding: 0, opacity: 0 } }));
		expect(html).toContain("margin:0");
		expect(html).toContain("opacity:0");
	});

	test("boolean attributes", () => {
		const html = renderToString(h("input", { disabled: true, required: true, checked: false }));
		expect(html).toContain("disabled");
		expect(html).toContain("required");
		expect(html).not.toContain("checked");
	});

	test("void elements have no closing tag", () => {
		expect(renderToString(h("br", null))).toBe("<br>");
		expect(renderToString(h("img", { src: "/x.png", alt: "x" }))).toContain("<img");
		expect(renderToString(h("img", { src: "/x.png", alt: "x" }))).not.toContain("</img>");
	});

	test("XSS in attributes", () => {
		const html = renderToString(h("a", { href: '"><script>alert(1)</script>' }));
		expect(html).not.toContain("<script>");
	});

	test("large list rendering", () => {
		const items = Array.from({ length: 1000 }, (_, i) => h("li", null, String(i)));
		const html = renderToString(h("ul", null, ...items));
		expect(html).toContain("<li>0</li>");
		expect(html).toContain("<li>999</li>");
	});
});

describe("validation edge cases", () => {
	test("empty schema validates anything", () => {
		const result = validate({}, { any: "data" });
		expect(result.success).toBe(true);
	});

	test("null and undefined values", () => {
		const result = validate({ name: string().required() }, { name: null });
		expect(result.success).toBe(false);
	});

	test("number 0 is valid for required", () => {
		const result = validate({ n: number().required() }, { n: "0" });
		expect(result.success).toBe(true);
		expect(result.data.n).toBe(0);
	});

	test("empty string fails required", () => {
		const result = validate({ name: string().required() }, { name: "" });
		expect(result.success).toBe(false);
	});

	test("chained validators stop on first error", () => {
		const result = validate({ pw: string().required().min(8).pattern(/[A-Z]/) }, { pw: "" });
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0]!.rule).toBe("required");
	});
});

describe("route edge cases", () => {
	test("encode special characters", () => {
		expect(route("/search/:q", { q: "hello world" })).toBe("/search/hello%20world");
	});

	test("multiple params", () => {
		expect(route("/u/:id/p/:pid", { id: "1", pid: "2" })).toBe("/u/1/p/2");
	});

	test("throw on missing param", () => {
		expect(() => route("/blog/:slug", {})).toThrow();
	});

	test("no params returns pattern as-is", () => {
		expect(route("/about")).toBe("/about");
	});
});

describe("cache edge cases", () => {
	test("overwrite existing key", () => {
		const cache = createCache<string>();
		cache.set("k", "old");
		cache.set("k", "new");
		expect(cache.get("k")).toBe("new");
	});

	test("maxSize evicts oldest", () => {
		const cache = createCache<number>({ maxSize: 2, ttl: 60000 });
		cache.set("a", 1);
		cache.set("b", 2);
		cache.set("c", 3);
		expect(cache.get("a")).toBeUndefined();
		expect(cache.get("c")).toBe(3);
	});
});

describe("CORS edge cases", () => {
	test("no origin header", async () => {
		const mw = cors({ origin: "http://example.com" });
		const ctx = {
			request: new Request("http://localhost/api"),
			params: {},
			locals: {},
		};
		const res = await runMiddleware([mw], ctx, async () => new Response("ok"));
		expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
	});

	test("preflight with no request headers", async () => {
		const mw = cors();
		const ctx = {
			request: new Request("http://localhost/api", {
				method: "OPTIONS",
				headers: { Origin: "http://example.com" },
			}),
			params: {},
			locals: {},
		};
		const res = await runMiddleware([mw], ctx, async () => new Response("ok"));
		expect(res.status).toBe(204);
	});
});
