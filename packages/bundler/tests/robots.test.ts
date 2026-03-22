import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { generateRobotsTxt } from "../src/robots";

const TEST_DIR = join(import.meta.dir, "__test_robots__");

beforeEach(() => {
	mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
	rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("generateRobotsTxt", () => {
	test("generates default robots.txt", async () => {
		await generateRobotsTxt({
			outDir: TEST_DIR,
			baseURL: "https://example.com",
		});

		const txt = readFileSync(join(TEST_DIR, "robots.txt"), "utf-8");
		expect(txt).toContain("User-agent: *");
		expect(txt).toContain("Allow: /");
		expect(txt).toContain("Sitemap: https://example.com/sitemap.xml");
	});

	test("includes disallow rules", async () => {
		await generateRobotsTxt({
			outDir: TEST_DIR,
			baseURL: "https://example.com",
			config: {
				disallow: ["/admin", "/api", "/private"],
			},
		});

		const txt = readFileSync(join(TEST_DIR, "robots.txt"), "utf-8");
		expect(txt).toContain("Disallow: /admin");
		expect(txt).toContain("Disallow: /api");
		expect(txt).toContain("Disallow: /private");
	});

	test("includes crawl delay", async () => {
		await generateRobotsTxt({
			outDir: TEST_DIR,
			baseURL: "https://example.com",
			config: { crawlDelay: 2 },
		});

		const txt = readFileSync(join(TEST_DIR, "robots.txt"), "utf-8");
		expect(txt).toContain("Crawl-delay: 2");
	});

	test("supports per-agent rules", async () => {
		await generateRobotsTxt({
			outDir: TEST_DIR,
			baseURL: "https://example.com",
			config: {
				rules: [
					{ userAgent: "Googlebot", allow: ["/"] },
					{ userAgent: "Bingbot", disallow: ["/private"] },
				],
			},
		});

		const txt = readFileSync(join(TEST_DIR, "robots.txt"), "utf-8");
		expect(txt).toContain("User-agent: Googlebot");
		expect(txt).toContain("User-agent: Bingbot");
		expect(txt).toContain("Disallow: /private");
	});

	test("strips trailing slash from baseURL", async () => {
		await generateRobotsTxt({
			outDir: TEST_DIR,
			baseURL: "https://example.com/",
		});

		const txt = readFileSync(join(TEST_DIR, "robots.txt"), "utf-8");
		expect(txt).toContain("Sitemap: https://example.com/sitemap.xml");
		expect(txt).not.toContain("https://example.com//sitemap.xml");
	});
});
