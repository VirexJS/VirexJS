import { describe, test, expect, afterEach } from "bun:test";
import { rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { $ } from "bun";

const CLI_PATH = join(import.meta.dir, "../src/cli/index.ts");
const TEST_PROJECT_DIR = join(import.meta.dir, "__test_init_project__");

afterEach(() => {
	rmSync(TEST_PROJECT_DIR, { recursive: true, force: true });
});

describe("CLI — version", () => {
	test("--version prints version", async () => {
		const result = await $`bun run ${CLI_PATH} --version`.text();
		expect(result.trim()).toBe("virexjs 0.1.0");
	});

	test("-v prints version", async () => {
		const result = await $`bun run ${CLI_PATH} -v`.text();
		expect(result.trim()).toBe("virexjs 0.1.0");
	});
});

describe("CLI — help", () => {
	test("--help shows usage", async () => {
		const result = await $`bun run ${CLI_PATH} --help`.text();
		expect(result).toContain("VirexJS");
		expect(result).toContain("dev");
		expect(result).toContain("build");
		expect(result).toContain("preview");
		expect(result).toContain("init");
	});

	test("no args shows help", async () => {
		const result = await $`bun run ${CLI_PATH}`.text();
		expect(result).toContain("Usage:");
	});
});

describe("CLI — init", () => {
	test("creates project structure", async () => {
		const projectName = "__test_init_project__";
		const cwd = import.meta.dir;
		await $`cd ${cwd} && bun run ${CLI_PATH} init ${projectName}`.text();

		expect(existsSync(join(TEST_PROJECT_DIR, "package.json"))).toBe(true);
		expect(existsSync(join(TEST_PROJECT_DIR, "tsconfig.json"))).toBe(true);
		expect(existsSync(join(TEST_PROJECT_DIR, "virex.config.ts"))).toBe(true);
		expect(existsSync(join(TEST_PROJECT_DIR, "src/pages/index.tsx"))).toBe(true);
		expect(existsSync(join(TEST_PROJECT_DIR, "src/pages/about.tsx"))).toBe(true);
		expect(existsSync(join(TEST_PROJECT_DIR, "src/api/hello.ts"))).toBe(true);
		expect(existsSync(join(TEST_PROJECT_DIR, "public/robots.txt"))).toBe(true);
		expect(existsSync(join(TEST_PROJECT_DIR, ".gitignore"))).toBe(true);
	});

	test("package.json has correct name", async () => {
		const projectName = "__test_init_project__";
		const cwd = import.meta.dir;
		await $`cd ${cwd} && bun run ${CLI_PATH} init ${projectName}`.text();

		const pkg = JSON.parse(readFileSync(join(TEST_PROJECT_DIR, "package.json"), "utf-8"));
		expect(pkg.name).toBe(projectName);
		expect(pkg.dependencies.virexjs).toBeDefined();
	});

	test("virex.config.ts uses defineConfig", async () => {
		const projectName = "__test_init_project__";
		const cwd = import.meta.dir;
		await $`cd ${cwd} && bun run ${CLI_PATH} init ${projectName}`.text();

		const config = readFileSync(join(TEST_PROJECT_DIR, "virex.config.ts"), "utf-8");
		expect(config).toContain("defineConfig");
		expect(config).toContain("port: 3000");
	});

	test("fails if directory already exists", async () => {
		const projectName = "__test_init_project__";
		const cwd = import.meta.dir;
		// Create first
		await $`cd ${cwd} && bun run ${CLI_PATH} init ${projectName}`.text();
		// Try again — should fail
		const result = await $`cd ${cwd} && bun run ${CLI_PATH} init ${projectName} 2>&1`.nothrow().text();
		expect(result).toContain("already exists");
	});
});
