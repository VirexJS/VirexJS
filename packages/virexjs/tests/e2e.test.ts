import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { resolve } from "node:path";

/**
 * End-to-end tests — starts the playground dev server and tests all endpoints.
 */

const PORT = 19200 + Math.floor(Math.random() * 100);
const BASE = `http://localhost:${PORT}`;
let serverProc: ReturnType<typeof Bun.spawn> | null = null;

beforeAll(async () => {
	const playgroundDir = resolve(import.meta.dir, "../../../playground");
	const cliPath = resolve(import.meta.dir, "../src/cli/index.ts");

	serverProc = Bun.spawn(["bun", "run", cliPath, "dev", "--port", String(PORT), "--no-hmr"], {
		cwd: playgroundDir,
		stdout: "ignore",
		stderr: "ignore",
	});

	// Wait for server to be ready
	const maxWait = 8000;
	const start = Date.now();
	while (Date.now() - start < maxWait) {
		try {
			const res = await fetch(`${BASE}/`);
			if (res.ok) return;
		} catch {
			// Server not ready yet
		}
		await new Promise((r) => setTimeout(r, 200));
	}
});

afterAll(() => {
	try {
		serverProc?.kill(9);
	} catch {
		// Already dead
	}
});

describe("E2E: dev server", () => {
	test("GET / returns HTML with correct structure", async () => {
		const res = await fetch(`${BASE}/`);
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toContain("text/html");

		const html = await res.text();
		expect(html).toContain("<!DOCTYPE html>");
		expect(html).toContain("<title>");
		expect(html).toContain("Welcome to VirexJS");
		expect(html).toContain("</html>");
	});

	test("GET / contains island markers", async () => {
		const res = await fetch(`${BASE}/`);
		const html = await res.text();
		expect(html).toContain("<!--vrx-island:Counter:");
		expect(html).toContain('data-vrx-island="Counter"');
		expect(html).toContain("<!--/vrx-island-->");
	});

	test("GET / renders full HTML document", async () => {
		const res = await fetch(`${BASE}/`);
		const html = await res.text();
		expect(html).toContain("<head>");
		expect(html).toContain("<body>");
		expect(html).toContain("</html>");
	});

	test("GET / has X-Response-Time header", async () => {
		const res = await fetch(`${BASE}/`);
		expect(res.headers.get("X-Response-Time")).toBeTruthy();
	});

	test("GET /about returns about page", async () => {
		const res = await fetch(`${BASE}/about`);
		expect(res.status).toBe(200);
		const html = await res.text();
		expect(html).toContain("About VirexJS");
		expect(html).toContain("<title>About");
	});

	test("GET /blog returns blog list", async () => {
		const res = await fetch(`${BASE}/blog`);
		expect(res.status).toBe(200);
		const html = await res.text();
		expect(html).toContain("Blog");
		expect(html).toContain("Hello World");
	});

	test("GET /blog/hello-world returns blog post with SEO", async () => {
		const res = await fetch(`${BASE}/blog/hello-world`);
		expect(res.status).toBe(200);
		const html = await res.text();
		expect(html).toContain("Hello World");
		// Meta tags present (may be in head or injected via script in async streaming)
		expect(html).toContain("og:title");
		expect(html).toContain("twitter:card");
	});

	test("GET /blog/nonexistent returns post not found", async () => {
		const res = await fetch(`${BASE}/blog/nonexistent`);
		expect(res.status).toBe(200);
		const html = await res.text();
		expect(html).toContain("Post Not Found");
	});

	test("GET /i18n-demo returns i18n page", async () => {
		const res = await fetch(`${BASE}/i18n-demo`);
		expect(res.status).toBe(200);
		const html = await res.text();
		expect(html).toContain("i18n Demo");
		expect(html).toContain("Detected locale:");
	});

	test("GET /nonexistent returns 404", async () => {
		const res = await fetch(`${BASE}/nonexistent`);
		expect(res.status).toBe(404);
	});

	test("GET /api/hello returns JSON", async () => {
		const res = await fetch(`${BASE}/api/hello`);
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toContain("application/json");

		const body = await res.json();
		expect(body.message).toBe("Hello from VirexJS!");
		expect(body.timestamp).toBeGreaterThan(0);
	});

	test("POST /api/hello returns 201 with echo", async () => {
		const res = await fetch(`${BASE}/api/hello`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ test: true }),
		});
		expect(res.status).toBe(201);
		const body = await res.json();
		expect(body.received).toBe(true);
		expect(body.echo).toEqual({ test: true });
	});

	test("GET /robots.txt returns static file", async () => {
		const res = await fetch(`${BASE}/robots.txt`);
		expect(res.status).toBe(200);
		const text = await res.text();
		expect(text).toContain("User-agent: *");
	});

	test("GET /robots.txt has ETag header", async () => {
		const res = await fetch(`${BASE}/robots.txt`);
		expect(res.headers.get("ETag")).toBeTruthy();
	});

	test("trailing slash redirects", async () => {
		const res = await fetch(`${BASE}/about/`, { redirect: "manual" });
		expect(res.status).toBe(301);
		expect(res.headers.get("Location")).toContain("/about");
	});

	test("gzip compression for HTML", async () => {
		const res = await fetch(`${BASE}/`, {
			headers: { "Accept-Encoding": "gzip" },
		});
		expect(res.status).toBe(200);
		// Bun auto-decompresses, so just verify it didn't break
		const html = await res.text();
		expect(html).toContain("<!DOCTYPE html>");
	});

	test("navigation links present", async () => {
		const res = await fetch(`${BASE}/`);
		const html = await res.text();
		expect(html).toContain('href="/"');
		expect(html).toContain('href="/about"');
		expect(html).toContain('href="/blog"');
		expect(html).toContain('href="/i18n-demo"');
	});
});
