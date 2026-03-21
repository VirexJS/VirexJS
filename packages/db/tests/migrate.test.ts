import { beforeEach, describe, expect, test } from "bun:test";
import { closeDB, getDB } from "../src/client";
import { defineMigration, getMigrationStatus, migrate, rollback } from "../src/migrate";

beforeEach(() => {
	closeDB();
});

const m001 = defineMigration({
	version: "001",
	description: "Create users table",
	up: "CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL)",
	down: "DROP TABLE users",
});

const m002 = defineMigration({
	version: "002",
	description: "Create posts table",
	up: "CREATE TABLE posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, user_id INTEGER REFERENCES users(id))",
	down: "DROP TABLE posts",
});

const m003 = defineMigration({
	version: "003",
	description: "Add bio to users",
	up: "ALTER TABLE users ADD COLUMN bio TEXT DEFAULT ''",
	down: "ALTER TABLE users DROP COLUMN bio",
});

// ─── defineMigration ────────────────────────────────────────────────────────

describe("defineMigration", () => {
	test("returns the migration object", () => {
		const m = defineMigration({
			version: "test",
			description: "Test",
			up: "SELECT 1",
			down: "SELECT 1",
		});
		expect(m.version).toBe("test");
		expect(m.description).toBe("Test");
	});
});

// ─── migrate ────────────────────────────────────────────────────────────────

describe("migrate", () => {
	test("applies all pending migrations", () => {
		const result = migrate([m001, m002]);
		expect(result.applied).toEqual(["001", "002"]);
		expect(result.current).toBe("002");
	});

	test("skips already applied migrations", () => {
		migrate([m001, m002]);
		const result = migrate([m001, m002, m003]);
		expect(result.applied).toEqual(["003"]);
		expect(result.current).toBe("003");
	});

	test("creates tables in the database", () => {
		migrate([m001]);
		const db = getDB();
		db.run("INSERT INTO users (name, email) VALUES ('Alice', 'alice@test.com')");
		const user = db.query("SELECT name FROM users").get() as { name: string };
		expect(user.name).toBe("Alice");
	});

	test("returns empty applied when nothing to do", () => {
		migrate([m001]);
		const result = migrate([m001]);
		expect(result.applied).toEqual([]);
	});

	test("applies in version order regardless of input order", () => {
		const result = migrate([m002, m001]);
		expect(result.applied).toEqual(["001", "002"]);
	});

	test("rolls back on failure", () => {
		const badMigration = defineMigration({
			version: "bad",
			description: "Bad migration",
			up: "INVALID SQL STATEMENT",
			down: "SELECT 1",
		});

		expect(() => migrate([m001, badMigration])).toThrow('Migration "bad" failed');

		// m001 should still be applied
		const status = getMigrationStatus([m001, badMigration]);
		expect(status.applied).toEqual(["001"]);
	});
});

// ─── rollback ───────────────────────────────────────────────────────────────

describe("rollback", () => {
	test("reverts the last migration", () => {
		migrate([m001, m002]);
		const result = rollback([m001, m002]);
		expect(result.reverted).toEqual(["002"]);
		expect(result.current).toBe("001");
	});

	test("reverts multiple migrations", () => {
		migrate([m001, m002]);
		const result = rollback([m001, m002], 2);
		expect(result.reverted).toEqual(["002", "001"]);
		expect(result.current).toBeNull();
	});

	test("actually drops the table", () => {
		migrate([m001]);
		rollback([m001]);
		const db = getDB();
		expect(() => db.query("SELECT * FROM users").all()).toThrow();
	});

	test("throws for unknown migration version", () => {
		migrate([m001]);
		expect(() => rollback([m002])).toThrow("not found");
	});
});

// ─── getMigrationStatus ─────────────────────────────────────────────────────

describe("getMigrationStatus", () => {
	test("shows all pending when none applied", () => {
		const status = getMigrationStatus([m001, m002]);
		expect(status.pending).toEqual(["001", "002"]);
		expect(status.applied).toEqual([]);
		expect(status.current).toBeNull();
	});

	test("shows correct status after partial migration", () => {
		migrate([m001]);
		const status = getMigrationStatus([m001, m002, m003]);
		expect(status.applied).toEqual(["001"]);
		expect(status.pending).toEqual(["002", "003"]);
		expect(status.current).toBe("001");
	});

	test("shows all applied when fully migrated", () => {
		migrate([m001, m002]);
		const status = getMigrationStatus([m001, m002]);
		expect(status.applied).toEqual(["001", "002"]);
		expect(status.pending).toEqual([]);
		expect(status.current).toBe("002");
	});
});
