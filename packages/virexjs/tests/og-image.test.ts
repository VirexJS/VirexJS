import { describe, expect, test } from "bun:test";
import { generateOGImage } from "../src/render/og-image";

describe("generateOGImage", () => {
	test("returns SVG response", async () => {
		const res = generateOGImage({ title: "Hello World" });
		expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
		const svg = await res.text();
		expect(svg).toContain("<svg");
		expect(svg).toContain("Hello World");
	});

	test("includes subtitle", async () => {
		const res = generateOGImage({ title: "Title", subtitle: "Subtitle text" });
		const svg = await res.text();
		expect(svg).toContain("Subtitle text");
	});

	test("includes brand", async () => {
		const res = generateOGImage({ title: "Test", brand: "MyBrand" });
		const svg = await res.text();
		expect(svg).toContain("MyBrand");
	});

	test("escapes XSS in title", async () => {
		const res = generateOGImage({ title: '<script>alert("xss")</script>' });
		const svg = await res.text();
		expect(svg).not.toContain("<script>");
		expect(svg).toContain("&lt;script&gt;");
	});

	test("default dimensions are 1200x630", async () => {
		const res = generateOGImage({ title: "Test" });
		const svg = await res.text();
		expect(svg).toContain('width="1200"');
		expect(svg).toContain('height="630"');
	});

	test("custom colors", async () => {
		const res = generateOGImage({ title: "Test", bgColor: "#ff0000", accentColor: "#00ff00" });
		const svg = await res.text();
		expect(svg).toContain("#ff0000");
		expect(svg).toContain("#00ff00");
	});

	test("sets cache header", () => {
		const res = generateOGImage({ title: "Test" });
		expect(res.headers.get("Cache-Control")).toContain("max-age=86400");
	});

	test("truncates long titles", async () => {
		const longTitle = "A".repeat(100);
		const res = generateOGImage({ title: longTitle });
		const svg = await res.text();
		expect(svg).toContain("...");
	});
});
