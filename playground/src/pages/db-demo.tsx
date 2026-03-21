import type { LoaderContext, PageProps } from "virexjs";
import { useHead } from "virexjs";
import Default from "../layouts/Default";

interface Note {
	id: number;
	title: string;
	content: string;
	created_at: string;
}

interface DBDemoData {
	notes: Note[];
	total: number;
}

export async function loader(ctx: LoaderContext) {
	// Fetch notes from our own API
	try {
		const url = new URL("/api/notes", ctx.request.url);
		const res = await fetch(url.toString());
		const data = await res.json();
		return { notes: data.notes ?? [], total: data.total ?? 0 };
	} catch {
		return { notes: [], total: 0 };
	}
}

export default function DBDemo(props: PageProps<DBDemoData>) {
	const { notes, total } = props.data;
	const head = useHead({
		title: "Database — VirexJS",
		description: "Live SQLite database demo with defineTable() CRUD.",
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
				Built-in SQLite ORM using <code>bun:sqlite</code>. Zero dependencies, typed CRUD.
			</p>

			<section
				style={{
					padding: "20px",
					background: "#f0f7ff",
					borderRadius: "8px",
					marginBottom: "24px",
				}}
			>
				<h2 style={{ fontSize: "18px", margin: "0 0 12px" }}>Live Notes ({total} records)</h2>
				<p style={{ color: "#666", fontSize: "14px", margin: "0 0 12px" }}>
					These notes are stored in a live SQLite database (in-memory). Try the API:
				</p>
				<div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
					{notes.length > 0 ? (
						notes.map((note) => (
							<div
								style={{
									padding: "12px",
									background: "#fff",
									borderRadius: "6px",
									border: "1px solid #e0e7ff",
								}}
							>
								<strong style={{ fontSize: "14px" }}>{note.title}</strong>
								<p style={{ margin: "4px 0 0", color: "#666", fontSize: "13px" }}>{note.content}</p>
							</div>
						))
					) : (
						<p style={{ color: "#999", fontStyle: "italic" }}>No notes yet.</p>
					)}
				</div>
				<div style={{ fontSize: "13px", color: "#555" }}>
					<strong>Try it:</strong>
					<pre style={{ ...codeStyle, marginTop: "8px", fontSize: "12px" }}>
						{`# List notes
curl http://localhost:3000/api/notes

# Create a note
curl -X POST -H "Content-Type: application/json" \\
  -d '{"title":"My Note","content":"Hello!"}' \\
  http://localhost:3000/api/notes

# Delete a note
curl -X DELETE "http://localhost:3000/api/notes?id=1"`}
					</pre>
				</div>
			</section>

			<h2 style={{ fontSize: "20px", margin: "0 0 12px" }}>How It Works</h2>
			<pre style={codeStyle}>
				{`import { defineTable } from "@virexjs/db";

// Define table — auto-creates with typed CRUD
const notes = defineTable("notes", {
  id: "integer primary key autoincrement",
  title: "text not null",
  content: "text not null default ''",
  created_at: "text not null",
});

// Insert
notes.insert({ title: "Hello", content: "World", created_at: new Date().toISOString() });

// Query
notes.findMany({ orderBy: "id DESC", limit: 10 });
notes.findOne({ id: 1 });
notes.count({ title: "Hello" });

// Update & Delete
notes.update({ id: 1 }, { title: "Updated" });
notes.delete({ id: 1 });`}
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

migrate([m001]);      // Apply pending
rollback([m001], 1);  // Revert last`}
			</pre>

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
				<strong>Security:</strong> Column names validated against schema. ORDER BY sanitized. All
				values use prepared statement bindings. SQL injection protected.
			</div>
		</Default>
	);
}
