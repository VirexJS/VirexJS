import { describe, test, expect, afterAll } from "bun:test";
import { generate } from "../src/cli/generate";
import { existsSync, readFileSync, rmSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const testDir = join(tmpdir(), "virex-generate-test-" + Date.now());
const originalCwd = process.cwd();

// Setup a fake project structure
mkdirSync(join(testDir, "src/pages"), { recursive: true });
mkdirSync(join(testDir, "src/components"), { recursive: true });
mkdirSync(join(testDir, "src/api"), { recursive: true });
mkdirSync(join(testDir, "src/middleware"), { recursive: true });
mkdirSync(join(testDir, "src/islands"), { recursive: true });

afterAll(() => {
	process.chdir(originalCwd);
	rmSync(testDir, { recursive: true, force: true });
});

describe("virex generate", () => {
	test("generates a page", async () => {
		process.chdir(testDir);
		await generate(["page", "about"]);

		const filePath = join(testDir, "src/pages/about.tsx");
		expect(existsSync(filePath)).toBe(true);

		const content = readFileSync(filePath, "utf-8");
		expect(content).toContain("export default function About");
		expect(content).toContain("useHead");
		expect(content).toContain("PageProps");
	});

	test("generates a nested page", async () => {
		process.chdir(testDir);
		await generate(["page", "blog/archive"]);

		const filePath = join(testDir, "src/pages/blog/archive.tsx");
		expect(existsSync(filePath)).toBe(true);

		const content = readFileSync(filePath, "utf-8");
		expect(content).toContain("BlogArchive");
	});

	test("generates a component", async () => {
		process.chdir(testDir);
		await generate(["component", "Card"]);

		const filePath = join(testDir, "src/components/Card.tsx");
		expect(existsSync(filePath)).toBe(true);

		const content = readFileSync(filePath, "utf-8");
		expect(content).toContain("export default function Card");
		expect(content).toContain("CardProps");
	});

	test("generates an API route", async () => {
		process.chdir(testDir);
		await generate(["api", "users"]);

		const filePath = join(testDir, "src/api/users.ts");
		expect(existsSync(filePath)).toBe(true);

		const content = readFileSync(filePath, "utf-8");
		expect(content).toContain("defineAPIRoute");
		expect(content).toContain("export const GET");
		expect(content).toContain("export const POST");
		expect(content).toContain("json");
	});

	test("generates middleware", async () => {
		process.chdir(testDir);
		await generate(["middleware", "auth"]);

		const filePath = join(testDir, "src/middleware/auth.ts");
		expect(existsSync(filePath)).toBe(true);

		const content = readFileSync(filePath, "utf-8");
		expect(content).toContain("defineMiddleware");
		expect(content).toContain("next()");
	});

	test("generates an island", async () => {
		process.chdir(testDir);
		await generate(["island", "Toggle"]);

		const filePath = join(testDir, "src/islands/Toggle.tsx");
		expect(existsSync(filePath)).toBe(true);

		const content = readFileSync(filePath, "utf-8");
		expect(content).toContain('"use island"');
		expect(content).toContain("export default function Toggle");
	});

	test("does not overwrite existing file", async () => {
		process.chdir(testDir);
		// about.tsx already exists from earlier test
		await generate(["page", "about"]);
		// Should print error but not crash
	});

	test("shows help without args", async () => {
		process.chdir(testDir);
		await generate([]);
		// Should print usage info
	});
});
