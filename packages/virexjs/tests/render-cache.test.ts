import { beforeEach, describe, expect, test } from "bun:test";
import { h } from "../src/render/jsx";
import { cachedRender, clearRenderCache, renderCacheStats } from "../src/render/render-cache";

beforeEach(() => {
	clearRenderCache();
});

describe("cachedRender", () => {
	test("renders and caches", () => {
		let callCount = 0;
		const html = cachedRender("test1", { name: "Alice" }, () => {
			callCount++;
			return h("p", null, "Hello Alice");
		});
		expect(html).toBe("<p>Hello Alice</p>");
		expect(callCount).toBe(1);

		// Second call with same props — cached
		const html2 = cachedRender("test1", { name: "Alice" }, () => {
			callCount++;
			return h("p", null, "Hello Alice");
		});
		expect(html2).toBe("<p>Hello Alice</p>");
		expect(callCount).toBe(1); // not called again
	});

	test("re-renders on prop change", () => {
		let callCount = 0;
		cachedRender("test2", { n: 1 }, () => {
			callCount++;
			return h("span", null, "1");
		});
		cachedRender("test2", { n: 2 }, () => {
			callCount++;
			return h("span", null, "2");
		});
		expect(callCount).toBe(2);
	});

	test("different keys have separate caches", () => {
		const a = cachedRender("a", {}, () => h("div", null, "A"));
		const b = cachedRender("b", {}, () => h("div", null, "B"));
		expect(a).toBe("<div>A</div>");
		expect(b).toBe("<div>B</div>");
	});

	test("clearRenderCache empties cache", () => {
		cachedRender("x", {}, () => h("p", null, "x"));
		expect(renderCacheStats().size).toBe(1);
		clearRenderCache();
		expect(renderCacheStats().size).toBe(0);
	});

	test("TTL expiration", async () => {
		let count = 0;
		cachedRender(
			"ttl",
			{},
			() => {
				count++;
				return h("p", null, String(count));
			},
			50,
		); // 50ms TTL
		expect(count).toBe(1);

		await new Promise((r) => setTimeout(r, 60));

		cachedRender(
			"ttl",
			{},
			() => {
				count++;
				return h("p", null, String(count));
			},
			50,
		);
		expect(count).toBe(2); // expired, re-rendered
	});
});
