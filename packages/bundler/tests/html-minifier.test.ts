import { describe, expect, test } from "bun:test";
import { minificationStats, minifyHTML } from "../src/html-minifier";

describe("minifyHTML", () => {
	test("removes HTML comments", () => {
		const html = "<div><!-- comment --><p>text</p></div>";
		expect(minifyHTML(html)).toBe("<div><p>text</p></div>");
	});

	test("removes multi-line comments", () => {
		const html = `<div>
		<!--
		  This is a
		  multi-line comment
		-->
		<p>text</p></div>`;
		const result = minifyHTML(html);
		expect(result).not.toContain("<!--");
		expect(result).toContain("<p>text</p>");
	});

	test("collapses whitespace between tags", () => {
		const html = "<div>   <p>  text  </p>   </div>";
		const result = minifyHTML(html);
		expect(result).not.toContain("   ");
	});

	test("collapses runs of whitespace", () => {
		const html = '<div   class="test"   id="main"  >';
		const result = minifyHTML(html);
		expect(result).not.toMatch(/\s{2,}/);
	});

	test("removes quotes from simple attribute values", () => {
		const html = '<div class="container" id="main">';
		const result = minifyHTML(html);
		expect(result).toContain("class=container");
		expect(result).toContain("id=main");
	});

	test("keeps quotes for complex attribute values", () => {
		const html = '<div style="color: red; font-size: 14px">';
		const result = minifyHTML(html);
		expect(result).toContain('style="color: red; font-size: 14px"');
	});

	test("preserves pre content", () => {
		const html = "<pre>  code   with   spaces  </pre>";
		expect(minifyHTML(html)).toContain("  code   with   spaces  ");
	});

	test("preserves script content", () => {
		const html = "<script>  var x = 1;  var y = 2;  </script>";
		expect(minifyHTML(html)).toContain("  var x = 1;  var y = 2;  ");
	});

	test("preserves style content", () => {
		const html = "<style>  .cls { color: red; }  </style>";
		expect(minifyHTML(html)).toContain("  .cls { color: red; }  ");
	});

	test("preserves code content", () => {
		const html = "<code>  let x = 1  </code>";
		expect(minifyHTML(html)).toContain("  let x = 1  ");
	});

	test("preserves textarea content", () => {
		const html = "<textarea>  default text  </textarea>";
		expect(minifyHTML(html)).toContain("  default text  ");
	});

	test("trims leading and trailing whitespace", () => {
		const html = "  <div>test</div>  ";
		expect(minifyHTML(html)).toBe("<div>test</div>");
	});

	test("handles full HTML document", () => {
		const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Test</title>
    <!-- Head comment -->
</head>
<body>
    <div class="container">
        <h1>Hello World</h1>
        <p>This is a test.</p>
    </div>
</body>
</html>`;
		const result = minifyHTML(html);
		expect(result).not.toContain("<!-- Head comment -->");
		expect(result.length).toBeLessThan(html.length);
		expect(result).toContain("<h1>Hello World</h1>");
		expect(result).toContain("<title>Test</title>");
	});
});

describe("minificationStats", () => {
	test("calculates correct savings", () => {
		const original = "  <div>  <p> hello </p>  </div>  ";
		const minified = minifyHTML(original);
		const stats = minificationStats(original, minified);

		expect(stats.originalSize).toBeGreaterThan(stats.minifiedSize);
		expect(stats.savings).toBeGreaterThan(0);
		expect(stats.percentage).toMatch(/\d+\.\d+%/);
	});

	test("zero savings for empty string", () => {
		const stats = minificationStats("", "");
		expect(stats.savings).toBe(0);
		expect(stats.percentage).toBe("0.0%");
	});

	test("returns correct sizes", () => {
		const stats = minificationStats("hello", "hi");
		expect(stats.originalSize).toBe(5);
		expect(stats.minifiedSize).toBe(2);
		expect(stats.savings).toBe(3);
	});
});
