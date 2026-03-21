import { describe, test, expect, mock } from "bun:test";
import { PluginRunner } from "../src/plugin/runner";
import { definePlugin } from "../src/plugin/index";
import type { VirexPlugin } from "../src/plugin/types";
import type { VirexConfig } from "../src/config/types";
import { DEFAULT_CONFIG } from "../src/config/defaults";

function makeConfig(overrides?: Partial<VirexConfig>): VirexConfig {
	return { ...DEFAULT_CONFIG, ...overrides } as VirexConfig;
}

// ─── definePlugin ───────────────────────────────────────────────────────────

describe("definePlugin", () => {
	test("returns the plugin object as-is", () => {
		const plugin = definePlugin({ name: "test" });
		expect(plugin.name).toBe("test");
	});

	test("preserves all hooks", () => {
		const hooks = {
			name: "full",
			configResolved: () => {},
			serverCreated: () => {},
			buildStart: () => {},
			buildEnd: () => {},
			transformHTML: (html: string) => html,
			middleware: () => [],
		};
		const plugin = definePlugin(hooks);
		expect(plugin.configResolved).toBe(hooks.configResolved);
		expect(plugin.transformHTML).toBe(hooks.transformHTML);
		expect(plugin.middleware).toBe(hooks.middleware);
	});
});

// ─── PluginRunner basics ────────────────────────────────────────────────────

describe("PluginRunner", () => {
	test("count returns number of plugins", () => {
		const runner = new PluginRunner([
			{ name: "a" },
			{ name: "b" },
		]);
		expect(runner.count).toBe(2);
	});

	test("names returns plugin names", () => {
		const runner = new PluginRunner([
			{ name: "alpha" },
			{ name: "beta" },
		]);
		expect(runner.names).toEqual(["alpha", "beta"]);
	});

	test("empty runner has count 0", () => {
		const runner = new PluginRunner([]);
		expect(runner.count).toBe(0);
		expect(runner.names).toEqual([]);
	});
});

// ─── configResolved ─────────────────────────────────────────────────────────

describe("configResolved", () => {
	test("calls configResolved on each plugin", async () => {
		const calls: string[] = [];
		const runner = new PluginRunner([
			definePlugin({
				name: "first",
				configResolved() {
					calls.push("first");
				},
			}),
			definePlugin({
				name: "second",
				configResolved() {
					calls.push("second");
				},
			}),
		]);

		await runner.runConfigResolved(makeConfig());
		expect(calls).toEqual(["first", "second"]);
	});

	test("plugins can mutate config", async () => {
		const runner = new PluginRunner([
			definePlugin({
				name: "port-changer",
				configResolved(config) {
					config.port = 8080;
				},
			}),
		]);

		const config = makeConfig();
		await runner.runConfigResolved(config);
		expect(config.port).toBe(8080);
	});

	test("error in one plugin does not block others", async () => {
		const calls: string[] = [];
		const runner = new PluginRunner([
			definePlugin({
				name: "bad",
				configResolved() {
					throw new Error("boom");
				},
			}),
			definePlugin({
				name: "good",
				configResolved() {
					calls.push("good");
				},
			}),
		]);

		await runner.runConfigResolved(makeConfig());
		expect(calls).toEqual(["good"]);
	});

	test("skips plugins without the hook", async () => {
		const calls: string[] = [];
		const runner = new PluginRunner([
			definePlugin({ name: "no-hook" }),
			definePlugin({
				name: "has-hook",
				configResolved() {
					calls.push("has-hook");
				},
			}),
		]);

		await runner.runConfigResolved(makeConfig());
		expect(calls).toEqual(["has-hook"]);
	});
});

// ─── serverCreated ──────────────────────────────────────────────────────────

describe("serverCreated", () => {
	test("calls serverCreated with server info", async () => {
		let receivedInfo: unknown;
		const runner = new PluginRunner([
			definePlugin({
				name: "logger",
				serverCreated(info) {
					receivedInfo = info;
				},
			}),
		]);

		await runner.runServerCreated({ port: 3000, hostname: "localhost", routeCount: 5 });
		expect(receivedInfo).toEqual({ port: 3000, hostname: "localhost", routeCount: 5 });
	});
});

// ─── buildStart / buildEnd ──────────────────────────────────────────────────

