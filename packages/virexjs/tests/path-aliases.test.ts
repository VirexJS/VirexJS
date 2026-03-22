import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const CLI_PATH = join(import.meta.dir, "../src/cli/index.ts");
const TEST_DIR = join(import.meta.dir, "__test_path_aliases__");

afterEach(() => {
	rmSync(TEST_DIR, { recursive: true, force: true });
});

function runInit(): void {
	execFileSync("bun", ["run", CLI_PATH, "init", "__test_path_aliases__"], {
		encoding: "utf-8",
		cwd: import.meta.dir,
		timeout: 10000,
	});
}

describe("@/ path aliases", () => {
	test("init creates tsconfig with @/ path alias", () => {
		runInit();
		const tsconfig = JSON.parse(readFileSync(join(TEST_DIR, "tsconfig.json"), "utf-8"));
		expect(tsconfig.compilerOptions.paths).toBeDefined();
		expect(tsconfig.compilerOptions.paths["@/*"]).toEqual(["./src/*"]);
		expect(tsconfig.compilerOptions.baseUrl).toBe(".");
	});

	test("init creates virex.config.ts with Tailwind comment", () => {
		runInit();
		const config = readFileSync(join(TEST_DIR, "virex.config.ts"), "utf-8");
		expect(config).toContain("tailwind");
	});
});
