import { describe, test, expect, beforeEach } from "bun:test";
import { h, renderToString } from "../src/render/jsx";
import { JsonLd, createBreadcrumbs, createFAQ } from "../src/render/json-ld";
import { resetHeadCollector, flushHeadTags } from "../src/render/head";

beforeEach(() => {
	resetHeadCollector();
});

describe("JsonLd component", () => {
	test("renders Article structured data", () => {
		renderToString(h(JsonLd, {
			data: {
				"@type": "BlogPosting",
				headline: "My Post",
				datePublished: "2024-01-15",
			},
		}));

		const head = flushHeadTags();
		expect(head).toContain('type="application/ld+json"');
		expect(head).toContain('"@context"');
		expect(head).toContain("schema.org");
		expect(head).toContain("BlogPosting");
		expect(head).toContain("My Post");
	});

	test("renders WebSite structured data", () => {
		renderToString(h(JsonLd, {
			data: {
				"@type": "WebSite",
				name: "VirexJS",
				url: "https://virexjs.dev",
			},
		}));

		const head = flushHeadTags();
		expect(head).toContain("WebSite");
		expect(head).toContain("VirexJS");
		expect(head).toContain("virexjs.dev");
	});

	test("renders Organization structured data", () => {
		renderToString(h(JsonLd, {
			data: {
				"@type": "Organization",
				name: "ECOSTACK",
				url: "https://ecostack.dev",
				sameAs: ["https://github.com/ecostack"],
			},
		}));

		const head = flushHeadTags();
		expect(head).toContain("Organization");
		expect(head).toContain("ECOSTACK");
	});

	test("escapes HTML in JSON-LD", () => {
		renderToString(h(JsonLd, {
			data: {
				"@type": "Article",
				headline: "Test <script>alert('xss')</script>",
			},
		}));

		const head = flushHeadTags();
		// Should not contain raw <script> tags
		expect(head).not.toContain("<script>alert");
		// The \\u003c escape should be present
		expect(head).toContain("\\u003c");
	});
});

describe("createBreadcrumbs", () => {
	test("creates breadcrumb structured data", () => {
		const bc = createBreadcrumbs("https://example.com", [
			{ name: "Home", path: "/" },
			{ name: "Blog", path: "/blog" },
			{ name: "My Post", path: "/blog/my-post" },
		]);

		expect(bc["@type"]).toBe("BreadcrumbList");
		expect(bc.itemListElement).toHaveLength(3);
		expect(bc.itemListElement[0]!.position).toBe(1);
		expect(bc.itemListElement[0]!.name).toBe("Home");
		expect(bc.itemListElement[0]!.item).toBe("https://example.com/");
		// Last item should not have item URL
		expect(bc.itemListElement[2]!.item).toBeUndefined();
	});

	test("strips trailing slash from baseUrl", () => {
		const bc = createBreadcrumbs("https://example.com/", [
			{ name: "Home", path: "/" },
		]);
		expect(bc.itemListElement[0]!.item).toBeUndefined(); // last item
	});
});

describe("createFAQ", () => {
	test("creates FAQ structured data", () => {
		const faq = createFAQ([
			{ question: "What is VirexJS?", answer: "A web framework." },
			{ question: "Is it free?", answer: "Yes, MIT license." },
		]);

		expect(faq["@type"]).toBe("FAQPage");
		expect(faq.mainEntity).toHaveLength(2);
		expect(faq.mainEntity[0]!["@type"]).toBe("Question");
		expect(faq.mainEntity[0]!.name).toBe("What is VirexJS?");
		expect(faq.mainEntity[0]!.acceptedAnswer.text).toBe("A web framework.");
	});
});