describe("buildStart / buildEnd", () => {
	test("calls buildStart before build", async () => {
		const calls: string[] = [];
		const runner = new PluginRunner([
			definePlugin({
				name: "build-logger",
				buildStart() {
					calls.push("start");
				},
				buildEnd() {
					calls.push("end");
				},
			}),
		]);

		await runner.runBuildStart(makeConfig());
		calls.push("building");
		await runner.runBuildEnd({ pages: 3, assets: 2, totalSize: 1024, outDir: "dist" });

		expect(calls).toEqual(["start", "building", "end"]);
	});

	test("buildEnd receives build result", async () => {
		let receivedResult: unknown;
		const runner = new PluginRunner([
			definePlugin({
				name: "stats",
				buildEnd(result) {
					receivedResult = result;
				},
			}),
		]);

		const result = { pages: 5, assets: 10, totalSize: 2048, outDir: "/out" };
		await runner.runBuildEnd(result);
		expect(receivedResult).toEqual(result);
	});
});

// ─── transformHTML ──────────────────────────────────────────────────────────

describe("transformHTML", () => {
	test("transforms HTML through single plugin", async () => {
		const runner = new PluginRunner([
			definePlugin({
				name: "inject-script",
				transformHTML(html) {
					return html.replace("</body>", '<script src="/analytics.js"></script></body>');
				},
			}),
		]);

		const ctx = { pathname: "/", params: {}, request: new Request("http://localhost/") };
		const result = await runner.runTransformHTML("<body>Hello</body>", ctx);
		expect(result).toBe('<body>Hello<script src="/analytics.js"></script></body>');
	});

	test("chains multiple transformHTML plugins", async () => {
		const runner = new PluginRunner([
			definePlugin({
				name: "plugin-a",
				transformHTML(html) {
					return html.replace("{{a}}", "A");
				},
			}),
			definePlugin({
				name: "plugin-b",
				transformHTML(html) {
					return html.replace("{{b}}", "B");
				},
			}),
		]);

		const ctx = { pathname: "/", params: {}, request: new Request("http://localhost/") };
		const result = await runner.runTransformHTML("{{a}} and {{b}}", ctx);
		expect(result).toBe("A and B");
	});

	test("returning undefined leaves HTML unchanged", async () => {
		const runner = new PluginRunner([
			definePlugin({
				name: "no-op",
				transformHTML() {
					return undefined;
				},
			}),
		]);

		const ctx = { pathname: "/", params: {}, request: new Request("http://localhost/") };
		const result = await runner.runTransformHTML("<p>unchanged</p>", ctx);
		expect(result).toBe("<p>unchanged</p>");
	});

	test("passes context to transformHTML", async () => {
		let receivedCtx: unknown;
		const runner = new PluginRunner([
			definePlugin({
				name: "ctx-reader",
				transformHTML(_html, ctx) {
					receivedCtx = ctx;
					return undefined;
				},
			}),
		]);

		const req = new Request("http://localhost/blog/hello");
		const ctx = { pathname: "/blog/hello", params: { slug: "hello" }, request: req };
		await runner.runTransformHTML("<p>test</p>", ctx);
		expect((receivedCtx as Record<string, unknown>).pathname).toBe("/blog/hello");
		expect((receivedCtx as Record<string, unknown>).params).toEqual({ slug: "hello" });
	});

	test("error in transformHTML does not block other plugins", async () => {
		const runner = new PluginRunner([
			definePlugin({
				name: "bad-transform",
				transformHTML() {
					throw new Error("transform failed");
				},
			}),
			definePlugin({
				name: "good-transform",
				transformHTML(html) {
					return html + "<!-- ok -->";
				},
			}),
		]);

		const ctx = { pathname: "/", params: {}, request: new Request("http://localhost/") };
		const result = await runner.runTransformHTML("<p>test</p>", ctx);
		expect(result).toBe("<p>test</p><!-- ok -->");
	});
});

// ─── middleware ──────────────────────────────────────────────────────────────

