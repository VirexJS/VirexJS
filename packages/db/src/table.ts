import type { SQLQueryBindings } from "bun:sqlite";
import { getDB } from "./client";

type ColumnDef = string;
type Bindings = SQLQueryBindings[];

/** Cast unknown[] to SQLQueryBindings[] for prepared statement binding */
function asBindings(values: unknown[]): Bindings {
	return values as Bindings;
}

interface TableOperations<T extends Record<string, ColumnDef>> {
	findOne(where: Partial<Record<keyof T, unknown>>): Record<string, unknown> | null;
	findMany(opts?: {
		where?: Partial<Record<keyof T, unknown>>;
		orderBy?: string;
		limit?: number;
		offset?: number;
	}): Record<string, unknown>[];
	insert(data: Partial<Record<keyof T, unknown>>): Record<string, unknown>;
	update(
		where: Partial<Record<keyof T, unknown>>,
		data: Partial<Record<keyof T, unknown>>,
	): Record<string, unknown> | null;
	delete(where: Partial<Record<keyof T, unknown>>): void;
	count(where?: Partial<Record<keyof T, unknown>>): number;
}

/** Validate an identifier (table/column name) — alphanumeric + underscore only */
function validateIdentifier(name: string): string {
	if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
		throw new Error(`Invalid identifier: "${name}". Only alphanumeric and underscore allowed.`);
	}
	return name;
}

/**
 * Define a table with auto-creation and return typed CRUD operations.
 * Uses prepared statements for SQL injection prevention.
 * Column names and table names are validated against injection.
 */
export function defineTable<T extends Record<string, ColumnDef>>(
	name: string,
	schema: T,
): TableOperations<T> {
	const db = getDB();
	const schemaKeys = new Set(Object.keys(schema));

	// Validate table name and column names at definition time
	validateIdentifier(name);
	for (const col of schemaKeys) {
		validateIdentifier(col);
	}

	// Auto-create table
	const columns = Object.entries(schema)
		.map(([col, def]) => `"${col}" ${def}`)
		.join(", ");
	db.run(`CREATE TABLE IF NOT EXISTS "${name}" (${columns})`);

	/** Validate that all keys exist in the schema to prevent column injection */
	function validateKeys(obj: Record<string, unknown>): void {
		for (const key of Object.keys(obj)) {
			if (!schemaKeys.has(key)) {
				throw new Error(`Unknown column: "${key}". Valid columns: ${[...schemaKeys].join(", ")}`);
			}
		}
	}

	function buildWhere(where: Partial<Record<string, unknown>>): {
		clause: string;
		values: unknown[];
	} {
		const entries = Object.entries(where);
		if (entries.length === 0) {
			return { clause: "", values: [] };
		}
		validateKeys(where);
		const conditions = entries.map(([key]) => `"${key}" = ?`);
		const values = entries.map(([, val]) => val);
		return { clause: ` WHERE ${conditions.join(" AND ")}`, values };
	}

	return {
		findOne(where) {
			const { clause, values } = buildWhere(where);
			const stmt = db.prepare(`SELECT * FROM "${name}"${clause} LIMIT 1`);
			const row = stmt.get(...asBindings(values)) as Record<string, unknown> | null;
			return row ?? null;
		},

		findMany(opts = {}) {
			let sql = `SELECT * FROM "${name}"`;
			const allValues: unknown[] = [];

			if (opts.where) {
				const { clause, values } = buildWhere(opts.where);
				sql += clause;
				allValues.push(...values);
			}

			if (opts.orderBy) {
				// Validate orderBy: only allow "column ASC|DESC" patterns
				const orderParts = opts.orderBy.split(",").map((p) => p.trim());
				const validatedOrder = orderParts.map((part) => {
					const match = part.match(/^(\w+)(?:\s+(ASC|DESC))?$/i);
					if (!match) throw new Error(`Invalid ORDER BY: "${part}"`);
					const col = match[1]!;
					if (!schemaKeys.has(col)) throw new Error(`Unknown column in ORDER BY: "${col}"`);
					return match[2] ? `"${col}" ${match[2].toUpperCase()}` : `"${col}"`;
				});
				sql += ` ORDER BY ${validatedOrder.join(", ")}`;
			}

			if (opts.limit !== undefined) {
				sql += ` LIMIT ?`;
				allValues.push(opts.limit);
			}

			if (opts.offset !== undefined) {
				sql += ` OFFSET ?`;
				allValues.push(opts.offset);
			}

			const stmt = db.prepare(sql);
			return stmt.all(...asBindings(allValues)) as Record<string, unknown>[];
		},

		insert(data) {
			validateKeys(data);
			const entries = Object.entries(data);
			const columns = entries.map(([key]) => `"${key}"`).join(", ");
			const placeholders = entries.map(() => "?").join(", ");
			const values = entries.map(([, val]) => val);

			const stmt = db.prepare(
				`INSERT INTO "${name}" (${columns}) VALUES (${placeholders}) RETURNING *`,
			);
			return stmt.get(...asBindings(values)) as Record<string, unknown>;
		},

		update(where, data) {
			validateKeys(data);
			const dataEntries = Object.entries(data);
			const setClauses = dataEntries.map(([key]) => `"${key}" = ?`).join(", ");
			const setValues = dataEntries.map(([, val]) => val);

			const { clause, values: whereValues } = buildWhere(where);

			const stmt = db.prepare(`UPDATE "${name}" SET ${setClauses}${clause} RETURNING *`);
			const row = stmt.get(...asBindings([...setValues, ...whereValues])) as Record<
				string,
				unknown
			> | null;
			return row ?? null;
		},

		delete(where) {
			const { clause, values } = buildWhere(where);
			const stmt = db.prepare(`DELETE FROM "${name}"${clause}`);
			stmt.run(...asBindings(values));
		},

		count(where) {
			let sql = `SELECT COUNT(*) as count FROM "${name}"`;
			const allValues: unknown[] = [];

			if (where) {
				const { clause, values } = buildWhere(where);
				sql += clause;
				allValues.push(...values);
			}

			const stmt = db.prepare(sql);
			const row = stmt.get(...asBindings(allValues)) as { count: number };
			return row.count;
		},
	};
}
