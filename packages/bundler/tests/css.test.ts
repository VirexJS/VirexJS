import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { processCSS } from "../src/css";

const testDir = join(tmpdir(), `virex-css-test-${Date.now()}`);
const srcDir = join(testDir, "src");
const outDir = join(testDir, "out");

beforeAll(() => {
	mkdirSync(join(srcDir, "styles"), { recursive: true });
	mkdirSync(outDir, { recursive: true });
});

afterAll(() => {
	rmSync(testDir, { recursive: true, force: true });
});

describe("processCSS", () => {
	test("returns null when no CSS files exist", async () => {
		const emptyDir = join(testDir, "empty");
		mkdirSync(emptyDir, { recursive: true });
		const result = await processCSS({ srcDir: emptyDir, outDir, minify: false });
		expect(result).toBeNull();
	});

	test("collects and concatenates CSS files", async () => {
		writeFileSync(join(srcDir, "styles", "main.css"), "body { color: red; }\n");
		writeFileSync(join(srcDir, "styles", "utils.css"), ".flex { display: flex; }\n");

		const result = await processCSS({ srcDir, outDir, minify: false });
		expect(result).not.toBeNull();
		expect(result!.filename).toMatch(/^styles\.[a-f0-9]+\.css$/);
		expect(result!.size).toBeGreaterThan(0);

		const outputPath = join(outDir, result!.filename);
		expect(existsSync(outputPath)).toBe(true);

		const content = await Bun.file(outputPath).text();
		expect(content).toContain("body { color: red; }");
		expect(content).toContain(".flex { display: flex; }");
	});

	test("minifies CSS when minify is true", async () => {
		writeFileSync(
			join(srcDir, "styles", "minify-test.css"),
			`
/* This is a comment */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
}

.empty-rule {
}
`,
		);

		const result = await processCSS({ srcDir, outDir, minify: true });
		expect(result).not.toBeNull();

		const content = await Bun.file(join(outDir, result!.filename)).text();
		// Comments should be removed
		expect(content).not.toContain("This is a comment");
		// Whitespace should be collapsed
		expect(content).not.toContain("    ");
		// Empty rules should be removed
		expect(content).not.toContain(".empty-rule{}");
		// Content should still have the actual rules
		expect(content).toContain("max-width");
	});

	test("generates different hashes for different content", async () => {
		const dir1 = join(testDir, "hash1");
		const dir2 = join(testDir, "hash2");
		mkdirSync(dir1, { recursive: true });
		mkdirSync(dir2, { recursive: true });
		writeFileSync(join(dir1, "a.css"), "body { color: blue; }");
		writeFileSync(join(dir2, "a.css"), "body { color: green; }");

		const out1 = join(testDir, "out1");
		const out2 = join(testDir, "out2");
		mkdirSync(out1, { recursive: true });
		mkdirSync(out2, { recursive: true });

		const r1 = await processCSS({ srcDir: dir1, outDir: out1, minify: false });
		const r2 = await processCSS({ srcDir: dir2, outDir: out2, minify: false });

		expect(r1?.filename).not.toBe(r2?.filename);
	});
});
