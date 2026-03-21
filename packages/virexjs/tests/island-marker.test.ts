import { describe, test, expect } from "bun:test";
import { isIsland, wrapIslandMarker } from "../src/render/island-marker";
import { join } from "node:path";

describe("isIsland", () => {
	test("file in islands directory returns true", () => {
		const islandsDir = "/project/src/islands";
		expect(isIsland("/project/src/islands/Counter.tsx", islandsDir)).toBe(true);
	});

	test("file outside islands directory returns false", () => {
		const islandsDir = "/project/src/islands";
		expect(isIsland("/project/src/components/Header.tsx", islandsDir)).toBe(false);
	});

	test("nested file in islands directory returns true", () => {
		const islandsDir = "/project/src/islands";
		expect(isIsland("/project/src/islands/nested/Toggle.tsx", islandsDir)).toBe(true);
	});

	test("handles Windows-style paths", () => {
		const islandsDir = join("D:", "project", "src", "islands");
		const filePath = join("D:", "project", "src", "islands", "Counter.tsx");
		expect(isIsland(filePath, islandsDir)).toBe(true);
	});
});

describe("wrapIslandMarker", () => {
	test("wraps HTML with marker comments", () => {
		const html = "<button>Click</button>";
		const result = wrapIslandMarker(html, "Counter", { initial: 0 });

		expect(result).toContain("<!--vrx-island:Counter:");
		expect(result).toContain('"initial":0');
		expect(result).toContain(':visible-->');
		expect(result).toContain('data-vrx-island="Counter"');
		expect(result).toContain("<button>Click</button>");
		expect(result).toContain("<!--/vrx-island-->");
	});

	test("uses custom hydration strategy", () => {
		const result = wrapIslandMarker("<div></div>", "Modal", {}, "interaction");
		expect(result).toContain(":interaction-->");
	});

	test("defaults to visible hydration", () => {
		const result = wrapIslandMarker("<div></div>", "Widget", {});
		expect(result).toContain(":visible-->");
	});

	test("serializes complex props", () => {
		const props = { items: [1, 2, 3], label: "test" };
		const result = wrapIslandMarker("<ul></ul>", "List", props);
		expect(result).toContain('"items":[1,2,3]');
		expect(result).toContain('"label":"test"');
	});

	test("handles empty props", () => {
		const result = wrapIslandMarker("<div></div>", "Empty", {});
		expect(result).toContain(":{}:");
	});
});
