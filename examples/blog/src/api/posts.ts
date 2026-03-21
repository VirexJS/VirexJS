import { defineAPIRoute, json } from "virexjs";
import { posts } from "../db/schema";

/** GET /api/posts — list published posts */
export const GET = defineAPIRoute(() => {
	const all = posts.findMany({ where: { published: 1 }, orderBy: "id DESC" });
	return json({ posts: all });
});

/** POST /api/posts — create a new post */
export const POST = defineAPIRoute(async ({ request }) => {
	const body = await request.json();
	const now = new Date().toISOString();
	const slug =
		String(body.title ?? "")
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "") || `post-${Date.now()}`;

	const post = posts.insert({
		title: String(body.title ?? "Untitled"),
		slug,
		excerpt: String(body.excerpt ?? ""),
		content: String(body.content ?? ""),
		published: body.published ? 1 : 0,
		created_at: now,
		updated_at: now,
	});

	return json({ post }, { status: 201 });
});
