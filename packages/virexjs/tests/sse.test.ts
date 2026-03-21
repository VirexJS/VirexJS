import { describe, test, expect } from "bun:test";
import { createSSEStream } from "../src/server/sse";

describe("createSSEStream", () => {
	test("returns response with correct headers", () => {
		const { response } = createSSEStream();
		expect(response.headers.get("Content-Type")).toBe("text/event-stream");
		expect(response.headers.get("Cache-Control")).toContain("no-cache");
		expect(response.headers.get("Connection")).toBe("keep-alive");
	});

	test("sends data-only events", async () => {
		const { response, send, close } = createSSEStream();

		send("hello world");
		close();

		const text = await response.text();
		expect(text).toContain("data: hello world\n");
	});

	test("sends named events", async () => {
		const { response, send, close } = createSSEStream();

		send("user-joined", "Alice");
		close();

		const text = await response.text();
		expect(text).toContain("event: user-joined\n");
		expect(text).toContain("data: Alice\n");
	});

	test("sends JSON data", async () => {
		const { response, send, close } = createSSEStream();

		send({ type: "update", count: 42 });
		close();

		const text = await response.text();
		expect(text).toContain('data: {"type":"update","count":42}');
	});

	test("sends comments for keep-alive", async () => {
		const { response, comment, close } = createSSEStream();

		comment("ping");
		close();

		const text = await response.text();
		expect(text).toContain(": ping\n");
	});

	test("includes retry directive", async () => {
		const { response, close } = createSSEStream(undefined, { retry: 5000 });
		close();

		const text = await response.text();
		expect(text).toContain("retry: 5000\n");
	});

	test("custom headers", () => {
		const { response } = createSSEStream(undefined, {
			headers: { "X-Custom": "test" },
		});
		expect(response.headers.get("X-Custom")).toBe("test");
	});

	test("open starts as true, false after close", () => {
		const sse = createSSEStream();
		expect(sse.open).toBe(true);
		sse.close();
		expect(sse.open).toBe(false);
	});

	test("send after close is no-op", async () => {
		const { response, send, close } = createSSEStream();
		send("before");
		close();
		send("after"); // should not throw

		const text = await response.text();
		expect(text).toContain("before");
		expect(text).not.toContain("after");
	});

	test("handles multi-line data", async () => {
		const { response, send, close } = createSSEStream();

		send("line1\nline2\nline3");
		close();

		const text = await response.text();
		expect(text).toContain("data: line1\n");
		expect(text).toContain("data: line2\n");
		expect(text).toContain("data: line3\n");
	});

	test("named event with JSON data", async () => {
		const { response, send, close } = createSSEStream();

		send("notification", { message: "New message", unread: 5 });
		close();

		const text = await response.text();
		expect(text).toContain("event: notification\n");
		expect(text).toContain('"message":"New message"');
	});
});
