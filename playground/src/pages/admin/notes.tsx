import { getDB } from "@virexjs/db";
import type { LoaderContext, PageProps } from "virexjs";
import { useHead } from "virexjs";
import Default from "../../layouts/Default";

interface Note {
	id: number;
	title: string;
	content: string;
	created_at: string;
}

interface NotesData {
	notes: Note[];
}

export async function loader(_ctx: LoaderContext) {
	const db = getDB();
	let notes: Note[] = [];
	try {
		notes = db
			.query("SELECT id, title, content, created_at FROM notes ORDER BY id DESC")
			.all() as Note[];
	} catch {
		/* table may not exist */
	}
	return { notes };
}

export default function AdminNotes(props: PageProps<NotesData>) {
	const { notes } = props.data;
	const head = useHead({ title: "Notes — Admin — VirexJS" });

	const codeStyle = {
		background: "#1e1e1e",
		color: "#d4d4d4",
		padding: "12px",
		borderRadius: "8px",
		fontSize: "12px",
		overflow: "auto" as const,
	};

	return (
		<Default>
			{head}

			<div style={{ marginBottom: "24px" }}>
				<a href="/admin" style={{ fontSize: "13px", color: "#6b7280" }}>
					{"← Back to Dashboard"}
				</a>
				<h1 style={{ fontSize: "24px", margin: "8px 0 0" }}>Notes ({notes.length})</h1>
			</div>

			{/* Notes List */}
			<div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
				{notes.map((note) => (
					<div
						style={{
							padding: "14px 16px",
							border: "1px solid #e5e7eb",
							borderRadius: "8px",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "start",
						}}
					>
						<div>
							<strong style={{ fontSize: "15px" }}>{note.title}</strong>
							<p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "13px" }}>
								{note.content || "(no content)"}
							</p>
						</div>
						<span style={{ color: "#d1d5db", fontSize: "12px", whiteSpace: "nowrap" }}>
							#{note.id}
						</span>
					</div>
				))}
				{notes.length === 0 && (
					<p style={{ color: "#9ca3af", textAlign: "center", padding: "32px" }}>No notes yet.</p>
				)}
			</div>

			{/* CRUD API */}
			<div
				style={{
					padding: "16px",
					background: "#f9fafb",
					borderRadius: "8px",
					fontSize: "13px",
				}}
			>
				<strong>CRUD via API:</strong>
				<pre style={codeStyle}>
					{`# List
curl /api/notes

# Create
curl -X POST -H "Content-Type: application/json" \\
  -d '{"title":"New","content":"Hello"}' /api/notes

# Delete
curl -X DELETE "/api/notes?id=1"`}
				</pre>
			</div>
		</Default>
	);
}
