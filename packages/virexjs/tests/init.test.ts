import { afterAll, describe, expect, test } from "bun:test";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { init } from "../src/cli/init";

const testDir = join(tmpdir(), `virex-init-test-${Date.now()}`);
const originalCwd = process.cwd();

afterAll(() => {
	process.chdir(originalCwd);
	rmSync(testDir, { recursive: true, force: true });
});

describe("virex init", () => {
	test("scaffolds a new project with correct structure", async () => {
		const { mkdirSync } = await import("node:fs");
		mkdirSync(testDir, { recursive: true });
		process.chdir(testDir);

		await init(["test-app"]);

		const projectDir = join(testDir, "test-app");

		// Check directories exist
		expect(existsSync(join(projectDir, "src/pages"))).toBe(true);
		expect(existsSync(join(projectDir, "src/components"))).toBe(true);
		expect(existsSync(join(projectDir, "src/islands"))).toBe(true);
		expect(existsSync(join(projectDir, "src/layouts"))).toBe(true);
		expect(existsSync(join(projectDir, "src/api"))).toBe(true);
		expect(existsSync(join(projectDir, "src/middleware"))).toBe(true);
		expect(existsSync(join(projectDir, "public"))).toBe(true);
	});

	test("creates package.json with correct content", () => {
		const projectDir = join(testDir, "test-app");
		const pkg = JSON.parse(readFileSync(join(projectDir, "package.json"), "utf-8"));

		expect(pkg.name).toBe("test-app");
		expect(pkg.scripts.dev).toBe("virex dev");
		expect(pkg.scripts.build).toBe("virex build");
		expect(pkg.dependencies.virexjs).toBeDefined();
	});

	test("creates tsconfig.json with JSX config", () => {
		const projectDir = join(testDir, "test-app");
		const tsconfig = JSON.parse(readFileSync(join(projectDir, "tsconfig.json"), "utf-8"));

		expect(tsconfig.compilerOptions.jsx).toBe("react-jsx");
		expect(tsconfig.compilerOptions.jsxImportSource).toBe("virexjs");
		expect(tsconfig.compilerOptions.strict).toBe(true);
	});

	test("creates virex.config.ts", () => {
		const projectDir = join(testDir, "test-app");
		const config = readFileSync(join(projectDir, "virex.config.ts"), "utf-8");

		expect(config).toContain("defineConfig");
		expect(config).toContain("port: 3000");
	});

	test("creates index and about pages", () => {
		const projectDir = join(testDir, "test-app");

		const indexPage = readFileSync(join(projectDir, "src/pages/index.tsx"), "utf-8");
		expect(indexPage).toContain("Welcome to VirexJS");
		expect(indexPage).toContain("test-app");

		const aboutPage = readFileSync(join(projectDir, "src/pages/about.tsx"), "utf-8");
		expect(aboutPage).toContain("About");
	});

	test("creates API route", () => {
		const projectDir = join(testDir, "test-app");
		const api = readFileSync(join(projectDir, "src/api/hello.ts"), "utf-8");

		expect(api).toContain("defineAPIRoute");
		expect(api).toContain("Hello from VirexJS");
	});

	test("creates robots.txt and .gitignore", () => {
		const projectDir = join(testDir, "test-app");

		const robots = readFileSync(join(projectDir, "public/robots.txt"), "utf-8");
		expect(robots).toContain("User-agent: *");

		const gitignore = readFileSync(join(projectDir, ".gitignore"), "utf-8");
		expect(gitignore).toContain("node_modules");
		expect(gitignore).toContain("dist");
	});

	test("uses default name when no argument", async () => {
		const subDir = join(testDir, "default-test");
		const { mkdirSync } = await import("node:fs");
		mkdirSync(subDir, { recursive: true });
		process.chdir(subDir);

		await init([]);

		expect(existsSync(join(subDir, "my-virex-app"))).toBe(true);
		const pkg = JSON.parse(readFileSync(join(subDir, "my-virex-app", "package.json"), "utf-8"));
		expect(pkg.name).toBe("my-virex-app");
	});
});
