import { afterEach, describe, expect, test } from "bun:test";
import { defineEnv } from "../src/config/define-env";

afterEach(() => {
	delete process.env.TEST_DB_URL;
	delete process.env.TEST_PORT;
	delete process.env.TEST_DEBUG;
	delete process.env.TEST_KEYS;
});

describe("defineEnv", () => {
	test("reads string from env", () => {
		process.env.TEST_DB_URL = "sqlite:test.db";
		const env = defineEnv({ TEST_DB_URL: { type: "string", required: true } });
		expect(env.TEST_DB_URL).toBe("sqlite:test.db");
	});

	test("coerces number", () => {
		process.env.TEST_PORT = "8080";
		const env = defineEnv({ TEST_PORT: { type: "number" } });
		expect(env.TEST_PORT).toBe(8080);
	});

	test("coerces boolean", () => {
		process.env.TEST_DEBUG = "true";
		const env = defineEnv({ TEST_DEBUG: { type: "boolean" } });
		expect(env.TEST_DEBUG).toBe(true);
	});

	test("boolean false values", () => {
		process.env.TEST_DEBUG = "false";
		const env = defineEnv({ TEST_DEBUG: { type: "boolean" } });
		expect(env.TEST_DEBUG).toBe(false);
	});

	test("splits string array", () => {
		process.env.TEST_KEYS = "key1, key2, key3";
		const env = defineEnv({ TEST_KEYS: { type: "string[]" } });
		expect(env.TEST_KEYS).toEqual(["key1", "key2", "key3"]);
	});

	test("uses default value", () => {
		const env = defineEnv({ TEST_PORT: { type: "number", default: 3000 } });
		expect(env.TEST_PORT).toBe(3000);
	});

	test("throws on missing required var", () => {
		expect(() => defineEnv({ TEST_DB_URL: { type: "string", required: true } })).toThrow(
			"Missing required env var",
		);
	});

	test("throws on invalid number", () => {
		process.env.TEST_PORT = "not-a-number";
		expect(() => defineEnv({ TEST_PORT: { type: "number", required: true } })).toThrow(
			"must be a number",
		);
	});

	test("includes description in error", () => {
		expect(() =>
			defineEnv({
				TEST_DB_URL: {
					type: "string",
					required: true,
					description: "Database connection URL",
				},
			}),
		).toThrow("Database connection URL");
	});
});
