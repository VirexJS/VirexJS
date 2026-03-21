import { describe, expect, test } from "bun:test";
import { ErrorBoundary } from "../src/render/error-boundary";
import type { VNode } from "../src/render/jsx";
import { h, renderToString } from "../src/render/jsx";

// ─── Basic behavior ─────────────────────────────────────────────────────────

describe("ErrorBoundary", () => {
	test("renders children when no error", () => {
		const html = renderToString(
			h(ErrorBoundary, {
				fallback: () => h("p", null, "error"),
				children: h("div", null, "safe content"),
			}),
		);
		expect(html).toBe("<div>safe content</div>");
	});

	test("renders fallback when children throw", () => {
		function Boom(): VNode {
			throw new Error("render failed");
		}

		const html = renderToString(
			h(ErrorBoundary, {
				fallback: (err: Error) => h("p", { className: "error" }, `Error: ${err.message}`),
				children: h(Boom, null),
			}),
		);
		expect(html).toBe('<p class="error">Error: render failed</p>');
	});

	test("fallback receives the Error object", () => {
		function Throws(): VNode {
			throw new Error("specific message");
		}

		let receivedError: Error | null = null;

		renderToString(
			h(ErrorBoundary, {
				fallback: (err: Error) => {
					receivedError = err;
					return h("span", null, "fallback");
				},
				children: h(Throws, null),
			}),
		);

		expect(receivedError).not.toBeNull();
		expect(receivedError!.message).toBe("specific message");
	});

	test("handles non-Error throws", () => {
		function ThrowsString(): VNode {
			throw "string error";
		}

		const html = renderToString(
			h(ErrorBoundary, {
				fallback: (err: Error) => h("p", null, err.message),
				children: h(ThrowsString, null),
			}),
		);
		expect(html).toBe("<p>string error</p>");
	});
});

// ─── onError callback ───────────────────────────────────────────────────────

describe("onError callback", () => {
	test("calls onError when error occurs", () => {
		let loggedError: Error | null = null;

		function Boom(): VNode {
			throw new Error("logged error");
		}

		renderToString(
			h(ErrorBoundary, {
				fallback: () => h("p", null, "fallback"),
				onError: (err: Error) => {
					loggedError = err;
				},
				children: h(Boom, null),
			}),
		);

		expect(loggedError).not.toBeNull();
		expect((loggedError as unknown as Error).message).toBe("logged error");
	});

	test("does not call onError when no error", () => {
		let called = false;

		renderToString(
			h(ErrorBoundary, {
				fallback: () => h("p", null, "fallback"),
				onError: () => {
					called = true;
				},
				children: h("div", null, "safe"),
			}),
		);

		expect(called).toBe(false);
	});

	test("error in onError does not crash rendering", () => {
		function Boom(): VNode {
			throw new Error("boom");
		}

		const html = renderToString(
			h(ErrorBoundary, {
				fallback: () => h("p", null, "recovered"),
				onError: () => {
					throw new Error("onError also failed");
				},
				children: h(Boom, null),
			}),
		);

		expect(html).toBe("<p>recovered</p>");
	});
});

// ─── Nested boundaries ─────────────────────────────────────────────────────

describe("nested boundaries", () => {
	test("inner boundary catches inner errors", () => {
		function Boom(): VNode {
			throw new Error("inner error");
		}

		const html = renderToString(
			h(ErrorBoundary, {
				fallback: () => h("p", null, "outer fallback"),
				children: h(
					"div",
					null,
					h("p", null, "before"),
					h(ErrorBoundary, {
						fallback: (err: Error) => h("span", null, `inner: ${err.message}`),
						children: h(Boom, null),
					}),
					h("p", null, "after"),
				),
			}),
		);

		expect(html).toContain("before");
		expect(html).toContain("inner: inner error");
		expect(html).toContain("after");
		expect(html).not.toContain("outer fallback");
	});

	test("outer boundary catches when inner is not present", () => {
		function Boom(): VNode {
			throw new Error("uncaught");
		}

		const html = renderToString(
			h(ErrorBoundary, {
				fallback: (err: Error) => h("p", null, `caught: ${err.message}`),
				children: h("div", null, h("p", null, "safe"), h(Boom, null)),
			}),
		);

		expect(html).toBe("<p>caught: uncaught</p>");
	});
});

// ─── Complex children ───────────────────────────────────────────────────────

describe("complex children", () => {
	test("works with function components that don't throw", () => {
		function Card(props: Record<string, unknown>) {
			return h("div", { className: "card" }, h("h2", null, props.title as string));
		}

		const html = renderToString(
			h(ErrorBoundary, {
				fallback: () => h("p", null, "error"),
				children: h(Card, { title: "Hello" }),
			}),
		);
		expect(html).toBe('<div class="card"><h2>Hello</h2></div>');
	});

	test("works with multiple children", () => {
		const html = renderToString(
			h(ErrorBoundary, {
				fallback: () => h("p", null, "error"),
				children: [h("h1", null, "Title"), h("p", null, "Body")],
			}),
		);
		expect(html).toBe("<h1>Title</h1><p>Body</p>");
	});

	test("works with null/undefined children", () => {
		const html = renderToString(
			h(ErrorBoundary, {
				fallback: () => h("p", null, "error"),
				children: null,
			}),
		);
		expect(html).toBe("");
	});
});
