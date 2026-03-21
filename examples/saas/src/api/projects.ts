import { defineAPIRoute, json } from "virexjs";
import { projects } from "../db/schema";

export const GET = defineAPIRoute(() => {
	const all = projects.findMany({ where: { user_id: 1 }, orderBy: "id DESC" });
	return json({ projects: all });
});

export const POST = defineAPIRoute(async ({ request }) => {
	const body = await request.json();
	const now = new Date().toISOString();
	const project = projects.insert({
		user_id: 1,
		name: String(body.name ?? "Untitled"),
		description: String(body.description ?? ""),
		status: "active",
		created_at: now,
	});
	return json({ project }, { status: 201 });
});
