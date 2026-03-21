import { describe, expect, test } from "bun:test";
import { extractParams, parseSegment, segmentToURL } from "../src/params";

describe("parseSegment", () => {
	test("static segment returns null", () => {
		expect(parseSegment("blog")).toBeNull();
	});

	test("single dynamic param", () => {
		expect(parseSegment("[slug]")).toEqual({ name: "slug", type: "single" });
	});

	test("catch-all param", () => {
		expect(parseSegment("[...rest]")).toEqual({ name: "rest", type: "catchAll" });
	});

	test("index returns null", () => {
		expect(parseSegment("index")).toBeNull();
	});

	test("nested single param", () => {
		expect(parseSegment("[id]")).toEqual({ name: "id", type: "single" });
	});

	test("group segment returns null", () => {
		expect(parseSegment("(auth)")).toBeNull();
	});
});

describe("segmentToURL", () => {
	test("static segment stays same", () => {
		expect(segmentToURL("blog")).toBe("blog");
	});

	test("single dynamic becomes colon prefix", () => {
		expect(segmentToURL("[slug]")).toBe(":slug");
	});

	test("catch-all becomes star prefix", () => {
		expect(segmentToURL("[...rest]")).toBe("*rest");
	});

	test("group returns null", () => {
		expect(segmentToURL("(auth)")).toBeNull();
	});

	test("about stays about", () => {
		expect(segmentToURL("about")).toBe("about");
	});
});

describe("extractParams", () => {
	test("static segments — no params", () => {
		expect(extractParams(["blog"], ["blog"])).toEqual({});
	});

	test("single dynamic param extraction", () => {
		expect(extractParams(["blog", ":slug"], ["blog", "hello-world"])).toEqual({
			slug: "hello-world",
		});
	});

	test("multiple dynamic params", () => {
		expect(
			extractParams(["users", ":userId", "posts", ":postId"], ["users", "42", "posts", "99"]),
		).toEqual({ userId: "42", postId: "99" });
	});

	test("catch-all param", () => {
		expect(extractParams(["docs", "*rest"], ["docs", "getting-started", "intro"])).toEqual({
			rest: "getting-started/intro",
		});
	});

	test("mismatch returns null", () => {
		expect(extractParams(["blog"], ["about"])).toBeNull();
	});

	test("length mismatch returns null", () => {
		expect(extractParams(["blog", ":slug"], ["blog"])).toBeNull();
	});

	test("too many path segments returns null", () => {
		expect(extractParams(["blog"], ["blog", "extra"])).toBeNull();
	});

	test("URL-encoded param gets decoded", () => {
		expect(extractParams(["blog", ":slug"], ["blog", "hello%20world"])).toEqual({
			slug: "hello world",
		});
	});
});
