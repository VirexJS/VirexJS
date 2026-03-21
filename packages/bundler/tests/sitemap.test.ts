import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { generateSitemap } from "../src/sitemap";

const TEST_DIR = join(import.meta.dir, "__test_sitemap__");

beforeEach(() => {
	mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
	rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("generateSitemap", () => {
	test("generates valid XML", async () => {
		await generateSitemap({
			outDir: TEST_DIR,
			baseURL: "https://example.com",
			pages: ["index.tsx", "about.tsx"],
		});

		const xml = readFileSync(join(TEST_DIR, "sitemap.xml"), "utf-8");
		expect(xml).toContain('<?xml version="1.0"');
		expect(xml).toContain("urlset");
		expect(xml).toContain("https://example.com/");
		expect(xml).toContain("https://example.com/about");
	});

	test("handles index.tsx as root path", async () => {
		await generateSitemap({
			outDir: TEST_DIR,
			baseURL: "https://example.com",
			pages: ["index.tsx"],
		});

		const xml = readFileSync(join(TEST_DIR, "sitemap.xml"), "utf-8");
		expect(xml).toContain("<loc>https://example.com/</loc>");
	});

	test("handles nested pages", async () => {
		await generateSitemap({
			outDir: TEST_DIR,
			baseURL: "https://example.com",
			pages: ["blog/index.tsx", "docs/getting-started.tsx"],
		});

		const xml = readFileSync(join(TEST_DIR, "sitemap.xml"), "utf-8");
		expect(xml).toContain("https://example.com/blog");
		expect(xml).toContain("https://example.com/docs/getting-started");
	});

	test("handles SSG pages with resolved params", async () => {
		await generateSitemap({
			outDir: TEST_DIR,
			baseURL: "https://example.com",
			pages: ["blog/[slug].tsx [hello-world]"],
		});

		const xml = readFileSync(join(TEST_DIR, "sitemap.xml"), "utf-8");
		expect(xml).toContain("https://example.com/blog/hello-world");
	});

	test("strips trailing slash from baseURL", async () => {
		await generateSitemap({
			outDir: TEST_DIR,
			baseURL: "https://example.com/",
			pages: ["about.tsx"],
		});

		const xml = readFileSync(join(TEST_DIR, "sitemap.xml"), "utf-8");
		expect(xml).toContain("https://example.com/about");
		expect(xml).not.toContain("https://example.com//about");
	});

	test("includes lastmod date", async () => {
		await generateSitemap({
			outDir: TEST_DIR,
			baseURL: "https://example.com",
			pages: ["index.tsx"],
		});

		const xml = readFileSync(join(TEST_DIR, "sitemap.xml"), "utf-8");
		expect(xml).toContain("<lastmod>");
		// Should be today's date in YYYY-MM-DD format
		const today = new Date().toISOString().split("T")[0]!;
		expect(xml).toContain(today);
	});
});
