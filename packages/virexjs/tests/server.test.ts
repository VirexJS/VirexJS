import { describe, test, expect, afterAll } from "bun:test";
import { resolve } from "node:path";
import { createServer } from "../src/server/index";
import { DEFAULT_CONFIG } from "../src/config/defaults";
import type { VirexConfig } from "../src/config/types";

const playgroundDir = resolve(import.meta.dir, "../../../playground");

// Use a different port to avoid conflicts
const testConfig: VirexConfig = {
	...DEFAULT_CONFIG,
	port: 4567,
	hostname: "localhost",
	srcDir: "src",
	outDir: "dist",
	publicDir: "public",
	dev: { ...DEFAULT_CONFIG.dev, hmr: false },
};

// Start server in playground directory
const originalCwd = process.cwd();
process.chdir(playgroundDir);
const { server, stop, routeCount } = createServer(testConfig);
process.chdir(originalCwd);

const BASE = `http://localhost:${testConfig.port}`;

afterAll(() => {
	stop();
});

describe("HTTP Server", () => {
	test("finds playground routes", () => {
		expect(routeCount).toBeGreaterThanOrEqual(4);
	});

	test("GET / returns 200 with HTML", async () => {
		const res = await fetch(`${BASE}/`);
		expect(res.status).toBe(200);
		expect(res.headers.get("content-type")).toContain("text/html");

		const html = await res.text();
		expect(html).toContain("Welcome to VirexJS");
		expect(html).toContain("<!DOCTYPE html>");
	});

	test("GET /about returns 200", async () => {
		const res = await fetch(`${BASE}/about`);
		expect(res.status).toBe(200);

		const html = await res.text();
		expect(html).toContain("About VirexJS");
	});

	test("GET /blog/hello-world returns dynamic page", async () => {
		const res = await fetch(`${BASE}/blog/hello-world`);
		expect(res.status).toBe(200);

		const html = await res.text();
		expect(html).toContain("Hello World");
	});

	test("GET /blog/nonexistent returns loader default data", async () => {
		const res = await fetch(`${BASE}/blog/nonexistent`);
		expect(res.status).toBe(200);

		const html = await res.text();
		expect(html).toContain("Post Not Found");
	});

	test("GET /api/hello returns JSON", async () => {
		const res = await fetch(`${BASE}/api/hello`);
		expect(res.status).toBe(200);
		expect(res.headers.get("content-type")).toContain("application/json");

		const json = await res.json();
		expect(json.message).toBe("Hello from VirexJS!");
		expect(json.timestamp).toBeGreaterThan(0);
	});

	test("POST /api/hello returns 201", async () => {
		const res = await fetch(`${BASE}/api/hello`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ test: true }),
		});
		expect(res.status).toBe(201);

		const json = await res.json();
		expect(json.received).toBe(true);
		expect(json.echo).toEqual({ test: true });
	});

	test("PUT /api/hello returns 405 (not defined)", async () => {
		const res = await fetch(`${BASE}/api/hello`, { method: "PUT" });
		expect(res.status).toBe(405);
	});

	test("GET /nonexistent returns 404", async () => {
		const res = await fetch(`${BASE}/nonexistent`);
		expect(res.status).toBe(404);
	});

	test("GET /robots.txt returns static file", async () => {
		const res = await fetch(`${BASE}/robots.txt`);
		expect(res.status).toBe(200);

		const text = await res.text();
		expect(text).toContain("User-agent: *");
	});

	test("Homepage contains island markers", async () => {
		const res = await fetch(`${BASE}/`);
		const html = await res.text();
		expect(html).toContain("<!--vrx-island:Counter:");
		expect(html).toContain('data-vrx-island="Counter"');
		expect(html).toContain("<!--/vrx-island-->");
	});

	test("Homepage contains meta tags", async () => {
		const res = await fetch(`${BASE}/`);
		const html = await res.text();
		expect(html).toContain("<title>VirexJS");
		expect(html).toContain('name="description"');
	});

	test("About page has correct meta", async () => {
		const res = await fetch(`${BASE}/about`);
		const html = await res.text();
		expect(html).toContain("<title>About");
	});

	test("Blog list page renders all posts", async () => {
		const res = await fetch(`${BASE}/blog`);
		expect(res.status).toBe(200);

		const html = await res.text();
		expect(html).toContain("Hello World");
		expect(html).toContain("Getting Started");
		expect(html).toContain("Islands Architecture");
	});

	test("Directory traversal is blocked", async () => {
		const res = await fetch(`${BASE}/../../../etc/passwd`);
		expect(res.status).toBe(404);
	});
});
