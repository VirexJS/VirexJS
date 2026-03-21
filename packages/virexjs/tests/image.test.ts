import { describe, expect, test } from "bun:test";
import { Image } from "../src/render/image";
import { h, renderToString } from "../src/render/jsx";

describe("Image component", () => {
	test("renders img with required attributes", () => {
		const html = renderToString(
			h(Image, { src: "/hero.jpg", alt: "Hero", width: 800, height: 400 }),
		);
		expect(html).toContain("/_virex/image"); // optimized via image endpoint
		expect(html).toContain('alt="Hero"');
		expect(html).toContain('width="800"');
		expect(html).toContain('height="400"');
	});

	test("adds lazy loading by default", () => {
		const html = renderToString(
			h(Image, { src: "/img.jpg", alt: "Test", width: 100, height: 100 }),
		);
		expect(html).toContain('loading="lazy"');
	});

	test("priority disables lazy loading", () => {
		const html = renderToString(
			h(Image, { src: "/hero.jpg", alt: "Hero", width: 800, height: 400, priority: true }),
		);
		expect(html).not.toContain('loading="lazy"');
		expect(html).toContain('fetchpriority="high"');
	});

	test("adds async decoding by default", () => {
		const html = renderToString(
			h(Image, { src: "/img.jpg", alt: "Test", width: 100, height: 100 }),
		);
		expect(html).toContain('decoding="async"');
	});

	test("renders with className", () => {
		const html = renderToString(
			h(Image, { src: "/img.jpg", alt: "Test", width: 100, height: 100, className: "photo" }),
		);
		expect(html).toContain('class="photo"');
	});

	test("renders with srcSet and sizes", () => {
		const html = renderToString(
			h(Image, {
				src: "/img.jpg",
				alt: "Test",
				width: 800,
				height: 600,
				srcSet: "/img-400.jpg 400w, /img-800.jpg 800w",
				sizes: "(max-width: 600px) 400px, 800px",
			}),
		);
		expect(html).toContain("srcset=");
		expect(html).toContain("sizes=");
	});

	test("adds max-width:100% style", () => {
		const html = renderToString(
			h(Image, { src: "/img.jpg", alt: "Test", width: 100, height: 100 }),
		);
		expect(html).toContain("max-width:100%");
	});
});
