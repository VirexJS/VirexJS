import { beforeEach, describe, expect, test } from "bun:test";
import { flushHeadTags, Head, resetHeadCollector } from "../src/render/head";
import { h, renderToString } from "../src/render/jsx";

beforeEach(() => {
	resetHeadCollector();
});

// ─── Basic collection ───────────────────────────────────────────────────────

describe("Head component", () => {
	test("collects title tag", () => {
		renderToString(h(Head, null, h("title", null, "My Page")));
		const html = flushHeadTags();
		expect(html).toBe("<title>My Page</title>");
	});

	test("collects meta tags", () => {
		renderToString(h(Head, null, h("meta", { name: "description", content: "A great page" })));
		const html = flushHeadTags();
		expect(html).toContain('name="description"');
		expect(html).toContain('content="A great page"');
	});

	test("collects link tags", () => {
		renderToString(h(Head, null, h("link", { rel: "stylesheet", href: "/style.css" })));
		const html = flushHeadTags();
		expect(html).toContain('rel="stylesheet"');
		expect(html).toContain('href="/style.css"');
	});

	test("collects script tags", () => {
		renderToString(h(Head, null, h("script", { src: "/app.js", defer: true })));
		const html = flushHeadTags();
		expect(html).toContain('src="/app.js"');
		expect(html).toContain("defer");
	});

	test("collects multiple tags", () => {
		renderToString(
			h(
				Head,
				null,
				h("title", null, "Blog"),
				h("meta", { name: "author", content: "VirexJS" }),
				h("link", { rel: "icon", href: "/favicon.ico" }),
			),
		);
		const html = flushHeadTags();
		expect(html).toContain("<title>Blog</title>");
		expect(html).toContain('name="author"');
		expect(html).toContain('href="/favicon.ico"');
	});

	test("renders nothing in body (returns null)", () => {
		const result = renderToString(
			h("div", null, h(Head, null, h("title", null, "Hidden")), "visible content"),
		);
		expect(result).toBe("<div>visible content</div>");
		expect(flushHeadTags()).toContain("<title>Hidden</title>");
	});
});

// ─── Deduplication ──────────────────────────────────────────────────────────

describe("deduplication", () => {
	test("last title wins", () => {
		renderToString(
			h(
				"div",
				null,
				h(Head, null, h("title", null, "First")),
				h(Head, null, h("title", null, "Second")),
			),
		);
		const html = flushHeadTags();
		expect(html).toBe("<title>Second</title>");
		expect(html).not.toContain("First");
	});

	test("meta tags deduped by name attribute", () => {
		renderToString(
			h(
				"div",
				null,
				h(Head, null, h("meta", { name: "description", content: "Old" })),
				h(Head, null, h("meta", { name: "description", content: "New" })),
			),
		);
		const html = flushHeadTags();
		expect(html).toContain('content="New"');
		expect(html).not.toContain('content="Old"');
	});

	test("meta tags deduped by property attribute (og)", () => {
		renderToString(
			h(
				"div",
				null,
				h(Head, null, h("meta", { property: "og:title", content: "Old Title" })),
				h(Head, null, h("meta", { property: "og:title", content: "New Title" })),
			),
		);
		const html = flushHeadTags();
		expect(html).toContain('content="New Title"');
		expect(html).not.toContain('content="Old Title"');
	});

	test("link tags deduped by href", () => {
		renderToString(
			h(
				"div",
				null,
				h(Head, null, h("link", { rel: "stylesheet", href: "/a.css" })),
				h(Head, null, h("link", { rel: "stylesheet", href: "/a.css" })),
				h(Head, null, h("link", { rel: "stylesheet", href: "/b.css" })),
			),
		);
		const html = flushHeadTags();
		// Only one /a.css, one /b.css
		const matches = html.match(/\/a\.css/g);
		expect(matches).toHaveLength(1);
		expect(html).toContain("/b.css");
	});

	test("different meta names are not deduped", () => {
		renderToString(
			h(
				Head,
				null,
				h("meta", { name: "description", content: "desc" }),
				h("meta", { name: "author", content: "auth" }),
			),
		);
		const html = flushHeadTags();
		expect(html).toContain('name="description"');
		expect(html).toContain('name="author"');
	});

	test("charset meta is deduped", () => {
		renderToString(
			h(
				"div",
				null,
				h(Head, null, h("meta", { charset: "ascii" })),
				h(Head, null, h("meta", { charset: "utf-8" })),
			),
		);
		const html = flushHeadTags();
		expect(html).toContain('charset="utf-8"');
		expect(html).not.toContain("ascii");
	});
});

