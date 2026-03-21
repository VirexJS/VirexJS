import { afterAll, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateAPIDocs, renderAPIDocsHTML } from "../src/server/api-docs";

const testDir = join(tmpdir(), `virex-api-docs-test-${Date.now()}`);

afterAll(() => {
	rmSync(testDir, { recursive: true, force: true });
});

describe("generateAPIDocs", () => {
	test("scans API directory", () => {
		mkdirSync(testDir, { recursive: true });
		writeFileSync(join(testDir, "hello.ts"), "export const GET = () => {};");
		writeFileSync(
			join(testDir, "users.ts"),
			"export const GET = () => {};\nexport const POST = () => {};",
		);

		const docs = generateAPIDocs(testDir);
		expect(docs.endpoints.length).toBe(2);
		expect(docs.endpoints[0]!.methods).toContain("GET");
	});

	test("detects multiple methods", () => {
		const dir = join(testDir, "multi");
		mkdirSync(dir, { recursive: true });
		writeFileSync(
			join(dir, "items.ts"),
			"export const GET = () => {};\nexport const POST = () => {};\nexport const DELETE = () => {};",
		);

		const docs = generateAPIDocs(dir);
		expect(docs.endpoints[0]!.methods).toEqual(["GET", "POST", "DELETE"]);
	});

	test("returns empty for missing directory", () => {
		const docs = generateAPIDocs("/nonexistent");
		expect(docs.endpoints).toEqual([]);
	});

	test("custom options", () => {
		const docs = generateAPIDocs(testDir, {
			title: "My API",
			version: "2.0",
			baseUrl: "/v2",
		});
		expect(docs.title).toBe("My API");
		expect(docs.version).toBe("2.0");
		expect(docs.baseUrl).toBe("/v2");
	});
});

describe("renderAPIDocsHTML", () => {
	test("generates valid HTML", () => {
		const docs = generateAPIDocs(testDir);
		const html = renderAPIDocsHTML(docs);
		expect(html).toContain("<!DOCTYPE html>");
		expect(html).toContain("<table");
		expect(html).toContain("GET");
	});

	test("includes endpoint count", () => {
		const docs = generateAPIDocs(testDir);
		const html = renderAPIDocsHTML(docs);
		expect(html).toContain(`${docs.endpoints.length} endpoints`);
	});
});
