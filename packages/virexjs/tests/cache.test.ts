import { describe, expect, test } from "bun:test";
import { createCache } from "../src/server/cache";

describe("createCache", () => {
	test("set and get a value", () => {
		const cache = createCache<string>();
		cache.set("key", "value");
		expect(cache.get("key")).toBe("value");
	});

	test("returns undefined for missing key", () => {
		const cache = createCache<string>();
		expect(cache.get("missing")).toBeUndefined();
	});

	test("has returns true for existing key", () => {
		const cache = createCache<number>();
		cache.set("n", 42);
		expect(cache.has("n")).toBe(true);
	});

	test("has returns false for missing key", () => {
		const cache = createCache<number>();
		expect(cache.has("n")).toBe(false);
	});

	test("delete removes a key", () => {
		const cache = createCache<string>();
		cache.set("k", "v");
		expect(cache.delete("k")).toBe(true);
		expect(cache.get("k")).toBeUndefined();
	});

	test("delete returns false for missing key", () => {
		const cache = createCache<string>();
		expect(cache.delete("nope")).toBe(false);
	});

	test("clear removes all entries", () => {
		const cache = createCache<number>();
		cache.set("a", 1);
		cache.set("b", 2);
		cache.clear();
		expect(cache.size).toBe(0);
		expect(cache.get("a")).toBeUndefined();
	});

	test("size returns entry count", () => {
		const cache = createCache<number>();
		cache.set("a", 1);
		cache.set("b", 2);
		cache.set("c", 3);
		expect(cache.size).toBe(3);
	});

	test("keys returns all keys", () => {
		const cache = createCache<number>();
		cache.set("x", 1);
		cache.set("y", 2);
		expect(cache.keys().sort()).toEqual(["x", "y"]);
	});

	test("overwrites existing key", () => {
		const cache = createCache<string>();
		cache.set("k", "old");
		cache.set("k", "new");
		expect(cache.get("k")).toBe("new");
		expect(cache.size).toBe(1);
	});
});

describe("TTL expiration", () => {
	test("entry expires after TTL", async () => {
		const cache = createCache<string>({ ttl: 50 });
		cache.set("k", "v");
		expect(cache.get("k")).toBe("v");

		await new Promise((r) => setTimeout(r, 60));
		expect(cache.get("k")).toBeUndefined();
	});

	test("has returns false for expired entry", async () => {
		const cache = createCache<string>({ ttl: 50 });
		cache.set("k", "v");
		await new Promise((r) => setTimeout(r, 60));
		expect(cache.has("k")).toBe(false);
	});

	test("per-key TTL override", async () => {
		const cache = createCache<string>({ ttl: 500 });
		cache.set("short", "v", 50);
		cache.set("long", "v");

		await new Promise((r) => setTimeout(r, 60));
		expect(cache.get("short")).toBeUndefined();
		expect(cache.get("long")).toBe("v");
	});
});

describe("maxSize eviction", () => {
	test("evicts oldest when maxSize exceeded", () => {
		const cache = createCache<number>({ maxSize: 3, ttl: 60_000 });
		cache.set("a", 1);
		cache.set("b", 2);
		cache.set("c", 3);
		cache.set("d", 4); // should evict "a"

		expect(cache.get("a")).toBeUndefined();
		expect(cache.get("b")).toBe(2);
		expect(cache.get("d")).toBe(4);
	});
});

describe("typed cache", () => {
	test("works with objects", () => {
		const cache = createCache<{ id: number; name: string }>();
		cache.set("user:1", { id: 1, name: "Alice" });
		const user = cache.get("user:1");
		expect(user?.name).toBe("Alice");
	});

	test("works with arrays", () => {
		const cache = createCache<number[]>();
		cache.set("nums", [1, 2, 3]);
		expect(cache.get("nums")).toEqual([1, 2, 3]);
	});
});
