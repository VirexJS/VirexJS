import { afterAll, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	getAction,
	getRevalidateTime,
	hasDirective,
	isCachedPage,
	isClientComponent,
	listActions,
	registerAction,
	serverAction,
	withCache,
} from "../src/directives/index";
import { invalidateISR } from "../src/server/isr";

const testDir = join(tmpdir(), `virex-directives-test-${Date.now()}`);

afterAll(() => {
	rmSync(testDir, { recursive: true, force: true });
	invalidateISR(/.*/);
});

describe("hasDirective", () => {
	test("detects use client", () => {
		mkdirSync(testDir, { recursive: true });
		writeFileSync(join(testDir, "client.tsx"), '"use client";\nexport default function() {}');
		expect(hasDirective(join(testDir, "client.tsx"), "use client")).toBe(true);
	});

	test("detects use island", () => {
		writeFileSync(join(testDir, "island.tsx"), '// "use island"\nexport default function() {}');
		expect(hasDirective(join(testDir, "island.tsx"), "use island")).toBe(true);
	});

	test("detects use cache", () => {
		writeFileSync(join(testDir, "cached.tsx"), '"use cache";\nexport async function loader() {}');
		expect(hasDirective(join(testDir, "cached.tsx"), "use cache")).toBe(true);
	});

	test("detects use server", () => {
		writeFileSync(join(testDir, "server.ts"), '"use server";\nexport async function save() {}');
		expect(hasDirective(join(testDir, "server.ts"), "use server")).toBe(true);
	});

	test("returns false for missing directive", () => {
		writeFileSync(join(testDir, "normal.tsx"), "export default function() {}");
		expect(hasDirective(join(testDir, "normal.tsx"), "use client")).toBe(false);
	});

	test("returns false for nonexistent file", () => {
		expect(hasDirective("/nonexistent.tsx", "use client")).toBe(false);
	});
});

describe("isClientComponent", () => {
	test("true for use client", () => {
		expect(isClientComponent(join(testDir, "client.tsx"))).toBe(true);
	});

	test("true for use island", () => {
		expect(isClientComponent(join(testDir, "island.tsx"))).toBe(true);
	});

	test("false for server component", () => {
		expect(isClientComponent(join(testDir, "normal.tsx"))).toBe(false);
	});
});

describe("isCachedPage", () => {
	test("true for use cache", () => {
		expect(isCachedPage(join(testDir, "cached.tsx"))).toBe(true);
	});

	test("false for non-cached", () => {
		expect(isCachedPage(join(testDir, "normal.tsx"))).toBe(false);
	});
});

describe("getRevalidateTime", () => {
	test("returns number from revalidate export", () => {
		expect(getRevalidateTime({ revalidate: 60 })).toBe(60);
	});

	test("returns null for missing revalidate", () => {
		expect(getRevalidateTime({})).toBeNull();
	});

	test("returns null for zero", () => {
		expect(getRevalidateTime({ revalidate: 0 })).toBeNull();
	});

	test("returns null for non-number", () => {
		expect(getRevalidateTime({ revalidate: "60" })).toBeNull();
	});
});

describe("serverAction", () => {
	test("returns the function as-is on server", () => {
		const fn = async (x: number) => x * 2;
		const action = serverAction(fn);
		expect(action).toBe(fn);
	});

	test("action executes correctly", async () => {
		const double = serverAction(async (x: number) => x * 2);
		expect(await double(5)).toBe(10);
	});
});

describe("action registry", () => {
	test("register and get action", () => {
		registerAction("testAction", async (input) => input);
		expect(getAction("testAction")).toBeDefined();
	});

	test("returns undefined for unknown", () => {
		expect(getAction("unknown")).toBeUndefined();
	});

	test("listActions returns registered names", () => {
		expect(listActions()).toContain("testAction");
	});
});

describe("withCache", () => {
	test("caches response and returns HIT on second call", async () => {
		let callCount = 0;
		const render = async () => {
			callCount++;
			return new Response(`page-${callCount}`);
		};

		const r1 = await withCache("/test-cache", 60, render);
		expect(r1.headers.get("X-VirexJS-Cache")).toBe("MISS");

		const r2 = await withCache("/test-cache", 60, render);
		expect(r2.headers.get("X-VirexJS-Cache")).toBe("HIT");
		expect(callCount).toBe(1); // only called once
	});
});
