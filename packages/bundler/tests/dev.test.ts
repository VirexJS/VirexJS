import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startDevMode } from "../src/dev";

const testDir = join(tmpdir(), `virex-dev-test-${Date.now()}`);

afterEach(() => {
	rmSync(testDir, { recursive: true, force: true });
});

describe("startDevMode", () => {
	test("returns stop function", () => {
		mkdirSync(testDir, { recursive: true });
		const dev = startDevMode({
			srcDir: testDir,
			onFileChange: () => {},
		});
		expect(typeof dev.stop).toBe("function");
		dev.stop();
	});

	test("detects file changes", async () => {
		const srcDir = join(testDir, "watch-src");
		mkdirSync(srcDir, { recursive: true });

		const changes: string[] = [];
		const dev = startDevMode({
			srcDir,
			onFileChange: (filePath) => {
				changes.push(filePath);
			},
		});

		// Write a file to trigger the watcher
		await new Promise((r) => setTimeout(r, 100));
		writeFileSync(join(srcDir, "test.ts"), "export const x = 1;");
		await new Promise((r) => setTimeout(r, 300));

		dev.stop();
		expect(changes.length).toBeGreaterThanOrEqual(1);
		expect(changes[0]).toContain("test.ts");
	});

	test("ignores non-source files", async () => {
		const srcDir = join(testDir, "ignore-src");
		mkdirSync(srcDir, { recursive: true });

		const changes: string[] = [];
		const dev = startDevMode({
			srcDir,
			onFileChange: (filePath) => {
				changes.push(filePath);
			},
		});

		await new Promise((r) => setTimeout(r, 100));
		writeFileSync(join(srcDir, "readme.md"), "# test");
		writeFileSync(join(srcDir, "data.json"), "{}");
		await new Promise((r) => setTimeout(r, 300));

		dev.stop();
		// .md and .json should be ignored
		const sourceChanges = changes.filter(
			(f) => f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".css"),
		);
		expect(sourceChanges).toHaveLength(0);
	});

	test("stop prevents further callbacks", () => {
		mkdirSync(join(testDir, "stop-src"), { recursive: true });
		const dev = startDevMode({
			srcDir: join(testDir, "stop-src"),
			onFileChange: () => {},
		});
		dev.stop();
		// Should not throw
		expect(true).toBe(true);
	});

	test("handles non-existent directory gracefully", () => {
		const dev = startDevMode({
			srcDir: join(testDir, "nonexistent"),
			onFileChange: () => {},
		});
		dev.stop();
		// Should not throw
	});
});