// ─── Nested components ──────────────────────────────────────────────────────

describe("nested components", () => {
	test("Head in child component collects tags", () => {
		function Header() {
			return h(
				"header",
				null,
				h(Head, null, h("title", null, "From Header")),
				h("h1", null, "Site"),
			);
		}

		const result = renderToString(h("div", null, h(Header, null)));
		expect(result).toBe("<div><header><h1>Site</h1></header></div>");
		expect(flushHeadTags()).toContain("<title>From Header</title>");
	});

	test("Head in deeply nested components", () => {
		function Inner() {
			return h(Head, null, h("meta", { name: "robots", content: "noindex" }));
		}

		function Outer() {
			return h("div", null, h(Inner, null));
		}

		renderToString(h(Outer, null));
		const html = flushHeadTags();
		expect(html).toContain('name="robots"');
		expect(html).toContain('content="noindex"');
	});

	test("multiple Head components across tree", () => {
		function Layout(props: { children?: unknown }) {
			return h(
				"html",
				null,
				h(
					Head,
					null,
					h("meta", { charset: "utf-8" }),
					h("link", { rel: "stylesheet", href: "/global.css" }),
				),
				h("body", null, props.children),
			);
		}

		function Page() {
			return h(
				"div",
				null,
				h(
					Head,
					null,
					h("title", null, "My Page"),
					h("meta", { name: "description", content: "About this page" }),
				),
				h("p", null, "Content"),
			);
		}

		renderToString(h(Layout, null, h(Page, null)));
		const html = flushHeadTags();
		expect(html).toContain("<title>My Page</title>");
		expect(html).toContain('charset="utf-8"');
		expect(html).toContain("/global.css");
		expect(html).toContain('name="description"');
	});
});

// ─── Edge cases ─────────────────────────────────────────────────────────────

describe("edge cases", () => {
	test("flush returns empty string when no Head used", () => {
		renderToString(h("div", null, "no head"));
		expect(flushHeadTags()).toBe("");
	});

	test("flush clears collected tags", () => {
		renderToString(h(Head, null, h("title", null, "First")));
		flushHeadTags();
		expect(flushHeadTags()).toBe("");
	});

	test("resetHeadCollector clears tags", () => {
		renderToString(h(Head, null, h("title", null, "Will be cleared")));
		resetHeadCollector();
		expect(flushHeadTags()).toBe("");
	});

	test("Head with no children", () => {
		renderToString(h(Head, null));
		expect(flushHeadTags()).toBe("");
	});

	test("title with dynamic content", () => {
		const pageTitle = "Dynamic Title";
		renderToString(h(Head, null, h("title", null, pageTitle)));
		expect(flushHeadTags()).toBe("<title>Dynamic Title</title>");
	});

	test("XSS prevention in title", () => {
		renderToString(h(Head, null, h("title", null, '<script>alert("xss")</script>')));
		const html = flushHeadTags();
		expect(html).toContain("&lt;script&gt;");
		expect(html).not.toContain("<script>");
	});

	test("XSS prevention in meta content", () => {
		renderToString(
			h(Head, null, h("meta", { name: "desc", content: '"><script>alert(1)</script>' })),
		);
		const html = flushHeadTags();
		expect(html).toContain("&quot;");
		expect(html).not.toContain("<script>");
	});
});
