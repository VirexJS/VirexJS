import { defineTable } from "@virexjs/db";

export const users = defineTable("users", {
	id: "integer primary key autoincrement",
	email: "text not null unique",
	name: "text not null",
	password_hash: "text not null",
	plan: "text not null default 'free'",
	created_at: "text not null",
});

export const projects = defineTable("projects", {
	id: "integer primary key autoincrement",
	user_id: "integer not null",
	name: "text not null",
	description: "text not null default ''",
	status: "text not null default 'active'",
	created_at: "text not null",
});

// Seed
try {
	if (users.count() === 0) {
		const now = new Date().toISOString();
		const hash = "demo"; // In production: use hashPassword()
		users.insert({ email: "demo@example.com", name: "Demo User", password_hash: hash, plan: "pro", created_at: now });
		projects.insert({ user_id: 1, name: "My First Project", description: "Getting started with VirexJS", status: "active", created_at: now });
		projects.insert({ user_id: 1, name: "Landing Page", description: "Marketing website", status: "active", created_at: now });
		projects.insert({ user_id: 1, name: "Old Project", description: "Archived", status: "archived", created_at: now });
	}
} catch { /* already seeded */ }
