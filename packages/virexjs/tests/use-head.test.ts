import { beforeEach, describe, expect, test } from "bun:test";
import { flushHeadTags, resetHeadCollector } from "../src/render/head";
import type { VNode } from "../src/render/jsx";
import { h, renderToString } from "../src/render/jsx";
import { useHead } from "../src/render/use-head";

beforeEach(() => {
	resetHeadCollector();
});

// ─── Basic usage ────────────────────────────────────────────────────────────

describe("useHead", () => {
	test("sets title", () => {
		function Page(): VNode {
			const head = useHead({ title: "My Page" });
			return h("div", null, head, "content");
		}

		renderToString(h(Page, null));
		expect(flushHeadTags()).toContain("<title>My Page</title>");
	});

	test("sets description meta", () => {
		function Page(): VNode {
			const head = useHead({ description: "A great page" });
			return h("div", null, head);
		}

		renderToString(h(Page, null));
		const html = flushHeadTags();
		expect(html).toContain('name="description"');
		expect(html).toContain('content="A great page"');
	});

	test("sets canonical link", () => {
		function Page(): VNode {
			const head = useHead({ canonical: "https://example.com/page" });
			return h("div", null, head);
		}

		renderToString(h(Page, null));
		expect(flushHeadTags()).toContain('href="https://example.com/page"');
	});

	test("sets charset", () => {
		function Page(): VNode {
			const head = useHead({ charset: "utf-8" });
			return h("div", null, head);
		}

		renderToString(h(Page, null));
		expect(flushHeadTags()).toContain('charset="utf-8"');
	});

	test("sets favicon", () => {
		function Page(): VNode {
			const head = useHead({ favicon: "/icon.svg" });
			return h("div", null, head);
		}

		renderToString(h(Page, null));
		const html = flushHeadTags();
		expect(html).toContain('rel="icon"');
		expect(html).toContain('href="/icon.svg"');
	});
});

// ─── OpenGraph ──────────────────────────────────────────────────────────────

describe("OpenGraph", () => {
	test("sets og tags", () => {
		function Page(): VNode {
			const head = useHead({
				og: {
					title: "OG Title",
					description: "OG Desc",
					image: "https://example.com/img.jpg",
					type: "article",
					url: "https://example.com",
					siteName: "MySite",
				},
			});
			return h("div", null, head);
		}

		renderToString(h(Page, null));
		const html = flushHeadTags();
		expect(html).toContain('property="og:title"');
		expect(html).toContain('content="OG Title"');
		expect(html).toContain('property="og:description"');
		expect(html).toContain('property="og:image"');
		expect(html).toContain('property="og:type"');
		expect(html).toContain('property="og:url"');
		expect(html).toContain('property="og:site_name"');
	});

	test("partial og tags", () => {
		function Page(): VNode {
			const head = useHead({ og: { title: "Just Title" } });
			return h("div", null, head);
		}

		renderToString(h(Page, null));
		const html = flushHeadTags();
		expect(html).toContain('property="og:title"');
		expect(html).not.toContain("og:description");
	});
});

// ─── Twitter Card ───────────────────────────────────────────────────────────

describe("Twitter Card", () => {
	test("sets twitter card tags", () => {
		function Page(): VNode {
			const head = useHead({
				twitter: {
					card: "summary_large_image",
					title: "TW Title",
					description: "TW Desc",
					image: "https://example.com/tw.jpg",
					site: "@mysite",
					creator: "@author",
				},
			});
			return h("div", null, head);
		}

		renderToString(h(Page, null));
		const html = flushHeadTags();
		expect(html).toContain('name="twitter:card"');
		expect(html).toContain('content="summary_large_image"');
		expect(html).toContain('name="twitter:title"');
		expect(html).toContain('name="twitter:site"');
		expect(html).toContain('content="@mysite"');
		expect(html).toContain('name="twitter:creator"');
	});
});

// ─── Additional tags ────────────────────────────────────────────────────────

describe("additional tags", () => {
	test("custom meta tags", () => {
		function Page(): VNode {
			const head = useHead({
				meta: [
					{ name: "robots", content: "noindex, nofollow" },
					{ property: "article:author", content: "John" },
					{ httpEquiv: "refresh", content: "30" },
				],
			});
			return h("div", null, head);
		}

		renderToString(h(Page, null));
		const html = flushHeadTags();
		expect(html).toContain('name="robots"');
		expect(html).toContain('content="noindex, nofollow"');
		expect(html).toContain('property="article:author"');
		expect(html).toContain('http-equiv="refresh"');
	});

	test("custom link tags", () => {
		function Page(): VNode {
			const head = useHead({
				links: [
					{ rel: "preconnect", href: "https://fonts.googleapis.com" },
					{ rel: "stylesheet", href: "/custom.css" },
				],
			});
			return h("div", null, head);
		}

		renderToString(h(Page, null));
		const html = flushHeadTags();
		expect(html).toContain('rel="preconnect"');
		expect(html).toContain("fonts.googleapis.com");
		expect(html).toContain("/custom.css");
	});

	test("script tags", () => {
		function Page(): VNode {
			const head = useHead({
				scripts: [{ src: "/analytics.js", defer: true }],
			});
			return h("div", null, head);
		}

		renderToString(h(Page, null));
		const html = flushHeadTags();
		expect(html).toContain('src="/analytics.js"');
		expect(html).toContain("defer");
	});
});

// ─── Integration ────────────────────────────────────────────────────────────

describe("integration", () => {
	test("full SEO setup", () => {
		function Page(): VNode {
			const head = useHead({
				title: "Blog Post Title",
				description: "An insightful blog post",
				canonical: "https://example.com/blog/post",
				og: {
					title: "Blog Post Title",
					description: "An insightful blog post",
					image: "https://example.com/cover.jpg",
					type: "article",
				},
				twitter: {
					card: "summary_large_image",
					title: "Blog Post Title",
					image: "https://example.com/cover.jpg",
				},
			});
			return h("article", null, head, h("h1", null, "Blog Post Title"));
		}

		const bodyHtml = renderToString(h(Page, null));
		const headHtml = flushHeadTags();

		// Body should not contain head tags
		expect(bodyHtml).toBe("<article><h1>Blog Post Title</h1></article>");

		// Head should contain all SEO tags
		expect(headHtml).toContain("<title>Blog Post Title</title>");
		expect(headHtml).toContain('name="description"');
		expect(headHtml).toContain('rel="canonical"');
		expect(headHtml).toContain('property="og:title"');
		expect(headHtml).toContain('name="twitter:card"');
	});

	test("empty options returns null (no head tags)", () => {
		function Page(): VNode {
			const head = useHead({});
			return h("div", null, head, "content");
		}

		renderToString(h(Page, null));
		expect(flushHeadTags()).toBe("");
	});
});
