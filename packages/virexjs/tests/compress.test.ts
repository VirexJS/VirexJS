import { describe, expect, test } from "bun:test";
import { gunzipSync } from "node:zlib";
import { compress } from "../src/server/compress";

function makeReq(acceptEncoding = "gzip, deflate, br"): Request {
	return new Request("http://localhost/api/data", {
		headers: { "Accept-Encoding": acceptEncoding },
	});
}

describe("compress", () => {
	test("compresses large JSON response", async () => {
		const data = { items: Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` })) };
		const body = JSON.stringify(data);
		const req = makeReq();
		const res = new Response(body, {
			headers: { "Content-Type": "application/json" },
		});

		const compressed = await compress(req, res);
		expect(compressed.headers.get("Content-Encoding")).toBe("gzip");
		expect(compressed.headers.get("Vary")).toBe("Accept-Encoding");

		// Verify decompression gives back original data
		const buf = await compressed.arrayBuffer();
		const decompressed = gunzipSync(Buffer.from(buf)).toString();
		expect(decompressed).toBe(body);
	});

	test("compresses HTML response", async () => {
		const html = "<html>".padEnd(2000, "<p>Content</p>");
		const req = makeReq();
		const res = new Response(html, {
			headers: { "Content-Type": "text/html; charset=utf-8" },
		});

		const compressed = await compress(req, res);
		expect(compressed.headers.get("Content-Encoding")).toBe("gzip");
	});

	test("skips when client doesn't support gzip", async () => {
		const body = "x".repeat(2000);
		const req = makeReq("deflate");
		const res = new Response(body, {
			headers: { "Content-Type": "text/plain" },
		});

		const result = await compress(req, res);
		expect(result.headers.get("Content-Encoding")).toBeNull();
	});

	test("skips small responses", async () => {
		const req = makeReq();
		const res = new Response("small", {
			headers: { "Content-Type": "text/plain" },
		});

		const result = await compress(req, res);
		expect(result.headers.get("Content-Encoding")).toBeNull();
	});

	test("skips non-text content types", async () => {
		const req = makeReq();
		const res = new Response(new Uint8Array(2000), {
			headers: { "Content-Type": "image/png" },
		});

		const result = await compress(req, res);
		expect(result.headers.get("Content-Encoding")).toBeNull();
	});

	test("skips non-200 responses", async () => {
		const body = "x".repeat(2000);
		const req = makeReq();
		const res = new Response(body, {
			status: 404,
			headers: { "Content-Type": "text/html" },
		});

		const result = await compress(req, res);
		expect(result.headers.get("Content-Encoding")).toBeNull();
	});

	test("compresses CSS response", async () => {
		const css = ".class { color: red; }".padEnd(2000, " .more { padding: 10px; }");
		const req = makeReq();
		const res = new Response(css, {
			headers: { "Content-Type": "text/css" },
		});

		const compressed = await compress(req, res);
		expect(compressed.headers.get("Content-Encoding")).toBe("gzip");
	});

	test("compresses SVG images", async () => {
		const svg = "<svg>".padEnd(2000, '<rect width="100" height="100"/>');
		const req = makeReq();
		const res = new Response(svg, {
			headers: { "Content-Type": "image/svg+xml" },
		});

		const compressed = await compress(req, res);
		expect(compressed.headers.get("Content-Encoding")).toBe("gzip");
	});
});
