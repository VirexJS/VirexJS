import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { extractIslands } from "../src/island-extract";

const TEST_DIR = join(import.meta.dir, "__test_islands__");

function createFile(relativePath: string, content = ""): void {
	const fullPath = join(TEST_DIR, relativePath);
	const dir = fullPath.slice(
		0,
		fullPath.lastIndexOf("/") >= 0 ? fullPath.lastIndexOf("/") : fullPath.lastIndexOf("\\"),
	);
	mkdirSync(dir, { recursive: true });
	writeFileSync(fullPath, content);
}

beforeEach(() => {
	mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
	rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("extractIslands", () => {
	test("empty src returns empty map", () => {
		const islands = extractIslands(TEST_DIR);
		expect(islands.size).toBe(0);
	});

	test("file in islands/ directory is detected", () => {
		createFile("islands/Counter.tsx", "export default function Counter() {}");
		const islands = extractIslands(TEST_DIR);
		expect(islands.size).toBe(1);
		expect(islands.has("Counter")).toBe(true);
		expect(islands.get("Counter")?.name).toBe("Counter");
	});

	test("multiple island files", () => {
		createFile("islands/Counter.tsx", "export default function Counter() {}");
		createFile("islands/Toggle.tsx", "export default function Toggle() {}");
		const islands = extractIslands(TEST_DIR);
		expect(islands.size).toBe(2);
	});

	test("non-tsx files in islands/ are ignored", () => {
		createFile("islands/helper.ts", "export const x = 1;");
		createFile("islands/styles.css", "body {}");
		const islands = extractIslands(TEST_DIR);
		expect(islands.size).toBe(0);
	});

	test("file with 'use island' directive is detected", () => {
		createFile("components/Modal.tsx", '// "use island"\nexport default function Modal() {}');
		const islands = extractIslands(TEST_DIR);
		expect(islands.size).toBe(1);
		expect(islands.has("Modal")).toBe(true);
	});

	test("file without directive in components/ is not detected", () => {
		createFile("components/Header.tsx", "export default function Header() {}");
		const islands = extractIslands(TEST_DIR);
		expect(islands.size).toBe(0);
	});
});
