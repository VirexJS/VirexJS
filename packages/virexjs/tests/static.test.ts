import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { serveBuiltAsset, serveStatic } from "../src/server/static";

const TEST_DIR = join(import.meta.dir, "__test_public__");

beforeEach(() => {
	mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
	rmSync(TEST_DIR, { recursive: true, force: true });
});

function createFile(name: string, content = "test"): void {
	const fullPath = join(TEST_DIR, name);
	const dir = fullPath.substring(
		0,
		fullPath.lastIndexOf("/") >= 0 ? fullPath.lastIndexOf("/") : fullPath.lastIndexOf("\\"),
	);
	mkdirSync(dir, { recursive: true });
	writeFileSync(fullPath, content);
}

describe("serveStatic", () => {
	test("serves existing file", async () => {
		createFile("hello.txt", "hello world");
		const res = await serveStatic("/hello.txt", TEST_DIR);
		expect(res).not.toBeNull();
		expect(res?.status).toBe(200);
		expect(await res?.text()).toBe("hello world");
	});

	test("returns null for missing file", async () => {
		const res = await serveStatic("/missing.txt", TEST_DIR);
		expect(res).toBeNull();
	});

	test("blocks directory traversal", async () => {
		const res = await serveStatic("/../../../etc/passwd", TEST_DIR);
		expect(res).toBeNull();
	});

	test("sets correct Content-Type for .html", async () => {
		createFile("index.html", "<h1>hi</h1>");
		const res = await serveStatic("/index.html", TEST_DIR);
		expect(res?.headers.get("Content-Type")).toBe("text/html");
	});

	test("sets correct Content-Type for .css", async () => {
		createFile("style.css", "body{}");
		const res = await serveStatic("/style.css", TEST_DIR);
		expect(res?.headers.get("Content-Type")).toBe("text/css");
	});

	test("sets correct Content-Type for .js", async () => {
		createFile("app.js", "console.log(1)");
		const res = await serveStatic("/app.js", TEST_DIR);
		expect(res?.headers.get("Content-Type")).toBe("application/javascript");
	});

	test("sets correct Content-Type for .json", async () => {
		createFile("data.json", "{}");
		const res = await serveStatic("/data.json", TEST_DIR);
		expect(res?.headers.get("Content-Type")).toBe("application/json");
	});

	test("sets correct Content-Type for .svg", async () => {
		createFile("icon.svg", "<svg></svg>");
		const res = await serveStatic("/icon.svg", TEST_DIR);
		expect(res?.headers.get("Content-Type")).toBe("image/svg+xml");
	});

	test("sets correct Content-Type for .png", async () => {
		createFile("img.png", "PNG");
		const res = await serveStatic("/img.png", TEST_DIR);
		expect(res?.headers.get("Content-Type")).toBe("image/png");
	});

	test("unknown extension gets octet-stream", async () => {
		createFile("data.xyz", "binary");
		const res = await serveStatic("/data.xyz", TEST_DIR);
		expect(res?.headers.get("Content-Type")).toBe("application/octet-stream");
	});

	test("includes ETag header", async () => {
		createFile("cached.txt", "content");
		const res = await serveStatic("/cached.txt", TEST_DIR);
		expect(res?.headers.get("ETag")).toBeTruthy();
	});

	test("includes Cache-Control header", async () => {
		createFile("cached.txt", "content");
		const res = await serveStatic("/cached.txt", TEST_DIR);
		expect(res?.headers.get("Cache-Control")).toContain("public");
	});

	test("returns 304 for matching If-None-Match", async () => {
		createFile("etag.txt", "same content");
		const first = await serveStatic("/etag.txt", TEST_DIR);
		const etag = first!.headers.get("ETag")!;

		const req = new Request("http://localhost/etag.txt", {
			headers: { "If-None-Match": etag },
		});
		const second = await serveStatic("/etag.txt", TEST_DIR, req);
		expect(second?.status).toBe(304);
	});

	test("returns 200 for non-matching If-None-Match", async () => {
		createFile("etag2.txt", "content");
		const req = new Request("http://localhost/etag2.txt", {
			headers: { "If-None-Match": '"wrong-etag"' },
		});
		const res = await serveStatic("/etag2.txt", TEST_DIR, req);
		expect(res?.status).toBe(200);
	});

	test("serves nested files", async () => {
		createFile("sub/dir/file.txt", "nested");
		const res = await serveStatic("/sub/dir/file.txt", TEST_DIR);
		expect(res).not.toBeNull();
		expect(await res?.text()).toBe("nested");
	});
});

describe("serveBuiltAsset", () => {
	test("sets immutable cache headers", async () => {
		createFile("bundle.js", "var x=1;");
		const res = await serveBuiltAsset("/bundle.js", TEST_DIR);
		expect(res).not.toBeNull();
		expect(res?.headers.get("Cache-Control")).toContain("immutable");
		expect(res?.headers.get("Cache-Control")).toContain("max-age=31536000");
	});

	test("returns null for missing file", async () => {
		const res = await serveBuiltAsset("/missing.js", TEST_DIR);
		expect(res).toBeNull();
	});
});
