import { describe, expect, test } from "bun:test";
import { parseUpload } from "../src/server/upload";

function createMultipartRequest(
	files: { name: string; content: string; type: string }[],
	fields?: Record<string, string>,
): Request {
	const form = new FormData();
	for (const file of files) {
		form.append("file", new File([file.content], file.name, { type: file.type }));
	}
	if (fields) {
		for (const [key, value] of Object.entries(fields)) {
			form.append(key, value);
		}
	}
	return new Request("http://localhost/upload", { method: "POST", body: form });
}

describe("parseUpload", () => {
	test("parses single file", async () => {
		const req = createMultipartRequest([
			{ name: "test.txt", content: "hello world", type: "text/plain" },
		]);
		const result = await parseUpload(req);
		expect(result.error).toBeUndefined();
		expect(result.files).toHaveLength(1);
		expect(result.files[0]!.name).toBe("test.txt");
		expect(result.files[0]!.type).toContain("text/plain");
		expect(result.files[0]!.size).toBe(11);
	});

	test("parses fields alongside files", async () => {
		const req = createMultipartRequest(
			[{ name: "photo.jpg", content: "binary", type: "image/jpeg" }],
			{ title: "My Photo", description: "A test" },
		);
		const result = await parseUpload(req);
		expect(result.fields.title).toBe("My Photo");
		expect(result.files).toHaveLength(1);
	});

	test("rejects non-multipart request", async () => {
		const req = new Request("http://localhost/upload", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "{}",
		});
		const result = await parseUpload(req);
		expect(result.error).toContain("multipart/form-data");
	});

	test("rejects oversized file", async () => {
		const req = createMultipartRequest([
			{ name: "big.txt", content: "x".repeat(1000), type: "text/plain" },
		]);
		const result = await parseUpload(req, { maxFileSize: 100 });
		expect(result.error).toContain("exceeds max size");
	});

	test("rejects too many files", async () => {
		const req = createMultipartRequest([
			{ name: "a.txt", content: "a", type: "text/plain" },
			{ name: "b.txt", content: "b", type: "text/plain" },
			{ name: "c.txt", content: "c", type: "text/plain" },
		]);
		const result = await parseUpload(req, { maxFiles: 2 });
		expect(result.error).toContain("Maximum 2 files");
	});

	test("rejects disallowed file type", async () => {
		const req = createMultipartRequest([
			{ name: "script.js", content: "alert(1)", type: "application/javascript" },
		]);
		const result = await parseUpload(req, { allowedTypes: ["image/jpeg", "image/png"] });
		expect(result.error).toContain("not allowed");
	});

	test("file data is Uint8Array", async () => {
		const req = createMultipartRequest([
			{ name: "data.bin", content: "bytes", type: "application/octet-stream" },
		]);
		const result = await parseUpload(req);
		expect(result.files[0]!.data).toBeInstanceOf(Uint8Array);
	});
});
