import { describe, test, expect, mock, beforeEach } from "bun:test";
import { createLogger } from "../src/server/logger";

// Capture console output
let logOutput: string[] = [];
let errorOutput: string[] = [];
let warnOutput: string[] = [];

beforeEach(() => {
	logOutput = [];
	errorOutput = [];
	warnOutput = [];
	console.log = (...args: unknown[]) => logOutput.push(args.join(" "));
	console.error = (...args: unknown[]) => errorOutput.push(args.join(" "));
	console.warn = (...args: unknown[]) => warnOutput.push(args.join(" "));
});

describe("createLogger", () => {
	test("creates logger with default level (info)", () => {
		const log = createLogger();
		expect(typeof log.debug).toBe("function");
		expect(typeof log.info).toBe("function");
		expect(typeof log.warn).toBe("function");
		expect(typeof log.error).toBe("function");
		expect(typeof log.child).toBe("function");
	});

	test("info level logs info and above", () => {
		const log = createLogger({ level: "info" });
		log.debug("debug msg");
		log.info("info msg");
		log.warn("warn msg");
		log.error("error msg");

		expect(logOutput).toHaveLength(1); // info
		expect(warnOutput).toHaveLength(1); // warn
		expect(errorOutput).toHaveLength(1); // error
		expect(logOutput[0]).toContain("info msg");
	});

	test("debug level logs everything", () => {
		const log = createLogger({ level: "debug" });
		log.debug("d");
		log.info("i");
		log.warn("w");
		log.error("e");

		expect(logOutput).toHaveLength(2); // debug + info
		expect(warnOutput).toHaveLength(1);
		expect(errorOutput).toHaveLength(1);
	});

	test("error level only logs errors", () => {
		const log = createLogger({ level: "error" });
		log.debug("d");
		log.info("i");
		log.warn("w");
		log.error("e");

		expect(logOutput).toHaveLength(0);
		expect(warnOutput).toHaveLength(0);
		expect(errorOutput).toHaveLength(1);
	});

	test("silent level logs nothing", () => {
		const log = createLogger({ level: "silent" });
		log.debug("d");
		log.info("i");
		log.warn("w");
		log.error("e");

		expect(logOutput).toHaveLength(0);
		expect(warnOutput).toHaveLength(0);
		expect(errorOutput).toHaveLength(0);
	});

	test("includes prefix in output", () => {
		const log = createLogger({ prefix: "myapp" });
		log.info("started");
		expect(logOutput[0]).toContain("[myapp]");
	});

	test("includes timestamp", () => {
		const log = createLogger();
		log.info("test");
		// ISO timestamp pattern
		expect(logOutput[0]).toMatch(/\d{4}-\d{2}-\d{2}T/);
	});

	test("includes level tag", () => {
		const log = createLogger();
		log.info("test");
		expect(logOutput[0]).toContain("INFO");
	});

	test("includes data as JSON", () => {
		const log = createLogger();
		log.info("request", { path: "/api", status: 200 });
		expect(logOutput[0]).toContain('"/api"');
		expect(logOutput[0]).toContain("200");
	});
});

describe("child logger", () => {
	test("inherits parent config", () => {
		const parent = createLogger({ level: "warn", prefix: "app" });
		const child = parent.child({ module: "auth" });

		child.info("should be suppressed");
		child.warn("should appear");

		expect(logOutput).toHaveLength(0);
		expect(warnOutput).toHaveLength(1);
		expect(warnOutput[0]).toContain("[app]");
	});

	test("includes child context in output", () => {
		const parent = createLogger({ prefix: "app" });
		const child = parent.child({ module: "db" });

		child.info("query");
		expect(logOutput[0]).toContain('"module":"db"');
	});

	test("merges parent and child context", () => {
		const parent = createLogger({ context: { env: "prod" } });
		const child = parent.child({ module: "api" });

		child.info("test");
		expect(logOutput[0]).toContain('"env":"prod"');
		expect(logOutput[0]).toContain('"module":"api"');
	});

	test("data overrides context", () => {
		const log = createLogger({ context: { requestId: "abc" } });
		log.info("test", { requestId: "xyz" });
		expect(logOutput[0]).toContain('"requestId":"xyz"');
	});
});
