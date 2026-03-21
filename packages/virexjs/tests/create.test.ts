import { describe, expect, test } from "bun:test";

describe("virex create", () => {
	test("exports create function", async () => {
		const mod = await import("../src/cli/create");
		expect(typeof mod.create).toBe("function");
	});
});
