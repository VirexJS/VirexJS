import { Database } from "bun:sqlite";
import { getDB } from "./client";

/** Migration definition */
export interface Migration {
	/** Unique version identifier (use timestamps: "20240115_001") */
	version: string;
	/** Human-readable description */
	description: string;
	/** SQL to apply the migration */
	up: string;
	/** SQL to revert the migration */
	down: string;
}

/** Migration result */
export interface MigrationResult {
	applied: string[];
	reverted: string[];
	current: string | null;
}

/**
 * Define a migration with type safety.
 *
 * Usage:
 *   const m001 = defineMigration({
 *     version: "001",
 *     description: "Create users table",
 *     up: "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL)",
 *     down: "DROP TABLE users",
 *   });
 */
export function defineMigration(migration: Migration): Migration {
	return migration;
}

/**
 * Run pending migrations (forward).
 *
 * Tracks applied migrations in a `_virex_migrations` table.
 * Only runs migrations that haven't been applied yet.
 *
 * Usage:
 *   import { migrate } from "@virexjs/db";
 *
 *   const result = migrate([m001, m002, m003]);
 *   console.log(`Applied: ${result.applied.join(", ")}`);
 */
export function migrate(migrations: Migration[], dbPath?: string): MigrationResult {
	const db = getDB(dbPath);
	ensureMigrationsTable(db);

	const applied: string[] = [];
	const appliedSet = getAppliedVersions(db);

	// Sort by version
	const sorted = [...migrations].sort((a, b) => a.version.localeCompare(b.version));

	for (const migration of sorted) {
		if (appliedSet.has(migration.version)) {
			continue;
		}

		try {
			db.run("BEGIN TRANSACTION");
			db.run(migration.up);
			db.run("INSERT INTO _virex_migrations (version, description, applied_at) VALUES (?, ?, ?)", [
				migration.version,
				migration.description,
				new Date().toISOString(),
			]);
			db.run("COMMIT");
			applied.push(migration.version);
		} catch (error) {
			db.run("ROLLBACK");
			throw new Error(
				`Migration "${migration.version}" failed: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	return {
		applied,
		reverted: [],
		current: getCurrentVersion(db),
	};
}

/**
 * Rollback the last N migrations (default: 1).
 *
 * Usage:
 *   const result = rollback(migrations, 1);
 *   console.log(`Reverted: ${result.reverted.join(", ")}`);
 */
export function rollback(migrations: Migration[], count = 1, dbPath?: string): MigrationResult {
	const db = getDB(dbPath);
	ensureMigrationsTable(db);

	const reverted: string[] = [];
	const migrationMap = new Map(migrations.map((m) => [m.version, m]));

	// Get applied migrations in reverse order
	const appliedVersions = db
		.query("SELECT version FROM _virex_migrations ORDER BY rowid DESC LIMIT ?")
		.all(count) as { version: string }[];

	for (const { version } of appliedVersions) {
		const migration = migrationMap.get(version);
		if (!migration) {
			throw new Error(`Migration "${version}" not found in provided migrations`);
		}

		try {
			db.run("BEGIN TRANSACTION");
			db.run(migration.down);
			db.run("DELETE FROM _virex_migrations WHERE version = ?", [version]);
			db.run("COMMIT");
			reverted.push(version);
		} catch (error) {
			db.run("ROLLBACK");
			throw new Error(
				`Rollback "${version}" failed: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	return {
		applied: [],
		reverted,
		current: getCurrentVersion(db),
	};
}

/**
 * Get the current migration status.
 */
export function getMigrationStatus(
	migrations: Migration[],
	dbPath?: string,
): {
	current: string | null;
	pending: string[];
	applied: string[];
} {
	const db = getDB(dbPath);
	ensureMigrationsTable(db);

	const appliedSet = getAppliedVersions(db);
	const sorted = [...migrations].sort((a, b) => a.version.localeCompare(b.version));

	return {
		current: getCurrentVersion(db),
		applied: sorted.filter((m) => appliedSet.has(m.version)).map((m) => m.version),
		pending: sorted.filter((m) => !appliedSet.has(m.version)).map((m) => m.version),
	};
}

// ─── Internal helpers ───────────────────────────────────────────────────────

function ensureMigrationsTable(db: Database): void {
	db.run(`
		CREATE TABLE IF NOT EXISTS _virex_migrations (
			version TEXT PRIMARY KEY,
			description TEXT NOT NULL,
			applied_at TEXT NOT NULL
		)
	`);
}

function getAppliedVersions(db: Database): Set<string> {
	const rows = db.query("SELECT version FROM _virex_migrations").all() as { version: string }[];
	return new Set(rows.map((r) => r.version));
}

function getCurrentVersion(db: Database): string | null {
	const row = db
		.query("SELECT version FROM _virex_migrations ORDER BY rowid DESC LIMIT 1")
		.get() as { version: string } | null;
	return row?.version ?? null;
}
