import { beforeEach, describe, expect, test } from "bun:test";
import { flushHeadTags, resetHeadCollector } from "../src/render/head";
import { h, renderToString } from "../src/render/jsx";
import { Script } from "../src/render/script";

beforeEach(() => {
	resetHeadCollector();
});

describe("Script component", () => {
	test("renders script with defer by default", () => {
		renderToString(h(Script, { src: "/app.js" }));
		const head = flushHeadTags();
		expect(head).toContain('src="/app.js"');
		expect(head).toContain("defer");
	});

	test("renders with async strategy", () => {
		renderToString(h(Script, { src: "/analytics.js", strategy: "async" }));
		const head = flushHeadTags();
		expect(head).toContain("async");
	});

	test("renders with eager strategy (no defer/async)", () => {
		renderToString(h(Script, { src: "/critical.js", strategy: "eager" }));
		const head = flushHeadTags();
		expect(head).toContain('src="/critical.js"');
		expect(head).not.toContain("defer");
		expect(head).not.toContain("async");
	});

	test("lazy strategy adds data-strategy attribute", () => {
		renderToString(h(Script, { src: "/widget.js", strategy: "lazy" }));
		const head = flushHeadTags();
		expect(head).toContain('data-strategy="lazy"');
	});

	test("renders with id", () => {
		renderToString(h(Script, { src: "/app.js", id: "main-script" }));
		const head = flushHeadTags();
		expect(head).toContain('id="main-script"');
	});
});
