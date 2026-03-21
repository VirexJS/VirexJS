import { describe, expect, test } from "bun:test";
import { DEFAULT_CONFIG } from "../src/config/defaults";

describe("DEFAULT_CONFIG", () => {
	test("port is 3000", () => {
		expect(DEFAULT_CONFIG.port).toBe(3000);
	});

	test("hostname is localhost", () => {
		expect(DEFAULT_CONFIG.hostname).toBe("localhost");
	});

	test("srcDir is src", () => {
		expect(DEFAULT_CONFIG.srcDir).toBe("src");
	});

	test("outDir is dist", () => {
		expect(DEFAULT_CONFIG.outDir).toBe("dist");
	});

	test("publicDir is public", () => {
		expect(DEFAULT_CONFIG.publicDir).toBe("public");
	});

	test("render is server", () => {
		expect(DEFAULT_CONFIG.render).toBe("server");
	});

	test("islands defaults", () => {
		expect(DEFAULT_CONFIG.islands.hydration).toBe("visible");
		expect(DEFAULT_CONFIG.islands.reactCompat).toBe("none");
	});

	test("router defaults", () => {
		expect(DEFAULT_CONFIG.router.trailingSlash).toBe(false);
		expect(DEFAULT_CONFIG.router.basePath).toBe("");
	});

	test("css defaults", () => {
		expect(DEFAULT_CONFIG.css.engine).toBe("passthrough");
	});

	test("build defaults", () => {
		expect(DEFAULT_CONFIG.build.target).toBe("bun");
		expect(DEFAULT_CONFIG.build.minify).toBe(true);
		expect(DEFAULT_CONFIG.build.sourceMaps).toBe(false);
	});

	test("dev defaults", () => {
		expect(DEFAULT_CONFIG.dev.open).toBe(false);
		expect(DEFAULT_CONFIG.dev.hmr).toBe(true);
		expect(DEFAULT_CONFIG.dev.hmrPort).toBe(3001);
	});

	test("plugins defaults to empty array", () => {
		expect(DEFAULT_CONFIG.plugins).toEqual([]);
	});

	test("all top-level keys exist", () => {
		const keys = Object.keys(DEFAULT_CONFIG);
		expect(keys).toContain("port");
		expect(keys).toContain("hostname");
		expect(keys).toContain("srcDir");
		expect(keys).toContain("outDir");
		expect(keys).toContain("publicDir");
		expect(keys).toContain("render");
		expect(keys).toContain("islands");
		expect(keys).toContain("router");
		expect(keys).toContain("css");
		expect(keys).toContain("build");
		expect(keys).toContain("dev");
		expect(keys).toContain("plugins");
	});

	test("config is a plain object (not frozen)", () => {
		expect(typeof DEFAULT_CONFIG).toBe("object");
		expect(Array.isArray(DEFAULT_CONFIG)).toBe(false);
	});
});
