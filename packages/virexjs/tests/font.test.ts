import { beforeEach, describe, expect, test } from "bun:test";
import { Font } from "../src/render/font";
import { flushHeadTags, resetHeadCollector } from "../src/render/head";
import { h, renderToString } from "../src/render/jsx";

beforeEach(() => {
	resetHeadCollector();
});

describe("Font component", () => {
	test("Google Font adds preconnect + stylesheet", () => {
		renderToString(h(Font, { google: "Inter", weights: [400, 700] }));
		const head = flushHeadTags();
		expect(head).toContain("fonts.googleapis.com");
		expect(head).toContain("fonts.gstatic.com");
		expect(head).toContain("Inter");
		expect(head).toContain("400;700");
		expect(head).toContain("display=swap");
	});

	test("Custom font adds preload + @font-face", () => {
		renderToString(h(Font, { family: "MyFont", src: "/fonts/my.woff2" }));
		const head = flushHeadTags();
		expect(head).toContain('rel="preload"');
		expect(head).toContain("/fonts/my.woff2");
		expect(head).toContain("@font-face");
		expect(head).toContain("font-display: swap");
	});

	test("CSS variable injection", () => {
		renderToString(h(Font, { google: "Inter", variable: "--font-body" }));
		const head = flushHeadTags();
		expect(head).toContain("--font-body");
		expect(head).toContain("Inter");
	});

	test("returns null without valid props", () => {
		const result = renderToString(h(Font, {}));
		expect(result).toBe("");
	});

	test("custom weight and display", () => {
		renderToString(
			h(Font, { family: "Bold", src: "/bold.woff2", weight: "700", display: "block" }),
		);
		const head = flushHeadTags();
		expect(head).toContain("font-weight: 700");
		expect(head).toContain("font-display: block");
	});
});
