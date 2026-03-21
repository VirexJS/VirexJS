import { describe, test, expect } from "bun:test";
import { PluginRunner } from "../src/plugin/runner";
import { definePlugin } from "../src/plugin/index";

// PluginRunner is primarily tested via plugin.test.ts.
// This file ensures direct import and edge cases.

describe("PluginRunner direct import", () => {
	test("constructs with empty array", () => {
		const runner = new PluginRunner([]);
		expect(runner.count).toBe(0);
		expect(runner.names).toEqual([]);
	});

	test("collectMiddleware returns empty for no plugins", () => {
		const runner = new PluginRunner([]);
		expect(runner.collectMiddleware()).toEqual([]);
	});

	test("runTransformHTML returns original when no plugins", async () => {
		const runner = new PluginRunner([]);
		const result = await runner.runTransformHTML("<p>test</p>", {
			pathname: "/",
			params: {},
			request: new Request("http://localhost/"),
		});
		expect(result).toBe("<p>test</p>");
	});

	test("handles mixed hooks and no-hooks plugins", async () => {
		const calls: string[] = [];
		const runner = new PluginRunner([
			definePlugin({ name: "no-hooks" }),
			definePlugin({
				name: "has-hooks",
				configResolved() { calls.push("config"); },
			}),
			definePlugin({ name: "also-no-hooks" }),
		]);

		const config = { port: 3000 } as Parameters<typeof runner.runConfigResolved>[0];
		await runner.runConfigResolved(config);
		expect(calls).toEqual(["config"]);
	});
});
