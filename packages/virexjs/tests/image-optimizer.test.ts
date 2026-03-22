import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { handleImageRequest } from "../src/server/image-optimizer";

const TEST_DIR = join(import.meta.dir, "__test_image_opt__");
const PUBLIC_DIR = join(TEST_DIR, "public");
const CACHE_DIR = join(TEST_DIR, "cache");

// Minimal 1x1 PNG (67 bytes)
const TINY_PNG = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
	"base64",
);

beforeEach(() => {
	mkdirSync(PUBLIC_DIR, { recursive: true });
	mkdirSync(CACHE_DIR, { recursive: true });
	writeFileSync(join(PUBLIC_DIR, "test.png"), TINY_PNG);
	writeFileSync(join(PUBLIC_DIR, "photo.jpg"), TINY_PNG);
	writeFileSync(join(PUBLIC_DIR, "logo.svg"), "<svg></svg>");
});

afterEach(() => {
	rmSync(TEST_DIR, { recursive: true, force: true });
});

const opts = { publicDir: PUBLIC_DIR, cacheDir: CACHE_DIR };

function makeReq(qs: string, headers?: Record<string, string>): Request {
	return new Request(`http://localhost/_virex/image?${qs}`, { headers });
}

describe("handleImageRequest", () => {
	test("returns 400 when url param is missing", async () => {
		const res = await handleImageRequest(makeReq("w=100"), opts);
		expect(res!.status).toBe(400);
		const body = await res!.json();
		expect(body.error).toContain("Missing url");
	});

	test("returns 400 for unsupported format", async () => {
		writeFileSync(join(PUBLIC_DIR, "file.txt"), "not an image");
		const res = await handleImageRequest(makeReq("url=/file.txt"), opts);
		expect(res!.status).toBe(400);
		const body = await res!.json();
		expect(body.error).toContain("Unsupported");
	});

	test("returns 404 for nonexistent image", async () => {
		const res = await handleImageRequest(makeReq("url=/missing.png"), opts);
		expect(res!.status).toBe(404);
	});

	test("blocks directory traversal", async () => {
		const res = await handleImageRequest(makeReq("url=/../../../etc/passwd"), opts);
		expect(res!.status).toBe(403);
	});

	test("blocks traversal with encoded dots", async () => {
		const res = await handleImageRequest(makeReq("url=/..%2F..%2Fetc/passwd"), opts);
		// Should be 403 or 404 (not found outside public dir)
		expect([403, 404]).toContain(res!.status);
	});

	test("serves SVG as-is without processing", async () => {
		const res = await handleImageRequest(makeReq("url=/logo.svg"), opts);
		expect(res!.status).toBe(200);
		expect(res!.headers.get("Content-Type")).toBe("image/svg+xml");
		const text = await res!.text();
		expect(text).toBe("<svg></svg>");
	});

	test("serves PNG with correct content type", async () => {
		const res = await handleImageRequest(makeReq("url=/test.png"), opts);
		expect(res!.status).toBe(200);
		const ct = res!.headers.get("Content-Type");
		// Either image/png (passthrough) or image/webp (if sharp converts)
		expect(ct).toMatch(/^image\/(png|webp|avif)$/);
	});

	test("sets immutable cache headers", async () => {
		const res = await handleImageRequest(makeReq("url=/test.png"), opts);
		expect(res!.status).toBe(200);
		const cc = res!.headers.get("Cache-Control");
		expect(cc).toContain("max-age=31536000");
		expect(cc).toContain("immutable");
	});

	test("serves from cache on second request", async () => {
		// First request — creates cache
		const res1 = await handleImageRequest(makeReq("url=/test.png"), opts);
		expect(res1!.status).toBe(200);

		// Second request — served from cache
		const res2 = await handleImageRequest(makeReq("url=/test.png"), opts);
		expect(res2!.status).toBe(200);
		expect(res2!.headers.get("X-VirexJS-Image")).toBe("CACHED");
	});

	test("quality param is clamped to 1-100", async () => {
		const res1 = await handleImageRequest(makeReq("url=/test.png&q=0"), opts);
		expect(res1!.status).toBe(200);

		const res2 = await handleImageRequest(makeReq("url=/test.png&q=200"), opts);
		expect(res2!.status).toBe(200);
	});

	test("width param produces different cache key", async () => {
		const res1 = await handleImageRequest(makeReq("url=/test.png&w=100"), opts);
		expect(res1!.status).toBe(200);

		// Different width = different result (not cached from first)
		const res2 = await handleImageRequest(makeReq("url=/test.png&w=200"), opts);
		expect(res2!.status).toBe(200);
		// Second request should NOT be "CACHED" since it's a different size
		expect(res2!.headers.get("X-VirexJS-Image")).not.toBe("CACHED");
	});

	test("handles subdirectory paths", async () => {
		mkdirSync(join(PUBLIC_DIR, "photos"), { recursive: true });
		writeFileSync(join(PUBLIC_DIR, "photos", "hero.jpg"), TINY_PNG);

		const res = await handleImageRequest(makeReq("url=/photos/hero.jpg"), opts);
		expect(res!.status).toBe(200);
	});
});
