import { describe, expect, test } from "bun:test";
import { defineRoute, route } from "../src/render/routes";

describe("route()", () => {
	test("static route", () => {
		expect(route("/about")).toBe("/about");
	});

	test("single param", () => {
		expect(route("/blog/:slug", { slug: "hello" })).toBe("/blog/hello");
	});

	test("multiple params", () => {
		expect(route("/users/:id/posts/:postId", { id: "42", postId: "99" })).toBe(
			"/users/42/posts/99",
		);
	});

	test("encodes special characters", () => {
		expect(route("/search/:q", { q: "hello world" })).toBe("/search/hello%20world");
	});

	test("number params", () => {
		expect(route("/page/:num", { num: 5 })).toBe("/page/5");
	});

	test("throws on missing params", () => {
		expect(() => route("/blog/:slug/:id", { slug: "hello" })).toThrow("Missing route params");
	});
});

describe("defineRoute()", () => {
	test("static route returns function", () => {
		const about = defineRoute("/about");
		expect(about()).toBe("/about");
	});

	test("param route returns function", () => {
		const post = defineRoute("/blog/:slug");
		expect(post({ slug: "hello" })).toBe("/blog/hello");
	});

	test("multi-param route", () => {
		const userPost = defineRoute("/users/:id/posts/:postId");
		expect(userPost({ id: "1", postId: "2" })).toBe("/users/1/posts/2");
	});
});
