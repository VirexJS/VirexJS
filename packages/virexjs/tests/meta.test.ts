import { describe, expect, test } from "bun:test";
import { renderMeta } from "../src/render/meta";

describe("renderMeta", () => {
	test("renders title tag", () => {
		expect(renderMeta({ title: "Hello" })).toContain("<title>Hello</title>");
	});

	test("renders description meta tag", () => {
		const html = renderMeta({ description: "A cool site" });
		expect(html).toContain('<meta name="description" content="A cool site">');
	});

	test("renders canonical link", () => {
		const html = renderMeta({ canonical: "https://example.com/page" });
		expect(html).toContain('<link rel="canonical" href="https://example.com/page">');
	});

	test("renders Open Graph tags", () => {
		const html = renderMeta({
			og: { title: "OG Title", description: "OG Desc", image: "/og.png", type: "website" },
		});
		expect(html).toContain('property="og:title" content="OG Title"');
		expect(html).toContain('property="og:description" content="OG Desc"');
		expect(html).toContain('property="og:image" content="/og.png"');
		expect(html).toContain('property="og:type" content="website"');
	});

	test("renders Twitter card tags", () => {
		const html = renderMeta({
			twitter: { card: "summary_large_image", title: "TW Title" },
		});
		expect(html).toContain('name="twitter:card" content="summary_large_image"');
		expect(html).toContain('name="twitter:title" content="TW Title"');
	});

	test("escapes special characters in meta content", () => {
		const html = renderMeta({ title: 'Site "with" <special> & chars' });
		expect(html).toContain("&quot;with&quot;");
		expect(html).toContain("&lt;special&gt;");
		expect(html).toContain("&amp; chars");
	});

	test("empty meta returns empty string", () => {
		expect(renderMeta({})).toBe("");
	});

	test("renders all fields together", () => {
		const html = renderMeta({
			title: "Full Page",
			description: "All meta tags",
			canonical: "https://example.com",
			og: { title: "OG" },
			twitter: { card: "summary" },
		});
		expect(html).toContain("<title>Full Page</title>");
		expect(html).toContain('name="description"');
		expect(html).toContain('rel="canonical"');
		expect(html).toContain('property="og:title"');
		expect(html).toContain('name="twitter:card"');
	});
});
