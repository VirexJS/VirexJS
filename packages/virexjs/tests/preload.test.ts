import { describe, expect, test } from "bun:test";
import { h, renderToString } from "../src/render/jsx";
import { DNSPrefetch, Preconnect, Preload } from "../src/render/preload";

describe("Preload", () => {
	test("renders font preload with crossorigin", () => {
		const html = renderToString(
			h(Preload, { href: "/fonts/inter.woff2", as: "font", type: "font/woff2" }),
		);
		expect(html).toContain('rel="preload"');
		expect(html).toContain('href="/fonts/inter.woff2"');
		expect(html).toContain('as="font"');
		expect(html).toContain('type="font/woff2"');
		expect(html).toContain('crossorigin="anonymous"');
	});

	test("renders image preload without crossorigin", () => {
		const html = renderToString(h(Preload, { href: "/hero.jpg", as: "image" }));
		expect(html).toContain('rel="preload"');
		expect(html).toContain('as="image"');
		expect(html).not.toContain("crossorigin");
	});

	test("renders style preload", () => {
		const html = renderToString(h(Preload, { href: "/critical.css", as: "style" }));
		expect(html).toContain('as="style"');
	});

	test("renders script preload", () => {
		const html = renderToString(h(Preload, { href: "/app.js", as: "script" }));
		expect(html).toContain('as="script"');
	});

	test("supports media query", () => {
		const html = renderToString(
			h(Preload, { href: "/mobile.css", as: "style", media: "(max-width: 768px)" }),
		);
		expect(html).toContain('media="(max-width: 768px)"');
	});
});

describe("DNSPrefetch", () => {
	test("renders dns-prefetch link", () => {
		const html = renderToString(h(DNSPrefetch, { href: "https://fonts.googleapis.com" }));
		expect(html).toContain('rel="dns-prefetch"');
		expect(html).toContain('href="https://fonts.googleapis.com"');
	});
});

describe("Preconnect", () => {
	test("renders preconnect link", () => {
		const html = renderToString(h(Preconnect, { href: "https://cdn.example.com" }));
		expect(html).toContain('rel="preconnect"');
		expect(html).toContain('href="https://cdn.example.com"');
	});

	test("adds crossorigin when specified", () => {
		const html = renderToString(
			h(Preconnect, { href: "https://fonts.gstatic.com", crossorigin: true }),
		);
		expect(html).toContain('crossorigin="anonymous"');
	});
});