describe("middleware", () => {
	test("collects single middleware from plugin", () => {
		const mw = async () => new Response("ok");
		const runner = new PluginRunner([
			definePlugin({
				name: "auth",
				middleware: () => mw,
			}),
		]);

		const collected = runner.collectMiddleware();
		expect(collected).toHaveLength(1);
		expect(collected[0]).toBe(mw);
	});

	test("collects array of middleware from plugin", () => {
		const mw1 = async () => new Response("1");
		const mw2 = async () => new Response("2");
		const runner = new PluginRunner([
			definePlugin({
				name: "multi",
				middleware: () => [mw1, mw2],
			}),
		]);

		const collected = runner.collectMiddleware();
		expect(collected).toHaveLength(2);
	});

	test("collects middleware from multiple plugins in order", () => {
		const calls: string[] = [];
		const runner = new PluginRunner([
			definePlugin({
				name: "first",
				middleware: () => async (_ctx, next) => {
					calls.push("first");
					return next();
				},
			}),
			definePlugin({
				name: "second",
				middleware: () => async (_ctx, next) => {
					calls.push("second");
					return next();
				},
			}),
		]);

		const collected = runner.collectMiddleware();
		expect(collected).toHaveLength(2);
	});

	test("skips plugins without middleware hook", () => {
		const runner = new PluginRunner([
			definePlugin({ name: "no-mw" }),
			definePlugin({
				name: "has-mw",
				middleware: () => async () => new Response("ok"),
			}),
		]);

		expect(runner.collectMiddleware()).toHaveLength(1);
	});

	test("error in middleware collection does not block others", () => {
		const runner = new PluginRunner([
			definePlugin({
				name: "bad",
				middleware: () => {
					throw new Error("middleware setup failed");
				},
			}),
			definePlugin({
				name: "good",
				middleware: () => async () => new Response("ok"),
			}),
		]);

		const collected = runner.collectMiddleware();
		expect(collected).toHaveLength(1);
	});
});

// ─── async hooks ────────────────────────────────────────────────────────────

describe("async hooks", () => {
	test("supports async configResolved", async () => {
		const runner = new PluginRunner([
			definePlugin({
				name: "async-config",
				async configResolved(config) {
					await new Promise((r) => setTimeout(r, 1));
					config.port = 9999;
				},
			}),
		]);

		const config = makeConfig();
		await runner.runConfigResolved(config);
		expect(config.port).toBe(9999);
	});

	test("supports async transformHTML", async () => {
		const runner = new PluginRunner([
			definePlugin({
				name: "async-transform",
				async transformHTML(html) {
					await new Promise((r) => setTimeout(r, 1));
					return html.toUpperCase();
				},
			}),
		]);

		const ctx = { pathname: "/", params: {}, request: new Request("http://localhost/") };
		const result = await runner.runTransformHTML("hello", ctx);
		expect(result).toBe("HELLO");
	});
});

// ─── integration: realistic plugin ─────────────────────────────────────────

describe("integration", () => {
	test("analytics plugin injects script and logs build", async () => {
		const log: string[] = [];

		const analyticsPlugin = definePlugin({
			name: "virex-analytics",
			configResolved(config) {
				log.push(`config: port=${config.port}`);
			},
			buildStart() {
				log.push("build started");
			},
			buildEnd(result) {
				log.push(`build done: ${result.pages} pages`);
			},
			transformHTML(html, ctx) {
				if (ctx.pathname === "/") {
					return html.replace("</head>", '<script>trackPage("/")</script></head>');
				}
				return undefined;
			},
			middleware: () => async (_ctx, next) => {
				log.push("request");
				return next();
			},
		});

		const runner = new PluginRunner([analyticsPlugin]);
		const config = makeConfig({ port: 4000 });

		await runner.runConfigResolved(config);
		await runner.runBuildStart(config);
		await runner.runBuildEnd({ pages: 3, assets: 1, totalSize: 512, outDir: "dist" });

		const ctx = { pathname: "/", params: {}, request: new Request("http://localhost/") };
		const html = await runner.runTransformHTML("<head></head><body>Hi</body>", ctx);
		const mws = runner.collectMiddleware();

		expect(log).toEqual(["config: port=4000", "build started", "build done: 3 pages"]);
		expect(html).toContain('trackPage("/")');
		expect(mws).toHaveLength(1);
	});

	test("factory pattern for configurable plugins", async () => {
		function prefixPlugin(prefix: string): VirexPlugin {
			return definePlugin({
				name: "prefix",
				transformHTML(html) {
					return `<!-- ${prefix} -->\n${html}`;
				},
			});
		}

		const runner = new PluginRunner([prefixPlugin("Generated by VirexJS")]);
		const ctx = { pathname: "/", params: {}, request: new Request("http://localhost/") };
		const result = await runner.runTransformHTML("<html></html>", ctx);
		expect(result).toBe("<!-- Generated by VirexJS -->\n<html></html>");
	});
});
