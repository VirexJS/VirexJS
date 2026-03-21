import { describe, test, expect, afterAll } from "bun:test";
import { bundleIslands } from "../src/island-bundle";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const testDir = join(tmpdir(), "virex-island-bundle-test-" + Date.now());

afterAll(() => {
	rmSync(testDir, { recursive: true, force: true });
});

describe("bundleIslands", () => {
	test("returns empty result when no islands", async () => {
		const srcDir = join(testDir, "empty-src");
		const outDir = join(testDir, "empty-out");
		mkdirSync(srcDir, { recursive: true });
		mkdirSync(outDir, { recursive: true });

		const result = await bundleIslands({ srcDir, outDir });
		expect(result.bundles.size).toBe(0);
		expect(result.totalSize).toBe(0);
	});

	test("bundles island from islands/ directory", async () => {
		const srcDir = join(testDir, "has-island-src");
		const outDir = join(testDir, "has-island-out");
		mkdirSync(join(srcDir, "islands"), { recursive: true });
		mkdirSync(outDir, { recursive: true });

		writeFileSync(join(srcDir, "islands", "Counter.tsx"), `
			export default function Counter(props: { initial?: number }) {
				return { type: "span", props: { children: [String(props.initial ?? 0)] } };
			}
		`);

		const result = await bundleIslands({ srcDir, outDir, minify: false });
		expect(result.bundles.size).toBe(1);
		expect(result.bundles.has("Counter")).toBe(true);
		expect(result.totalSize).toBeGreaterThan(0);
	});

	test("output goes to _virex/islands/ directory", async () => {
		const srcDir = join(testDir, "outdir-src");
		const outDir = join(testDir, "outdir-out");
		mkdirSync(join(srcDir, "islands"), { recursive: true });
		mkdirSync(outDir, { recursive: true });

		writeFileSync(join(srcDir, "islands", "Toggle.tsx"), `
			export default function Toggle() {
				return { type: "button", props: { children: ["toggle"] } };
			}
		`);

		await bundleIslands({ srcDir, outDir });
		expect(existsSync(join(outDir, "_virex", "islands"))).toBe(true);
	});

	test("bundles island with use island directive", async () => {
		const srcDir = join(testDir, "directive-src");
		const outDir = join(testDir, "directive-out");
		mkdirSync(join(srcDir, "components"), { recursive: true });
		mkdirSync(outDir, { recursive: true });

		writeFileSync(join(srcDir, "components", "Alert.tsx"), `// "use island"
			export default function Alert(props: { message: string }) {
				return { type: "div", props: { children: [props.message] } };
			}
		`);

		const result = await bundleIslands({ srcDir, outDir, minify: false });
		expect(result.bundles.has("Alert")).toBe(true);
	});
});
