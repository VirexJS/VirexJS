import { describe, expect, test } from "bun:test";
import { buildTree } from "../src/tree";
import type { ScannedRoute } from "../src/types";

function route(relativePath: string, segments: string[]): ScannedRoute {
	return { relativePath, absolutePath: `/pages/${relativePath}`, segments };
}

// ─── Basic tree building ────────────────────────────────────────────────────

describe("buildTree", () => {
	test("empty routes produce empty root", () => {
		const tree = buildTree([]);
		expect(tree.segment).toBe("");
		expect(tree.children).toHaveLength(0);
		expect(tree.filePath).toBeNull();
	});

	test("root index route", () => {
		const tree = buildTree([route("index.tsx", [])]);
		expect(tree.filePath).toBe("/pages/index.tsx");
		expect(tree.children).toHaveLength(0);
	});

	test("single static route", () => {
		const tree = buildTree([route("about.tsx", ["about"])]);
		expect(tree.children).toHaveLength(1);
		expect(tree.children[0]?.segment).toBe("about");
		expect(tree.children[0]?.filePath).toBe("/pages/about.tsx");
		expect(tree.children[0]?.isDynamic).toBe(false);
	});

	test("nested static routes", () => {
		const tree = buildTree([
			route("blog/index.tsx", ["blog"]),
			route("blog/archive.tsx", ["blog", "archive"]),
		]);

		expect(tree.children).toHaveLength(1);
		const blog = tree.children[0]!;
		expect(blog.segment).toBe("blog");
		expect(blog.filePath).toBe("/pages/blog/index.tsx");
		expect(blog.children).toHaveLength(1);
		expect(blog.children[0]?.segment).toBe("archive");
	});
});

// ─── Dynamic routes ─────────────────────────────────────────────────────────

describe("dynamic routes", () => {
	test("dynamic param segment", () => {
		const tree = buildTree([route("blog/[slug].tsx", ["blog", "[slug]"])]);
		const slugNode = tree.children[0]!.children[0]!;
		expect(slugNode.isDynamic).toBe(true);
		expect(slugNode.params).toHaveLength(1);
		expect(slugNode.params[0]?.name).toBe("slug");
		expect(slugNode.params[0]?.type).toBe("single");
	});

	test("catch-all segment", () => {
		const tree = buildTree([route("docs/[...rest].tsx", ["docs", "[...rest]"])]);
		const restNode = tree.children[0]!.children[0]!;
		expect(restNode.isCatchAll).toBe(true);
		expect(restNode.params[0]?.name).toBe("rest");
		expect(restNode.params[0]?.type).toBe("catchAll");
	});

	test("multiple dynamic params", () => {
		const tree = buildTree([
			route("users/[id]/posts/[postId].tsx", ["users", "[id]", "posts", "[postId]"]),
		]);
		const users = tree.children[0]!;
		const id = users.children[0]!;
		const posts = id.children[0]!;
		const postId = posts.children[0]!;

		expect(id.isDynamic).toBe(true);
		expect(id.params[0]?.name).toBe("id");
		expect(postId.isDynamic).toBe(true);
		expect(postId.params[0]?.name).toBe("postId");
	});
});

// ─── Route groups ───────────────────────────────────────────────────────────

describe("route groups", () => {
	test("group segment marked as group", () => {
		const tree = buildTree([route("(auth)/login.tsx", ["(auth)", "login"])]);
		const authGroup = tree.children[0]!;
		expect(authGroup.isGroup).toBe(true);
	});
});

// ─── Priority sorting ──────────────────────────────────────────────────────

describe("priority sorting", () => {
	test("static routes before dynamic", () => {
		const tree = buildTree([
			route("blog/[slug].tsx", ["blog", "[slug]"]),
			route("blog/archive.tsx", ["blog", "archive"]),
		]);

		const blog = tree.children[0]!;
		expect(blog.children[0]?.segment).toBe("archive"); // static first
		expect(blog.children[1]?.isDynamic).toBe(true); // dynamic second
	});

	test("dynamic before catch-all", () => {
		const tree = buildTree([
			route("docs/[...rest].tsx", ["docs", "[...rest]"]),
			route("docs/[slug].tsx", ["docs", "[slug]"]),
		]);

		const docs = tree.children[0]!;
		expect(docs.children[0]?.isDynamic).toBe(true); // dynamic first
		expect(docs.children[1]?.isCatchAll).toBe(true); // catch-all last
	});

	test("full priority order: static > group > dynamic > catch-all", () => {
		const tree = buildTree([
			route("page/[...rest].tsx", ["page", "[...rest]"]),
			route("page/[id].tsx", ["page", "[id]"]),
			route("page/(admin)/dashboard.tsx", ["page", "(admin)", "dashboard"]),
			route("page/settings.tsx", ["page", "settings"]),
		]);

		const page = tree.children[0]!;
		expect(page.children[0]?.segment).toBe("settings"); // static = 0
		expect(page.children[1]?.isGroup).toBe(true); // group = 1
		expect(page.children[2]?.isDynamic).toBe(true); // dynamic = 2
		expect(page.children[3]?.isCatchAll).toBe(true); // catch-all = 3
	});

	test("alphabetical within same priority", () => {
		const tree = buildTree([
			route("contact.tsx", ["contact"]),
			route("about.tsx", ["about"]),
			route("blog.tsx", ["blog"]),
		]);

		expect(tree.children[0]?.segment).toBe("about");
		expect(tree.children[1]?.segment).toBe("blog");
		expect(tree.children[2]?.segment).toBe("contact");
	});
});

// ─── Shared segments ────────────────────────────────────────────────────────

describe("shared segments", () => {
	test("routes sharing prefix share tree nodes", () => {
		const tree = buildTree([
			route("blog/index.tsx", ["blog"]),
			route("blog/[slug].tsx", ["blog", "[slug]"]),
			route("blog/archive.tsx", ["blog", "archive"]),
		]);

		// Only one "blog" child
		expect(tree.children).toHaveLength(1);
		const blog = tree.children[0]!;
		expect(blog.filePath).toBe("/pages/blog/index.tsx");
		expect(blog.children).toHaveLength(2); // archive + [slug]
	});

	test("deeply nested shared structure", () => {
		const tree = buildTree([
			route("a/b/c.tsx", ["a", "b", "c"]),
			route("a/b/d.tsx", ["a", "b", "d"]),
			route("a/e.tsx", ["a", "e"]),
		]);

		expect(tree.children).toHaveLength(1); // a
		const a = tree.children[0]!;
		expect(a.children).toHaveLength(2); // b, e
		const b = a.children.find((c) => c.segment === "b")!;
		expect(b.children).toHaveLength(2); // c, d
	});
});
