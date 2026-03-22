import { describe, expect, test } from "bun:test";
import { withETag } from "../src/server/etag";

describe("withETag", () => {
	test("adds ETag header to GET response", async () => {
		const req = new Request("http://localhost/api/data");
		const res = new Response(JSON.stringify({ hello: "world" }), {
			headers: { "Content-Type": "application/json" },
		});

		const tagged = await withETag(req, res);
		expect(tagged.status).toBe(200);
		expect(tagged.headers.get("ETag")).toMatch(/^W\/"[a-f0-9]+"/);
	});

	test("returns 304 when If-None-Match matches", async () => {
		const body = JSON.stringify({ hello: "world" });
		const res1 = new Response(body, {
			headers: { "Content-Type": "application/json" },
		});

		// First request — get the ETag
		const req1 = new Request("http://localhost/api/data");
		const tagged = await withETag(req1, res1);
		const etag = tagged.headers.get("ETag")!;
		expect(etag).toBeTruthy();

		// Second request — send If-None-Match
		const req2 = new Request("http://localhost/api/data", {
			headers: { "If-None-Match": etag },
		});
		const res2 = new Response(body, {
			headers: { "Content-Type": "application/json" },
		});
		const cached = await withETag(req2, res2);
		expect(cached.status).toBe(304);
	});

	test("skips non-GET requests", async () => {
		const req = new Request("http://localhost/api/data", { method: "POST" });
		const res = new Response("created", { status: 201 });

		const result = await withETag(req, res);
		expect(result.headers.get("ETag")).toBeNull();
		expect(result.status).toBe(201);
	});

	test("skips non-200 responses", async () => {
		const req = new Request("http://localhost/api/data");
		const res = new Response("Not Found", { status: 404 });

		const result = await withETag(req, res);
		expect(result.headers.get("ETag")).toBeNull();
		expect(result.status).toBe(404);
	});

	test("same content produces same ETag", async () => {
		const body = "consistent content";
		const req = new Request("http://localhost/data");

		const r1 = await withETag(req, new Response(body));
		const r2 = await withETag(req, new Response(body));

		expect(r1.headers.get("ETag")).toBe(r2.headers.get("ETag"));
	});

	test("different content produces different ETag", async () => {
		const req = new Request("http://localhost/data");

		const r1 = await withETag(req, new Response("content A"));
		const r2 = await withETag(req, new Response("content B"));

		expect(r1.headers.get("ETag")).not.toBe(r2.headers.get("ETag"));
	});

	test("preserves original response body", async () => {
		const body = JSON.stringify({ data: [1, 2, 3] });
		const req = new Request("http://localhost/api/data");
		const res = new Response(body, {
			headers: { "Content-Type": "application/json" },
		});

		const tagged = await withETag(req, res);
		const text = await tagged.text();
		expect(text).toBe(body);
	});

	test("preserves Cache-Control on 304", async () => {
		const body = "test";
		const req1 = new Request("http://localhost/data");
		const res1 = new Response(body, {
			headers: { "Cache-Control": "public, max-age=60" },
		});

		const tagged = await withETag(req1, res1);
		const etag = tagged.headers.get("ETag")!;

		const req2 = new Request("http://localhost/data", {
			headers: { "If-None-Match": etag },
		});
		const res2 = new Response(body, {
			headers: { "Cache-Control": "public, max-age=60" },
		});
		const cached = await withETag(req2, res2);
		expect(cached.status).toBe(304);
		expect(cached.headers.get("Cache-Control")).toBe("public, max-age=60");
	});
});
