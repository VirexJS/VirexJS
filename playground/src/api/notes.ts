import { defineTable } from "@virexjs/db";
import { defineAPIRoute, json } from "virexjs";

/** In-memory SQLite notes table — demonstrates defineTable() CRUD */
const notes = defineTable("notes", {
	id: "integer primary key autoincrement",
	title: "text not null",
	content: "text not null default ''",
	created_at: "text not null",
});

// Seed some demo data on first load
try {
	if (notes.count() === 0) {
		notes.insert({
			title: "Welcome",
			content: "This is a live SQLite database running in memory.",
			created_at: new Date().toISOString(),
		});
		notes.insert({
			title: "VirexJS",
			content: "defineTable() gives you typed CRUD with SQL injection protection.",
			created_at: new Date().toISOString(),
		});
		notes.insert({
			title: "Zero Dependencies",
			content: "Everything runs on bun:sqlite — no external packages.",
			created_at: new Date().toISOString(),
		});
	}
} catch {
	// Table may already have data
}

/** GET /api/notes — list all notes */
export const GET = defineAPIRoute(() => {
	const all = notes.findMany({ orderBy: "id DESC" });
	return json({ notes: all, total: notes.count() });
});

/** POST /api/notes — create a note */
export const POST = defineAPIRoute(async ({ request }) => {
	const body = await request.json();
	const title = String(body.title ?? "").trim();
	const content = String(body.content ?? "").trim();

	if (!title) {
		return json({ error: "Title is required" }, { status: 400 });
	}

	const note = notes.insert({
		title,
		content,
		created_at: new Date().toISOString(),
	});

	return json({ note }, { status: 201 });
});

/** DELETE /api/notes — delete a note by id (via query param) */
export const DELETE = defineAPIRoute(({ request }) => {
	const url = new URL(request.url);
	const id = url.searchParams.get("id");

	if (!id) {
		return json({ error: "id query param required" }, { status: 400 });
	}

	notes.delete({ id: Number(id) });
	return json({ deleted: true });
});
