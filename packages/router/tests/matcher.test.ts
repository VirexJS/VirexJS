import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { matchRoute } from "../src/matcher";
import { scanPages } from "../src/scanner";
import { buildTree } from "../src/tree";

const TEST_DIR = join(import.meta.dir, "__test_match_pages__");

function createFile(relativePath: string): void {
	const fullPath = join(TEST_DIR, relativePath);
	const dir = fullPath.slice(
		0,
		fullPath.lastIndexOf("/") >= 0 ? fullPath.lastIndexOf("/") : fullPath.lastIndexOf("\\"),
	);
	mkdirSync(dir, { recursive: true });
	writeFileSync(fullPath, "");
}

function buildRouteTree() {
	const routes = scanPages(TEST_DIR);
	return buildTree(routes);
}

beforeEach(() => {
	mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
	rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("matchRoute", () => {
	test("/ matches index", () => {
		createFile("index.tsx");
		const tree = buildRouteTree();
		const result = matchRoute("/", tree);
		expect(result).not.toBeNull();
		expect(result?.path).toBe("/");
		expect(result?.params).toEqual({});
	});

	test("/about matches about.tsx", () => {
		createFile("about.tsx");
		const tree = buildRouteTree();
		const result = matchRoute("/about", tree);
		expect(result).not.toBeNull();
		expect(result?.path).toBe("/about");
	});

	test("/blog matches blog/index.tsx", () => {
		createFile("blog/index.tsx");
		const tree = buildRouteTree();
		const result = matchRoute("/blog", tree);
		expect(result).not.toBeNull();
		expect(result?.path).toBe("/blog");
	});

	test("/blog/my-post matches blog/[slug].tsx with params", () => {
		createFile("blog/[slug].tsx");
		const tree = buildRouteTree();
		const result = matchRoute("/blog/my-post", tree);
		expect(result).not.toBeNull();
		expect(result?.params).toEqual({ slug: "my-post" });
	});

	test("query string is parsed", () => {
		createFile("blog/[slug].tsx");
		const tree = buildRouteTree();
		const result = matchRoute("/blog/my-post?page=2&sort=date", tree);
		expect(result).not.toBeNull();
		expect(result?.query).toEqual({ page: "2", sort: "date" });
		expect(result?.params).toEqual({ slug: "my-post" });
	});

	test("/nonexistent returns null", () => {
		createFile("index.tsx");
		const tree = buildRouteTree();
		const result = matchRoute("/nonexistent", tree);
		expect(result).toBeNull();
	});

	test("static wins over dynamic", () => {
		createFile("blog/featured.tsx");
		createFile("blog/[slug].tsx");
		const tree = buildRouteTree();
		const result = matchRoute("/blog/featured", tree);
		expect(result).not.toBeNull();
		expect(result?.route.filePath).toBe(join(TEST_DIR, "blog/featured.tsx"));
	});

	test("catch-all matches any depth", () => {
		createFile("docs/[...rest].tsx");
		const tree = buildRouteTree();
		const result = matchRoute("/docs/getting-started/intro", tree);
		expect(result).not.toBeNull();
		expect(result?.params).toEqual({ rest: "getting-started/intro" });
	});

	test("URL-encoded params are decoded", () => {
		createFile("blog/[slug].tsx");
		const tree = buildRouteTree();
		const result = matchRoute("/blog/hello%20world", tree);
		expect(result).not.toBeNull();
		expect(result?.params).toEqual({ slug: "hello world" });
	});

	test("trailing slash is normalized", () => {
		createFile("about.tsx");
		const tree = buildRouteTree();
		const result = matchRoute("/about/", tree);
		expect(result).not.toBeNull();
		expect(result?.path).toBe("/about");
	});

	test("root with trailing slash works", () => {
		createFile("index.tsx");
		const tree = buildRouteTree();
		const result = matchRoute("/", tree);
		expect(result).not.toBeNull();
	});

	test("deeply nested static route", () => {
		createFile("docs/guides/install.tsx");
		const tree = buildRouteTree();
		const result = matchRoute("/docs/guides/install", tree);
		expect(result).not.toBeNull();
	});

	test("empty query string returns empty object", () => {
		createFile("index.tsx");
		const tree = buildRouteTree();
		const result = matchRoute("/", tree);
		expect(result).not.toBeNull();
		expect(result?.query).toEqual({});
	});

	test("query with no value", () => {
		createFile("index.tsx");
		const tree = buildRouteTree();
		const result = matchRoute("/?debug", tree);
		expect(result).not.toBeNull();
		expect(result?.query).toEqual({ debug: "" });
	});

	test("route group — (auth)/login.tsx matches /login", () => {
		createFile("(auth)/login.tsx");
		const tree = buildRouteTree();
		const result = matchRoute("/login", tree);
		expect(result).not.toBeNull();
		expect(result?.path).toBe("/login");
	});

	test("route group — (auth)/register.tsx matches /register", () => {
		createFile("(auth)/register.tsx");
		const tree = buildRouteTree();
		const result = matchRoute("/register", tree);
		expect(result).not.toBeNull();
	});

	test("route group — nested (marketing)/pricing.tsx matches /pricing", () => {
		createFile("(marketing)/pricing.tsx");
		const tree = buildRouteTree();
		const result = matchRoute("/pricing", tree);
		expect(result).not.toBeNull();
	});

	test("multiple dynamic params in path", () => {
		createFile("users/[userId]/posts/[postId].tsx");
		const tree = buildRouteTree();
		const result = matchRoute("/users/42/posts/99", tree);
		expect(result).not.toBeNull();
		expect(result?.params).toEqual({ userId: "42", postId: "99" });
	});

	test("catch-all single segment", () => {
		createFile("docs/[...rest].tsx");
		const tree = buildRouteTree();
		const result = matchRoute("/docs/intro", tree);
		expect(result).not.toBeNull();
		expect(result?.params).toEqual({ rest: "intro" });
	});
});
