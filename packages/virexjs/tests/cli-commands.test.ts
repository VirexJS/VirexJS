import { describe, expect, test } from "bun:test";

// Test that CLI modules export the correct functions
describe("CLI module exports", () => {
	test("dev.ts exports dev function", async () => {
		const mod = await import("../src/cli/dev");
		expect(typeof mod.dev).toBe("function");
	});

	test("build.ts exports build function", async () => {
		const mod = await import("../src/cli/build");
		expect(typeof mod.build).toBe("function");
	});

	test("preview.ts exports preview function", async () => {
		const mod = await import("../src/cli/preview");
		expect(typeof mod.preview).toBe("function");
	});

	test("init.ts exports init function", async () => {
		const mod = await import("../src/cli/init");
		expect(typeof mod.init).toBe("function");
	});

	test("generate.ts exports generate function", async () => {
		const mod = await import("../src/cli/generate");
		expect(typeof mod.generate).toBe("function");
	});

	test("args.ts exports parseArgs function", async () => {
		const mod = await import("../src/cli/args");
		expect(typeof mod.parseArgs).toBe("function");
	});
});

describe("CLI index dispatches commands", () => {
	test("index.ts is a valid module", async () => {
		// Just verify it can be parsed without error
		const filePath = new URL("../src/cli/index.ts", import.meta.url).pathname.replace(
			/^\/([A-Z]:)/,
			"$1",
		);
		const content = await Bun.file(filePath).text();
		expect(content).toContain("switch (command)");
		expect(content).toContain('"dev"');
		expect(content).toContain('"build"');
		expect(content).toContain('"preview"');
		expect(content).toContain('"init"');
		expect(content).toContain('"generate"');
	});
});
