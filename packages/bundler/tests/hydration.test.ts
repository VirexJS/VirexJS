import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateHydrationRuntime } from "../src/hydration-runtime";
import { bundleIslands } from "../src/island-bundle";

const TEST_DIR = join(import.meta.dir, "__test_hydration__");

beforeEach(() => {
	mkdirSync(join(TEST_DIR, "islands"), { recursive: true });
	mkdirSync(join(TEST_DIR, "out"), { recursive: true });
});

afterEach(() => {
	rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("generateHydrationRuntime", () => {
	test("generates valid JavaScript", () => {
		const script = generateHydrationRuntime("/_virex/islands/");
		expect(script).toContain("discoverIslands");
		expect(script).toContain("scheduleHydration");
		expect(script).toContain("/_virex/islands/");
	});

	test("contains all hydration strategies", () => {
		const script = generateHydrationRuntime("/assets/");
		expect(script).toContain('"immediate"');
		expect(script).toContain('"visible"');
		expect(script).toContain('"interaction"');
		expect(script).toContain('"idle"');
	});

	test("uses IntersectionObserver for visible strategy", () => {
		const script = generateHydrationRuntime("/");
		expect(script).toContain("IntersectionObserver");
	});

	test("uses requestIdleCallback for idle strategy", () => {
		const script = generateHydrationRuntime("/");
		expect(script).toContain("requestIdleCallback");
	});

	test("auto-reconnect and module loading", () => {
		const script = generateHydrationRuntime("/islands/");
		expect(script).toContain("loadIsland");
		expect(script).toContain("import(url)");
	});

	test("uses custom base path", () => {
		const script = generateHydrationRuntime("/custom/path/");
		expect(script).toContain("/custom/path/");
	});
});

describe("bundleIslands", () => {
	test("returns empty result for no islands", async () => {
		// Empty directory — no islands
		const emptyDir = join(TEST_DIR, "empty");
		mkdirSync(emptyDir, { recursive: true });

		const result = await bundleIslands({
			srcDir: emptyDir,
			outDir: join(TEST_DIR, "out"),
		});

		expect(result.bundles.size).toBe(0);
		expect(result.totalSize).toBe(0);
	});

	test("detects islands from islands/ directory", async () => {
		writeFileSync(
			join(TEST_DIR, "islands", "Toggle.tsx"),
			'export default function Toggle(props: { on?: boolean }) { return { type: "button", props: { children: [props.on ? "ON" : "OFF"] } }; }',
		);

		const result = await bundleIslands({
			srcDir: TEST_DIR,
			outDir: join(TEST_DIR, "out"),
			minify: false,
		});

		expect(result.bundles.size).toBe(1);
		expect(result.bundles.has("Toggle")).toBe(true);
		expect(result.totalSize).toBeGreaterThan(0);
	});
});
