import { describe, expect, test } from "bun:test";
import { DEFAULT_CONFIG } from "../src/config/defaults";
import { loadConfig } from "../src/config/index";
import type { VirexConfig } from "../src/config/types";

describe("DEFAULT_CONFIG", () => {
	test("has correct port", () => {
		expect(DEFAULT_CONFIG.port).toBe(3000);
	});

	test("has correct hostname", () => {
		expect(DEFAULT_CONFIG.hostname).toBe("localhost");
	});

	test("render mode is server", () => {
		expect(DEFAULT_CONFIG.render).toBe("server");
	});

	test("islands hydration defaults to visible", () => {
		expect(DEFAULT_CONFIG.islands.hydration).toBe("visible");
	});

	test("build minify defaults to true", () => {
		expect(DEFAULT_CONFIG.build.minify).toBe(true);
	});

	test("dev hmr defaults to true", () => {
		expect(DEFAULT_CONFIG.dev.hmr).toBe(true);
	});

	test("dev hmrPort defaults to 3001", () => {
		expect(DEFAULT_CONFIG.dev.hmrPort).toBe(3001);
	});

	test("router trailingSlash defaults to false", () => {
		expect(DEFAULT_CONFIG.router.trailingSlash).toBe(false);
	});

	test("css engine defaults to passthrough", () => {
		expect(DEFAULT_CONFIG.css.engine).toBe("passthrough");
	});

	test("all required fields are present", () => {
		const requiredKeys: (keyof VirexConfig)[] = [
			"port",
			"hostname",
			"srcDir",
			"outDir",
			"publicDir",
			"render",
			"islands",
			"router",
			"css",
			"build",
			"dev",
		];
		for (const key of requiredKeys) {
			expect(DEFAULT_CONFIG[key]).toBeDefined();
		}
	});
});

describe("loadConfig", () => {
	test("returns defaults when no config file exists", async () => {
		const config = await loadConfig("/nonexistent/path");
		expect(config.port).toBe(3000);
		expect(config.render).toBe("server");
	});

	test("loads config from playground directory", async () => {
		const playgroundDir = new URL("../../../../playground", import.meta.url).pathname.replace(
			/^\/([A-Z]:)/,
			"$1",
		);
		const config = await loadConfig(playgroundDir);
		expect(config.port).toBe(3000);
		expect(config.render).toBe("server");
	});
});
