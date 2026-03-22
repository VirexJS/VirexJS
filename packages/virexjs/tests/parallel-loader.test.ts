import { describe, expect, test } from "bun:test";
import { defineParallelLoader } from "../src/server/parallel-loader";

const CTX = {
	params: { id: "42" },
	request: new Request("http://localhost/"),
	headers: new Headers(),
};

describe("defineParallelLoader", () => {
	test("runs multiple loaders in parallel", async () => {
		const loader = defineParallelLoader({
			user: async () => ({ name: "Alice" }),
			posts: async () => [{ title: "Hello" }],
			count: () => 5,
		});

		const data = await loader(CTX);
		expect(data.user).toEqual({ name: "Alice" });
		expect(data.posts).toEqual([{ title: "Hello" }]);
		expect(data.count).toBe(5);
	});

	test("passes context to each loader", async () => {
		const loader = defineParallelLoader({
			result: async (ctx) => ctx.params.id,
		});

		const data = await loader(CTX);
		expect(data.result).toBe("42");
	});

	test("runs loaders concurrently (not sequentially)", async () => {
		const order: number[] = [];
		const loader = defineParallelLoader({
			slow: async () => {
				await new Promise((r) => setTimeout(r, 50));
				order.push(1);
				return "slow";
			},
			fast: async () => {
				order.push(2);
				return "fast";
			},
		});

		const data = await loader(CTX);
		expect(data.slow).toBe("slow");
		expect(data.fast).toBe("fast");
		// Fast should complete before slow
		expect(order[0]).toBe(2);
	});

	test("fails fast when any loader throws (default)", async () => {
		const loader = defineParallelLoader({
			good: async () => "ok",
			bad: async () => {
				throw new Error("DB down");
			},
		});

		expect(loader(CTX)).rejects.toThrow("DB down");
	});

	test("settled mode returns null for failed loaders", async () => {
		const loader = defineParallelLoader(
			{
				good: async () => "ok",
				bad: async () => {
					throw new Error("Network error");
				},
			},
			{ settled: true },
		);

		const data = await loader(CTX);
		expect(data.good).toBe("ok");
		expect(data.bad).toBeNull();
	});

	test("handles sync loaders", async () => {
		const loader = defineParallelLoader({
			sync1: () => 42,
			sync2: () => "hello",
		});

		const data = await loader(CTX);
		expect(data.sync1).toBe(42);
		expect(data.sync2).toBe("hello");
	});

	test("empty loader map returns empty object", async () => {
		const loader = defineParallelLoader({});
		const data = await loader(CTX);
		expect(data).toEqual({});
	});

	test("single loader works", async () => {
		const loader = defineParallelLoader({
			only: async () => ({ status: "active" }),
		});

		const data = await loader(CTX);
		expect(data.only).toEqual({ status: "active" });
	});
});
