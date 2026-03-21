import { describe, test, expect, beforeEach } from "bun:test";
import { getDB, closeDB } from "../src/client";
import { defineTable } from "../src/table";

beforeEach(() => {
	closeDB();
	// Reset to fresh in-memory database
});

describe("defineTable", () => {
	test("creates table and inserts a row", () => {
		const users = defineTable("users", {
			id: "integer primary key autoincrement",
			name: "text not null",
			email: "text not null",
		});

		const user = users.insert({ name: "Alice", email: "alice@example.com" });
		expect(user.name).toBe("Alice");
		expect(user.email).toBe("alice@example.com");
		expect(user.id).toBe(1);
	});

	test("findOne returns a single row", () => {
		const users = defineTable("users2", {
			id: "integer primary key autoincrement",
			name: "text not null",
		});

		users.insert({ name: "Bob" });
		const found = users.findOne({ name: "Bob" });
		expect(found).not.toBeNull();
		expect(found!.name).toBe("Bob");
	});

	test("findOne returns null when no match", () => {
		const users = defineTable("users3", {
			id: "integer primary key autoincrement",
			name: "text not null",
		});

		const found = users.findOne({ name: "Nobody" });
		expect(found).toBeNull();
	});

	test("findMany returns all rows", () => {
		const items = defineTable("items", {
			id: "integer primary key autoincrement",
			title: "text not null",
		});

		items.insert({ title: "Item A" });
		items.insert({ title: "Item B" });
		items.insert({ title: "Item C" });

		const all = items.findMany();
		expect(all).toHaveLength(3);
	});

	test("findMany with where clause", () => {
		const items = defineTable("items2", {
			id: "integer primary key autoincrement",
			title: "text not null",
			category: "text not null",
		});

		items.insert({ title: "Item A", category: "books" });
		items.insert({ title: "Item B", category: "games" });
		items.insert({ title: "Item C", category: "books" });

		const books = items.findMany({ where: { category: "books" } });
		expect(books).toHaveLength(2);
	});

	test("findMany with limit and offset", () => {
		const items = defineTable("items3", {
			id: "integer primary key autoincrement",
			title: "text not null",
		});

		for (let i = 1; i <= 10; i++) {
			items.insert({ title: `Item ${i}` });
		}

		const page = items.findMany({ limit: 3, offset: 2 });
		expect(page).toHaveLength(3);
		expect(page[0]!.title).toBe("Item 3");
	});

	test("findMany with orderBy", () => {
		const items = defineTable("items4", {
			id: "integer primary key autoincrement",
			title: "text not null",
		});

		items.insert({ title: "C" });
		items.insert({ title: "A" });
		items.insert({ title: "B" });

		const sorted = items.findMany({ orderBy: "title ASC" });
		expect(sorted[0]!.title).toBe("A");
		expect(sorted[1]!.title).toBe("B");
		expect(sorted[2]!.title).toBe("C");
	});

	test("update modifies a row", () => {
		const users = defineTable("users4", {
			id: "integer primary key autoincrement",
			name: "text not null",
			email: "text not null",
		});

		users.insert({ name: "Alice", email: "old@example.com" });
		const updated = users.update({ name: "Alice" }, { email: "new@example.com" });
		expect(updated).not.toBeNull();
		expect(updated!.email).toBe("new@example.com");
	});

	test("update returns null when no match", () => {
		const users = defineTable("users5", {
			id: "integer primary key autoincrement",
			name: "text not null",
		});

		const result = users.update({ name: "Nobody" }, { name: "Somebody" });
		expect(result).toBeNull();
	});

	test("delete removes a row", () => {
		const items = defineTable("items5", {
			id: "integer primary key autoincrement",
			title: "text not null",
		});

		items.insert({ title: "To Delete" });
		expect(items.count()).toBe(1);
		items.delete({ title: "To Delete" });
		expect(items.count()).toBe(0);
	});

	test("count returns total rows", () => {
		const items = defineTable("items6", {
			id: "integer primary key autoincrement",
			title: "text not null",
		});

		expect(items.count()).toBe(0);
		items.insert({ title: "A" });
		items.insert({ title: "B" });
		expect(items.count()).toBe(2);
	});

	test("count with where clause", () => {
		const items = defineTable("items7", {
			id: "integer primary key autoincrement",
			title: "text not null",
			active: "integer not null",
		});

		items.insert({ title: "A", active: 1 });
		items.insert({ title: "B", active: 0 });
		items.insert({ title: "C", active: 1 });

		expect(items.count({ active: 1 })).toBe(2);
		expect(items.count({ active: 0 })).toBe(1);
	});

	test("findMany empty result returns empty array", () => {
		const items = defineTable("items8", {
			id: "integer primary key autoincrement",
			title: "text not null",
		});

		expect(items.findMany()).toEqual([]);
	});
});
