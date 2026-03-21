import { afterAll, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadRouteMiddleware } from "../src/server/route-middleware";

const testDir = join(tmpdir(), `virex-route-mw-test-${Date.now()}`);

afterAll(() => {
	rmSync(testDir, { recursive: true, force: true });
});

describe("loadRouteMiddleware", () => {
	test("returns empty for page with no _middleware.ts", async () => {
		mkdirSync(join(testDir, "pages"), { recursive: true });
		writeFileSync(join(testDir, "pages", "index.tsx"), "export default () => null;");
		const mw = await loadRouteMiddleware(join(testDir, "pages", "index.tsx"));
		expect(mw).toEqual([]);
	});

	test("loads _middleware.ts from page directory", async () => {
		const dir = join(testDir, "with-mw");
		mkdirSync(dir, { recursive: true });
		writeFileSync(join(dir, "_middleware.ts"), "export default async (ctx, next) => next();");
		writeFileSync(join(dir, "page.tsx"), "export default () => null;");

		const mw = await loadRouteMiddleware(join(dir, "page.tsx"));
		expect(mw.length).toBeGreaterThanOrEqual(1);
	});
});
