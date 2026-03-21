import { afterEach, describe, expect, test } from "bun:test";
import { closeDB, getDB } from "../src/client";

afterEach(() => {
	closeDB();
});

describe("getDB", () => {
	test("returns a Database instance", () => {
		const db = getDB();
		expect(db).toBeDefined();
		expect(typeof db.run).toBe("function");
		expect(typeof db.query).toBe("function");
	});

	test("returns the same instance (singleton)", () => {
		const db1 = getDB();
		const db2 = getDB();
		expect(db1).toBe(db2);
	});

	test("WAL mode is set (in-memory falls back to memory)", () => {
		const db = getDB();
		const result = db.query("PRAGMA journal_mode;").get() as { journal_mode: string };
		// In-memory databases cannot use WAL, so it stays as "memory"
		// On-disk databases would return "wal"
		expect(["wal", "memory"]).toContain(result.journal_mode);
	});

	test("foreign keys are enabled", () => {
		const db = getDB();
		const result = db.query("PRAGMA foreign_keys;").get() as { foreign_keys: number };
		expect(result.foreign_keys).toBe(1);
	});

	test("can execute queries", () => {
		const db = getDB();
		db.run("CREATE TABLE test_table (id INTEGER PRIMARY KEY, name TEXT)");
		db.run("INSERT INTO test_table (name) VALUES ('hello')");
		const row = db.query("SELECT name FROM test_table").get() as { name: string };
		expect(row.name).toBe("hello");
	});
});

describe("closeDB", () => {
	test("closes the connection", () => {
		getDB();
		closeDB();
		// After close, getDB should create a new instance
		const db = getDB();
		expect(db).toBeDefined();
	});

	test("new instance after close is fresh", () => {
		const db1 = getDB();
		db1.run("CREATE TABLE close_test (id INTEGER PRIMARY KEY)");
		closeDB();

		const db2 = getDB();
		// Table should not exist in new in-memory DB
		expect(() => {
			db2.query("SELECT * FROM close_test").all();
		}).toThrow();
	});

	test("double close does not throw", () => {
		getDB();
		closeDB();
		expect(() => closeDB()).not.toThrow();
	});
});
