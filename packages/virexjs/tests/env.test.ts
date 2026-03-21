import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadEnv, parseEnvFile } from "../src/config/env";

// ─── parseEnvFile ───────────────────────────────────────────────────────────

describe("parseEnvFile", () => {
	test("parses simple key=value", () => {
		const result = parseEnvFile("PORT=3000\nHOST=localhost");
		expect(result.PORT).toBe("3000");
		expect(result.HOST).toBe("localhost");
	});

	test("handles double-quoted values", () => {
		const result = parseEnvFile('GREETING="Hello World"');
		expect(result.GREETING).toBe("Hello World");
	});

	test("handles single-quoted values", () => {
		const result = parseEnvFile("SECRET='my-secret'");
		expect(result.SECRET).toBe("my-secret");
	});

	test("skips comments", () => {
		const result = parseEnvFile("# This is a comment\nKEY=value\n# Another comment");
		expect(result.KEY).toBe("value");
		expect(Object.keys(result)).toHaveLength(1);
	});

	test("skips empty lines", () => {
		const result = parseEnvFile("\n\nKEY=value\n\n");
		expect(result.KEY).toBe("value");
	});

	test("handles escape sequences in double quotes", () => {
		const result = parseEnvFile('MSG="line1\\nline2\\ttab"');
		expect(result.MSG).toBe("line1\nline2\ttab");
	});

	test("strips inline comments for unquoted values", () => {
		const result = parseEnvFile("PORT=3000 # default port");
		expect(result.PORT).toBe("3000");
	});

	test("preserves # in quoted values", () => {
		const result = parseEnvFile('COLOR="#ff0000"');
		expect(result.COLOR).toBe("#ff0000");
	});

	test("variable expansion with ${VAR}", () => {
		const result = parseEnvFile("BASE=/app\nURL=${BASE}/api");
		expect(result.URL).toBe("/app/api");
	});

	test("variable expansion with $VAR", () => {
		const result = parseEnvFile("NAME=virex\nFULL=$NAME-js");
		expect(result.FULL).toBe("virex-js");
	});

	test("missing variable expands to empty", () => {
		const result = parseEnvFile("VALUE=${NONEXISTENT}");
		expect(result.VALUE).toBe("");
	});

	test("handles values with = sign", () => {
		const result = parseEnvFile("DSN=postgres://user:pass@host/db?ssl=true");
		expect(result.DSN).toBe("postgres://user:pass@host/db?ssl=true");
	});

	test("trims whitespace around key and value", () => {
		const result = parseEnvFile("  KEY  =  value  ");
		expect(result.KEY).toBe("value");
	});

	test("skips lines without =", () => {
		const result = parseEnvFile("INVALID_LINE\nKEY=value");
		expect(Object.keys(result)).toHaveLength(1);
		expect(result.KEY).toBe("value");
	});

	test("handles empty value", () => {
		const result = parseEnvFile("EMPTY=");
		expect(result.EMPTY).toBe("");
	});
});

// ─── loadEnv ────────────────────────────────────────────────────────────────

describe("loadEnv", () => {
	const testDir = join(tmpdir(), `virex-env-test-${Date.now()}`);

	beforeEach(() => {
		mkdirSync(testDir, { recursive: true });
		// Clean up env vars we might set
		delete process.env.TEST_VAR;
		delete process.env.LOCAL_VAR;
		delete process.env.PROD_VAR;
	});

	afterAll(() => {
		rmSync(testDir, { recursive: true, force: true });
		delete process.env.TEST_VAR;
		delete process.env.LOCAL_VAR;
		delete process.env.PROD_VAR;
	});

	test("loads .env file", () => {
		writeFileSync(join(testDir, ".env"), "TEST_VAR=base_value");
		const env = loadEnv(undefined, testDir);
		expect(env.TEST_VAR).toBe("base_value");
	});

	test("sets process.env", () => {
		const subDir = join(testDir, "proc");
		mkdirSync(subDir, { recursive: true });
		writeFileSync(join(subDir, ".env"), "TEST_VAR=from_env");
		loadEnv(undefined, subDir);
		expect(process.env.TEST_VAR).toBe("from_env");
	});

	test("does not override existing process.env", () => {
		const subDir = join(testDir, "nooverride");
		mkdirSync(subDir, { recursive: true });
		process.env.TEST_VAR = "existing";
		writeFileSync(join(subDir, ".env"), "TEST_VAR=new_value");
		loadEnv(undefined, subDir);
		expect(process.env.TEST_VAR).toBe("existing");
	});

	test(".env.local overrides .env", () => {
		const subDir = join(testDir, "local");
		mkdirSync(subDir, { recursive: true });
		writeFileSync(join(subDir, ".env"), "LOCAL_VAR=base");
		writeFileSync(join(subDir, ".env.local"), "LOCAL_VAR=local");
		const env = loadEnv(undefined, subDir);
		expect(env.LOCAL_VAR).toBe("local");
	});

	test("mode-specific env file loads", () => {
		const subDir = join(testDir, "mode");
		mkdirSync(subDir, { recursive: true });
		writeFileSync(join(subDir, ".env"), "PROD_VAR=dev");
		writeFileSync(join(subDir, ".env.production"), "PROD_VAR=prod");
		const env = loadEnv("production", subDir);
		expect(env.PROD_VAR).toBe("prod");
	});

	test("returns empty object when no env files exist", () => {
		const emptyDir = join(testDir, "empty");
		mkdirSync(emptyDir, { recursive: true });
		const env = loadEnv(undefined, emptyDir);
		expect(Object.keys(env)).toHaveLength(0);
	});
});
