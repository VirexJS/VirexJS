import { afterAll, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildProduction } from "../src/build";

const testDir = join(tmpdir(), `virex-build-test-${Date.now()}`);
const srcDir = join(testDir, "src");
const outDir = join(testDir, "dist");
const publicDir = join(testDir, "public");

beforeAll(() => {
	// Create minimal project structure
	mkdirSync(join(srcDir, "pages"), { recursive: true });
	mkdirSync(publicDir, { recursive: true });

	// Simple index page
	writeFileSync(
		join(srcDir, "pages", "index.tsx"),
		`
		export default function Home() {
			return { type: "div", props: { children: ["Hello World"] } };
		}
	`,
	);

	// About page with meta
	writeFileSync(
		join(srcDir, "pages", "about.tsx"),
		`
		export function meta() {
			return { title: "About" };
		}
		export default function About() {
			return { type: "h1", props: { children: ["About Page"] } };
		}
	`,
	);

	// Static file
	writeFileSync(join(publicDir, "robots.txt"), "User-agent: *\nAllow: /\n");
});

afterAll(() => {
	rmSync(testDir, { recursive: true, force: true });
});

import { beforeAll } from "bun:test";

describe("buildProduction", () => {
	test("builds pages and returns stats", async () => {
		const result = await buildProduction({
			srcDir,
			outDir,
			publicDir,
			minify: false,
		});

		expect(result.pages).toBeGreaterThanOrEqual(1);
		expect(result.assets).toBeGreaterThanOrEqual(1); // robots.txt
		expect(result.totalSize).toBeGreaterThan(0);
		expect(result.time).toBeGreaterThanOrEqual(0);
	});

	test("creates output directory", async () => {
		expect(existsSync(outDir)).toBe(true);
	});

	test("generates index.html", async () => {
		const indexPath = join(outDir, "index.html");
		expect(existsSync(indexPath)).toBe(true);

		const html = readFileSync(indexPath, "utf-8");
		expect(html).toContain("<!DOCTYPE html>");
		expect(html).toContain("Hello World");
	});

	test("generates about/index.html", async () => {
		const aboutPath = join(outDir, "about", "index.html");
		expect(existsSync(aboutPath)).toBe(true);

		const html = readFileSync(aboutPath, "utf-8");
		expect(html).toContain("About Page");
	});

	test("copies public assets", async () => {
		const robotsPath = join(outDir, "robots.txt");
		expect(existsSync(robotsPath)).toBe(true);
		expect(readFileSync(robotsPath, "utf-8")).toContain("User-agent");
	});

	test("creates manifest.json", async () => {
		const manifestPath = join(outDir, "manifest.json");
		expect(existsSync(manifestPath)).toBe(true);

		const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
		expect(manifest.version).toBe("0.2.0");
		expect(Array.isArray(manifest.pages)).toBe(true);
	});

	test("skips special pages (_404, _error)", async () => {
		// Add a _404 page
		writeFileSync(
			join(srcDir, "pages", "_404.tsx"),
			`
			export default function NotFound() {
				return { type: "h1", props: { children: ["Not Found"] } };
			}
		`,
		);

		const newOutDir = join(testDir, "dist-skip");
		const _result = await buildProduction({
			srcDir,
			outDir: newOutDir,
			publicDir,
			minify: false,
		});

		// _404 should not be rendered as a regular page
		expect(existsSync(join(newOutDir, "_404", "index.html"))).toBe(false);
	});
});
