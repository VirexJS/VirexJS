import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { generateUtilityCSS } from "../src/css-engine";

const TEST_DIR = join(import.meta.dir, "__test_css_engine__");

beforeEach(() => {
	mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
	rmSync(TEST_DIR, { recursive: true, force: true });
});

function createFile(name: string, content: string): void {
	writeFileSync(join(TEST_DIR, name), content);
}

describe("generateUtilityCSS", () => {
	test("empty directory returns empty string", () => {
		expect(generateUtilityCSS(TEST_DIR)).toBe("");
	});

	test("generates flex utility", () => {
		createFile("page.tsx", '<div className="flex items-center">');
		const css = generateUtilityCSS(TEST_DIR);
		expect(css).toContain(".flex{display:flex}");
		expect(css).toContain(".items-center{align-items:center}");
	});

	test("generates spacing utilities", () => {
		createFile("page.tsx", '<div className="p-4 m-2 px-8">');
		const css = generateUtilityCSS(TEST_DIR);
		expect(css).toContain(".p-4{padding:1rem}");
		expect(css).toContain(".m-2{margin:0.5rem}");
		expect(css).toContain(".px-8{padding-left:2rem;padding-right:2rem}");
	});

	test("generates text color utilities", () => {
		createFile("page.tsx", '<p className="text-red text-blue-500">');
		const css = generateUtilityCSS(TEST_DIR);
		expect(css).toContain("color:#ef4444");
		expect(css).toContain("color:#3b82f6");
	});

	test("generates background color utilities", () => {
		createFile("page.tsx", '<div className="bg-blue-100 bg-white">');
		const css = generateUtilityCSS(TEST_DIR);
		expect(css).toContain("background-color:#dbeafe");
		expect(css).toContain("background-color:#fff");
	});

	test("generates text size utilities", () => {
		createFile("page.tsx", '<h1 className="text-3xl font-bold">');
		const css = generateUtilityCSS(TEST_DIR);
		expect(css).toContain("font-size:1.875rem");
		expect(css).toContain("font-weight:700");
	});

	test("generates border radius utilities", () => {
		createFile("page.tsx", '<div className="rounded-lg shadow-md">');
		const css = generateUtilityCSS(TEST_DIR);
		expect(css).toContain("border-radius:0.5rem");
		expect(css).toContain("box-shadow");
	});

	test("generates gap utility", () => {
		createFile("page.tsx", '<div className="flex gap-4">');
		const css = generateUtilityCSS(TEST_DIR);
		expect(css).toContain(".gap-4{gap:1rem}");
	});

	test("generates display utilities", () => {
		createFile("page.tsx", '<div className="hidden block inline-block">');
		const css = generateUtilityCSS(TEST_DIR);
		expect(css).toContain(".hidden{display:none}");
		expect(css).toContain(".block{display:block}");
	});

	test("generates cursor utilities", () => {
		createFile("page.tsx", '<button className="cursor-pointer">');
		const css = generateUtilityCSS(TEST_DIR);
		expect(css).toContain(".cursor-pointer{cursor:pointer}");
	});

	test("ignores non-tsx files", () => {
		createFile("styles.css", ".flex { display: flex }");
		createFile("data.json", '{"className": "flex"}');
		expect(generateUtilityCSS(TEST_DIR)).toBe("");
	});

	test("handles multiple classes on same element", () => {
		createFile("page.tsx", '<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">');
		const css = generateUtilityCSS(TEST_DIR);
		expect(css).toContain(".flex{display:flex}");
		expect(css).toContain(".items-center");
		expect(css).toContain(".justify-between");
		expect(css).toContain(".p-4");
		expect(css).toContain(".bg-white");
		expect(css).toContain(".rounded-lg");
		expect(css).toContain(".shadow{");
	});

	test("deduplicates classes across files", () => {
		createFile("a.tsx", '<div className="flex">');
		createFile("b.tsx", '<div className="flex">');
		const css = generateUtilityCSS(TEST_DIR);
		const flexCount = css.split(".flex{").length - 1;
		expect(flexCount).toBe(1);
	});

	test("generates directional margin", () => {
		createFile("page.tsx", '<div className="mt-4 mr-2 mb-8 ml-auto">');
		const css = generateUtilityCSS(TEST_DIR);
		expect(css).toContain("margin-top:1rem");
		expect(css).toContain("margin-right:0.5rem");
		expect(css).toContain("margin-bottom:2rem");
		expect(css).toContain("margin-left:auto");
	});
});
