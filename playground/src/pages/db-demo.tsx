import type { LoaderContext, PageProps } from "virexjs";
import { useHead } from "virexjs";
import Default from "../layouts/Default";

interface DBDemoData {
	tableInfo: string;
	features: string[];
}

export async function loader(_ctx: LoaderContext) {
	return {
		tableInfo: "defineTable() creates typed CRUD operations with SQL injection protection.",
		features: [
			"defineTable(name, schema) — auto-creates table with typed operations",
			"findOne(where) — find single record by condition",
			"findMany({ where, orderBy, limit, offset }) — query with pagination",
			"insert(data) — insert and return the new record",
			"update(where, data) — update matching records",
			"delete(where) — delete matching records",
			"count(where) — count matching records",
			"defineMigration({ version, up, down }) — versioned migrations",
			"migrate(migrations) — apply pending migrations with transactions",
			"rollback(migrations, count) — revert last N migrations",
			"getMigrationStatus() — show applied/pending versions",
		],
	};
}

export default function DBDemo(props: PageProps<DBDemoData>) {
	const head = useHead({
		title: "Database — VirexJS",
		description: "SQLite ORM with typed CRUD and migrations.",
	});

	const codeStyle = {
		background: "#1e1e1e",
		color: "#d4d4d4",
		padding: "16px",
		borderRadius: "8px",
		fontSize: "13px",
		overflow: "auto" as const,
		lineHeight: "1.6",
	};

	return (
		<Default>
			{head}

			<h1 style={{ fontSize: "28px", margin: "0 0 8px" }}>Database</h1>
			<p style={{ color: "#666", margin: "0 0 24px" }}>
				Built-in SQLite ORM using <code>bun:sqlite</code>. Zero dependencies, typed CRUD, SQL
				injection protection.
			</p>

			<h2 style={{ fontSize: "20px", margin: "0 0 12px" }}>Define a Table</h2>
			<pre style={codeStyle}>
				{`import { defineTable } from "@virexjs/db";

const posts = defineTable("posts", {
  id: "integer primary key autoincrement",
  title: "text not null",
  slug: "text not null",
  content: "text not null",
  published: "integer not null default 0",
});

// CRUD — all queries use prepared statements
const post = posts.insert({ title: "Hello", slug: "hello", content: "World", published: 1 });
const found = posts.findOne({ slug: "hello" });
const all = posts.findMany({ where: { published: 1 }, orderBy: "id DESC", limit: 10 });
posts.update({ id: 1 }, { title: "Updated" });
posts.delete({ id: 1 });
const total = posts.count({ published: 1 });`}
			</pre>

			<h2 style={{ fontSize: "20px", margin: "24px 0 12px" }}>Migrations</h2>
			<pre style={codeStyle}>
				{`import { defineMigration, migrate, rollback } from "@virexjs/db";

const m001 = defineMigration({
  version: "001",
  description: "Create users table",
  up: "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL)",
  down: "DROP TABLE users",
});

// Apply pending migrations (with transaction safety)
const result = migrate([m001]);
console.log(\`Applied: \${result.applied.join(", ")}\`);

// Rollback last migration
rollback([m001], 1);`}
			</pre>

			<h2 style={{ fontSize: "20px", margin: "24px 0 12px" }}>Features</h2>
			<ul style={{ paddingLeft: "20px", lineHeight: "1.8", color: "#555" }}>
				{props.data.features.map((f) => (
					<li>
						<code>{f.split(" — ")[0]}</code>
						{f.includes(" — ") ? ` — ${f.split(" — ")[1]}` : ""}
					</li>
				))}
			</ul>

			<div
				style={{
					marginTop: "24px",
					padding: "16px",
					background: "#fff3cd",
					borderRadius: "8px",
					fontSize: "14px",
					color: "#856404",
				}}
			>
				<strong>Security:</strong> Column names are validated against the schema whitelist. ORDER BY
				clauses are sanitized. All values use prepared statement bindings (no SQL injection).
			</div>
		</Default>
	);
}
