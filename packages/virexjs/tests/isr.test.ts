import { beforeEach, describe, expect, test } from "bun:test";
import {
	getISRCache,
	getISRStats,
	invalidateISR,
	markRevalidating,
	needsRevalidation,
	setISRCache,
} from "../src/server/isr";

beforeEach(() => {
	// Clear cache between tests
	invalidateISR(/.*/);
});

describe("ISR cache", () => {
	test("set and get cached response", () => {
		setISRCache("/blog/hello", "<h1>Hello</h1>", 60);
		const res = getISRCache("/blog/hello");
		expect(res).not.toBeNull();
		expect(res!.status).toBe(200);
	});

	test("returns null for uncached path", () => {
		expect(getISRCache("/unknown")).toBeNull();
	});

	test("cache HIT header for fresh content", () => {
		setISRCache("/page", "<p>Fresh</p>", 60);
		const res = getISRCache("/page");
		expect(res!.headers.get("X-VirexJS-Cache")).toBe("HIT");
	});

	test("cache STALE header for expired content", async () => {
		setISRCache("/stale", "<p>Old</p>", 0); // 0 seconds = immediately stale
		await new Promise((r) => setTimeout(r, 10));
		const res = getISRCache("/stale");
		expect(res!.headers.get("X-VirexJS-Cache")).toBe("STALE");
	});

	test("needsRevalidation returns true for stale", async () => {
		setISRCache("/check", "<p>Check</p>", 0);
		await new Promise((r) => setTimeout(r, 10));
		expect(needsRevalidation("/check")).toBe(true);
	});

	test("needsRevalidation returns false for fresh", () => {
		setISRCache("/fresh", "<p>Fresh</p>", 60);
		expect(needsRevalidation("/fresh")).toBe(false);
	});

	test("markRevalidating prevents duplicate revalidation", async () => {
		setISRCache("/reval", "<p>Reval</p>", 0);
		await new Promise((r) => setTimeout(r, 10));
		expect(needsRevalidation("/reval")).toBe(true);
		markRevalidating("/reval");
		expect(needsRevalidation("/reval")).toBe(false);
	});

	test("invalidateISR by exact path", () => {
		setISRCache("/a", "A", 60);
		setISRCache("/b", "B", 60);
		invalidateISR("/a");
		expect(getISRCache("/a")).toBeNull();
		expect(getISRCache("/b")).not.toBeNull();
	});

	test("invalidateISR by regex", () => {
		setISRCache("/blog/a", "A", 60);
		setISRCache("/blog/b", "B", 60);
		setISRCache("/about", "C", 60);
		const count = invalidateISR(/^\/blog\//);
		expect(count).toBe(2);
		expect(getISRCache("/about")).not.toBeNull();
	});

	test("getISRStats returns cache info", () => {
		setISRCache("/x", "X", 60);
		setISRCache("/y", "Y", 60);
		const stats = getISRStats();
		expect(stats.entries).toBe(2);
		expect(stats.paths).toContain("/x");
		expect(stats.paths).toContain("/y");
	});
});
