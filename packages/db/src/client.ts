import { Database } from "bun:sqlite";

let _db: Database | null = null;

/**
 * Get or create the SQLite database singleton.
 * Enables WAL mode and foreign keys by default.
 */
export function getDB(path?: string): Database {
	if (_db) {
		return _db;
	}

	_db = new Database(path ?? ":memory:", { create: true });
	_db.run("PRAGMA journal_mode = WAL;");
	_db.run("PRAGMA foreign_keys = ON;");

	return _db;
}

/**
 * Close the database connection and reset singleton.
 */
export function closeDB(): void {
	if (_db) {
		_db.close();
		_db = null;
	}
}
