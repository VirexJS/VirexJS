import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CLI_PATH = join(import.meta.dir, "../src/cli/index.ts");
const TEST_DIR = join(import.meta.dir, "__test_check__");

beforeEach(() => {
	mkdirSync(join(TEST_DIR, "src/pages"), { recursive: true });
	writeFileSync(
		join(TEST_DIR, "package.json"),
		JSON.stringify({ name: "test-app", dependencies: { virexjs: "0.2.0" } }),
	);
	writeFileSync(
		join(TEST_DIR, "tsconfig.json"),
		JSON.stringify({ compilerOptions: { strict: true } }),
	);
});

afterEach(() => {
	rmSync(TEST_DIR, { recursive: true, force: true });
});

function runCheck(): { stdout: string; exitCode: number } {
	try {
		const stdout = execFileSync("bun", ["run", CLI_PATH, "check"], {
			encoding: "utf-8",
			cwd: TEST_DIR,
			timeout: 30000,
		});
		return { stdout, exitCode: 0 };
	} catch (err: unknown) {
		const e = err as { stdout?: string; stderr?: string; status?: number };
		return { stdout: (e.stdout ?? "") + (e.stderr ?? ""), exitCode: e.status ?? 1 };
	}
}

describe("virex check", () => {
	test("passes with valid project structure", () => {
		writeFileSync(
			join(TEST_DIR, "src/pages/index.tsx"),
			'export default function Home() { return null; }',
		);

		const result = runCheck();
		expect(result.stdout).toContain("Required directory exists: src/pages");
		expect(result.stdout).toContain("Index page exists");
		expect(result.stdout).toContain("package.json found");
		expect(result.stdout).toContain("tsconfig.json found");
	});

	test("warns when index page is missing", () => {
		writeFileSync(
			join(TEST_DIR, "src/pages/about.tsx"),
			'export default function About() { return null; }',
		);

		const result = runCheck();
		expect(result.stdout).toContain("No index page");
	});

	test("warns when page has no default export", () => {
		writeFileSync(join(TEST_DIR, "src/pages/index.tsx"), 'export const x = 1;');

		const result = runCheck();
		expect(result.stdout).toContain("missing default export");
	});

	test("detects islands without directive", () => {
		mkdirSync(join(TEST_DIR, "src/islands"), { recursive: true });
		writeFileSync(
			join(TEST_DIR, "src/pages/index.tsx"),
			'export default function Home() { return null; }',
		);
		writeFileSync(
			join(TEST_DIR, "src/islands/Counter.tsx"),
			'export default function Counter() { return null; }',
		);

		const result = runCheck();
		expect(result.stdout).toContain("missing");
		expect(result.stdout).toContain("directive");
	});

	test("passes for islands with use island directive", () => {
		mkdirSync(join(TEST_DIR, "src/islands"), { recursive: true });
		writeFileSync(
			join(TEST_DIR, "src/pages/index.tsx"),
			'export default function Home() { return null; }',
		);
		writeFileSync(
			join(TEST_DIR, "src/islands/Counter.tsx"),
			'"use island";\nexport default function Counter() { return null; }',
		);

		const result = runCheck();
		expect(result.stdout).toContain("1 with directive");
	});

	test("detects API routes without handlers", () => {
		mkdirSync(join(TEST_DIR, "src/api"), { recursive: true });
		writeFileSync(
			join(TEST_DIR, "src/pages/index.tsx"),
			'export default function Home() { return null; }',
		);
		writeFileSync(join(TEST_DIR, "src/api/data.ts"), 'export const config = {};');

		const result = runCheck();
		expect(result.stdout).toContain("missing GET/POST");
	});

	test("passes for valid API routes", () => {
		mkdirSync(join(TEST_DIR, "src/api"), { recursive: true });
		writeFileSync(
			join(TEST_DIR, "src/pages/index.tsx"),
			'export default function Home() { return null; }',
		);
		writeFileSync(
			join(TEST_DIR, "src/api/hello.ts"),
			'export async function GET() { return new Response("ok"); }',
		);

		const result = runCheck();
		expect(result.stdout).toContain("1 valid");
	});

	test("shows check count summary", () => {
		writeFileSync(
			join(TEST_DIR, "src/pages/index.tsx"),
			'export default function Home() { return null; }',
		);

		const result = runCheck();
		expect(result.stdout).toContain("checks in");
		expect(result.stdout).toContain("passed");
	});
});
