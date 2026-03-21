import { describe, expect, test } from "bun:test";
import { info } from "../src/cli/info";

describe("virex info", () => {
	test("exports info function", () => {
		expect(typeof info).toBe("function");
	});
});
