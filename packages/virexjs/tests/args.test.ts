import { describe, expect, test } from "bun:test";
import { parseArgs } from "../src/cli/args";

describe("parseArgs", () => {
	test("empty args returns empty object", () => {
		expect(parseArgs([])).toEqual({});
	});

	test("parses --port with value", () => {
		expect(parseArgs(["--port", "4000"])).toEqual({ port: "4000" });
	});

	test("parses --host with value", () => {
		expect(parseArgs(["--host", "0.0.0.0"])).toEqual({ host: "0.0.0.0" });
	});

	test("parses boolean flag", () => {
		expect(parseArgs(["--open"])).toEqual({ open: true });
	});

	test("parses --no- prefix as false", () => {
		expect(parseArgs(["--no-hmr"])).toEqual({ hmr: false });
	});

	test("parses multiple flags", () => {
		const result = parseArgs(["--port", "3000", "--host", "localhost", "--open"]);
		expect(result).toEqual({ port: "3000", host: "localhost", open: true });
	});

	test("parses short -p flag", () => {
		expect(parseArgs(["-p", "8080"])).toEqual({ port: "8080" });
	});

	test("parses short -h flag", () => {
		expect(parseArgs(["-h", "0.0.0.0"])).toEqual({ host: "0.0.0.0" });
	});

	test("parses mixed long and short flags", () => {
		const result = parseArgs(["-p", "4000", "--no-hmr", "--open"]);
		expect(result).toEqual({ port: "4000", hmr: false, open: true });
	});

	test("flag without value before another flag is boolean", () => {
		const result = parseArgs(["--verbose", "--port", "3000"]);
		expect(result).toEqual({ verbose: true, port: "3000" });
	});
});
