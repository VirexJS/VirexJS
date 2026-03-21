import { defineTable } from "@virexjs/db";

export const posts = defineTable("posts", {
	id: "integer primary key autoincrement",
	title: "text not null",
	slug: "text not null unique",
	excerpt: "text not null default ''",
	content: "text not null default ''",
	published: "integer not null default 0",
	created_at: "text not null",
	updated_at: "text not null",
});

// Seed data
try {
	if (posts.count() === 0) {
		const now = new Date().toISOString();
		posts.insert({
			title: "Welcome to VirexJS Blog",
			slug: "welcome",
			excerpt: "Your first blog post, powered by VirexJS and SQLite.",
			content:
				"This is a fully functional blog built with VirexJS. It uses SQLite for storage, server-side rendering for speed, and islands for interactivity.\n\nEdit this post in the admin panel or directly in the database.",
			published: 1,
			created_at: now,
			updated_at: now,
		});
		posts.insert({
			title: "Why Zero JavaScript?",
			slug: "zero-js",
			excerpt: "Pages load instantly because there is no JavaScript to parse, compile, or execute.",
			content:
				"Most web frameworks ship a JavaScript runtime to every page. React alone is ~85KB gzipped. VirexJS ships zero JS by default.\n\nOnly island components — like the like button below this post — ship any JavaScript. Everything else is pure server-rendered HTML.",
			published: 1,
			created_at: now,
			updated_at: now,
		});
		posts.insert({
			title: "Draft Post",
			slug: "draft-post",
			excerpt: "This post is not published yet.",
			content: "This is a draft. Set published=1 to make it visible.",
			published: 0,
			created_at: now,
			updated_at: now,
		});
	}
} catch {
	// Already seeded
}
