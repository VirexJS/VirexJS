import { afterAll, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type BuildManifest, writeBuildManifest } from "../src/manifest";

const testDir = join(tmpdir(), `virex-manifest-test-${Date.now()}`);

afterAll(() => {
	rmSync(testDir, { recursive: true, force: true });
});

describe("writeBuildManifest", () => {
	test("writes manifest.json to outDir", async () => {
		const outDir = join(testDir, "out1");
		mkdirSync(outDir, { recursive: true });

		const manifest: BuildManifest = {
			version: "0.1.0",
			timestamp: 1700000000000,
			pages: ["index.tsx", "about.tsx"],
			assets: { "styles.abc123.css": "styles.abc123.css" },
			css: "styles.abc123.css",
		};

		await writeBuildManifest(outDir, manifest);

		const file = Bun.file(join(outDir, "manifest.json"));
		expect(await file.exists()).toBe(true);

		const content = JSON.parse(await file.text());
		expect(content.version).toBe("0.1.0");
		expect(content.pages).toEqual(["index.tsx", "about.tsx"]);
		expect(content.css).toBe("styles.abc123.css");
	});

	test("writes formatted JSON", async () => {
		const outDir = join(testDir, "out2");
		mkdirSync(outDir, { recursive: true });

		await writeBuildManifest(outDir, {
			version: "0.1.0",
			timestamp: 0,
			pages: [],
			assets: {},
		});

		const text = await Bun.file(join(outDir, "manifest.json")).text();
		// Should be formatted with 2-space indent
		expect(text).toContain("\n  ");
	});

	test("manifest without CSS field", async () => {
		const outDir = join(testDir, "out3");
		mkdirSync(outDir, { recursive: true });

		await writeBuildManifest(outDir, {
			version: "0.1.0",
			timestamp: 0,
			pages: ["index.tsx"],
			assets: {},
		});

		const content = JSON.parse(await Bun.file(join(outDir, "manifest.json")).text());
		expect(content.css).toBeUndefined();
	});
});
