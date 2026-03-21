import { describe, expect, test } from "bun:test";
// Create inline test API modules via temp files
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { handleAPIRequest } from "../src/server/handler";

const testDir = join(tmpdir(), `virex-handler-test-${Date.now()}`);

beforeAll(() => {
	mkdirSync(testDir, { recursive: true });

	// API route with GET and POST
	writeFileSync(
		join(testDir, "hello.ts"),
		`
		export const GET = ({ params }) => Response.json({ hello: "world" });
		export const POST = async ({ request }) => {
			const body = await request.json();
			return Response.json({ received: body }, { status: 201 });
		};
	`,
	);

	// API route that throws
	writeFileSync(
		join(testDir, "error.ts"),
		`
		export const GET = () => { throw new Error("handler error"); };
	`,
	);

	// API with only GET
	writeFileSync(
		join(testDir, "get-only.ts"),
		`
		export const GET = () => Response.json({ only: "get" });
	`,
	);
});

afterAll(() => {
	rmSync(testDir, { recursive: true, force: true });
});

import { afterAll, beforeAll } from "bun:test";

describe("handleAPIRequest", () => {
	test("handles GET request", async () => {
		const res = await handleAPIRequest(
			join(testDir, "hello.ts"),
			new Request("http://localhost/api/hello"),
		);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.hello).toBe("world");
	});

	test("handles POST request with body", async () => {
		const res = await handleAPIRequest(
			join(testDir, "hello.ts"),
			new Request("http://localhost/api/hello", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "test" }),
			}),
		);
		expect(res.status).toBe(201);
		const body = await res.json();
		expect(body.received).toEqual({ name: "test" });
	});

	test("returns 405 for unsupported method", async () => {
		const res = await handleAPIRequest(
			join(testDir, "get-only.ts"),
			new Request("http://localhost/api/get-only", { method: "DELETE" }),
		);
		expect(res.status).toBe(405);
		const body = await res.json();
		expect(body.error).toContain("not allowed");
	});

	test("returns 500 on handler error", async () => {
		const res = await handleAPIRequest(
			join(testDir, "error.ts"),
			new Request("http://localhost/api/error"),
		);
		expect(res.status).toBe(500);
		const body = await res.json();
		expect(body.error).toContain("handler error");
	});

	test("returns 500 for non-existent file", async () => {
		const res = await handleAPIRequest(
			join(testDir, "nonexistent.ts"),
			new Request("http://localhost/api/nonexistent"),
		);
		expect(res.status).toBe(500);
	});

	test("passes params to handler", async () => {
		writeFileSync(
			join(testDir, "with-params.ts"),
			`
			export const GET = ({ params }) => Response.json({ id: params.id });
		`,
		);

		const res = await handleAPIRequest(
			join(testDir, "with-params.ts"),
			new Request("http://localhost/api/users/42"),
			{ id: "42" },
		);
		const body = await res.json();
		expect(body.id).toBe("42");
	});
});
