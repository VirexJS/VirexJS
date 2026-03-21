import { describe, test, expect, afterEach } from "bun:test";
import { rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const CLI_PATH = join(import.meta.dir, "../src/cli/index.ts");
const TEST_PROJECT_DIR = join(import.meta.dir, "__test_init_project__");

afterEach(() => {
	rmSync(TEST_PROJECT_DIR, { recursive: true, force: true });
});

/** Run CLI command and return stdout */
function runCLI(...args: string[]): string {
	return execFileSync("bun", ["run", CLI_PATH, ...args], {
		encoding: "utf-8",
		timeout: 10000,
	});
}

/** Run CLI command in a specific working directory */
function runCLIIn(cwd: string, ...args: string[]): { stdout: string; exitCode: number } {
	try {
		const stdout = execFileSync("bun", ["run", CLI_PATH, ...args], {
			encoding: "utf-8",
			cwd,
			timeout: 10000,
		});
		return { stdout, exitCode: 0 };
	} catch (err: unknown) {
		const e = err as { stdout?: string; stderr?: string; status?: number };
		return { stdout: (e.stdout ?? "") + (e.stderr ?? ""), exitCode: e.status ?? 1 };
	}
}

describe("CLI — version", () => {
	test("--version prints version", () => {
		const result = runCLI("--version");
		expect(result.trim()).toBe("virexjs 0.1.0");
	});

	test("-v prints version", () => {
		const result = runCLI("-v");
		expect(result.trim()).toBe("virexjs 0.1.0");
	});
});

describe("CLI — help", () => {
	test("--help shows usage", () => {
		const result = runCLI("--help");
		expect(result).toContain("VirexJS");
		expect(result).toContain("dev");
		expect(result).toContain("build");
		expect(result).toContain("preview");
		expect(result).toContain("init");
	});

	test("no args shows help", () => {
		const result = runCLI();
		expect(result).toContain("Usage:");
	});
});

describe("CLI — init", () => {
	test("creates project structure", () => {
		const cwd = import.meta.dir;
		runCLIIn(cwd, "init", "__test_init_project__");

		expect(existsSync(join(TEST_PROJECT_DIR, "package.json"))).toBe(true);
		expect(existsSync(join(TEST_PROJECT_DIR, "tsconfig.json"))).toBe(true);
		expect(existsSync(join(TEST_PROJECT_DIR, "virex.config.ts"))).toBe(true);
		expect(existsSync(join(TEST_PROJECT_DIR, "src/pages/index.tsx"))).toBe(true);
		expect(existsSync(join(TEST_PROJECT_DIR, "src/pages/about.tsx"))).toBe(true);
		expect(existsSync(join(TEST_PROJECT_DIR, "src/api/hello.ts"))).toBe(true);
		expect(existsSync(join(TEST_PROJECT_DIR, "public/robots.txt"))).toBe(true);
		expect(existsSync(join(TEST_PROJECT_DIR, ".gitignore"))).toBe(true);
	});

	test("package.json has correct name", () => {
		const cwd = import.meta.dir;
		runCLIIn(cwd, "init", "__test_init_project__");

		const pkg = JSON.parse(readFileSync(join(TEST_PROJECT_DIR, "package.json"), "utf-8"));
		expect(pkg.name).toBe("__test_init_project__");
		expect(pkg.dependencies.virexjs).toBeDefined();
	});

	test("virex.config.ts uses defineConfig", () => {
		const cwd = import.meta.dir;
		runCLIIn(cwd, "init", "__test_init_project__");

		const config = readFileSync(join(TEST_PROJECT_DIR, "virex.config.ts"), "utf-8");
		expect(config).toContain("defineConfig");
		expect(config).toContain("port: 3000");
	});

	test("fails if directory already exists", () => {
		const cwd = import.meta.dir;
		runCLIIn(cwd, "init", "__test_init_project__");
		// Try again — should fail
		const result = runCLIIn(cwd, "init", "__test_init_project__");
		expect(result.stdout).toContain("already exists");
	});
});
