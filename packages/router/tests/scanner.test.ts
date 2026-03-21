import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { scanPages } from "../src/scanner";

const TEST_DIR = join(import.meta.dir, "__test_pages__");

function createFile(relativePath: string, content = ""): void {
	const fullPath = join(TEST_DIR, relativePath);
	const dir = fullPath.slice(
		0,
		fullPath.lastIndexOf("/") >= 0 ? fullPath.lastIndexOf("/") : fullPath.lastIndexOf("\\"),
	);
	mkdirSync(dir, { recursive: true });
	writeFileSync(fullPath, content);
}

beforeEach(() => {
	mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
	rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("scanPages", () => {
	test("empty directory returns empty array", () => {
		expect(scanPages(TEST_DIR)).toEqual([]);
	});

	test("single index.tsx → one route at root", () => {
		createFile("index.tsx", "export default () => <div />;");
		const routes = scanPages(TEST_DIR);
		expect(routes).toHaveLength(1);
		expect(routes[0]?.segments).toEqual([]);
		expect(routes[0]?.relativePath).toBe("index.tsx");
	});

	test("about.tsx → segments [about]", () => {
		createFile("about.tsx");
		const routes = scanPages(TEST_DIR);
		expect(routes).toHaveLength(1);
		expect(routes[0]?.segments).toEqual(["about"]);
	});

	test("nested directory — blog/index.tsx → segments [blog]", () => {
		createFile("blog/index.tsx");
		const routes = scanPages(TEST_DIR);
		expect(routes).toHaveLength(1);
		expect(routes[0]?.segments).toEqual(["blog"]);
	});

	test("dynamic param — blog/[slug].tsx → segments [blog, [slug]]", () => {
		createFile("blog/[slug].tsx");
		const routes = scanPages(TEST_DIR);
		expect(routes).toHaveLength(1);
		expect(routes[0]?.segments).toEqual(["blog", "[slug]"]);
	});

	test("catch-all — docs/[...rest].tsx → segments [docs, [...rest]]", () => {
		createFile("docs/[...rest].tsx");
		const routes = scanPages(TEST_DIR);
		expect(routes).toHaveLength(1);
		expect(routes[0]?.segments).toEqual(["docs", "[...rest]"]);
	});

	test("route groups — (auth)/login.tsx → segments [(auth), login]", () => {
		createFile("(auth)/login.tsx");
		const routes = scanPages(TEST_DIR);
		expect(routes).toHaveLength(1);
		expect(routes[0]?.segments).toEqual(["(auth)", "login"]);
	});

	test("non-tsx files are ignored", () => {
		createFile("styles.css");
		createFile("readme.md");
		createFile("data.json");
		expect(scanPages(TEST_DIR)).toEqual([]);
	});

	test(".ts files are included", () => {
		createFile("api/hello.ts");
		const routes = scanPages(TEST_DIR);
		expect(routes).toHaveLength(1);
		expect(routes[0]?.segments).toEqual(["api", "hello"]);
	});

	test("test files are ignored", () => {
		createFile("page.test.ts");
		createFile("page.test.tsx");
		expect(scanPages(TEST_DIR)).toEqual([]);
	});

	test("_404.tsx is scanned", () => {
		createFile("_404.tsx");
		const routes = scanPages(TEST_DIR);
		expect(routes).toHaveLength(1);
		expect(routes[0]?.segments).toEqual(["_404"]);
	});

	test("multiple files in same directory", () => {
		createFile("index.tsx");
		createFile("about.tsx");
		createFile("contact.tsx");
		const routes = scanPages(TEST_DIR);
		expect(routes).toHaveLength(3);
	});

	test("deeply nested routes", () => {
		createFile("docs/guides/getting-started/index.tsx");
		const routes = scanPages(TEST_DIR);
		expect(routes).toHaveLength(1);
		expect(routes[0]?.segments).toEqual(["docs", "guides", "getting-started"]);
	});

	test("absolutePath is correct", () => {
		createFile("about.tsx");
		const routes = scanPages(TEST_DIR);
		expect(routes[0]?.absolutePath).toBe(join(TEST_DIR, "about.tsx"));
	});
});
