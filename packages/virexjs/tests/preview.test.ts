import { describe, expect, test } from "bun:test";
import { preview } from "../src/cli/preview";

describe("preview command", () => {
	test("exports preview function", () => {
		expect(typeof preview).toBe("function");
	});

	test("preview is async", () => {
		// preview returns a Promise
		expect(preview.constructor.name).toBe("AsyncFunction");
	});
});
