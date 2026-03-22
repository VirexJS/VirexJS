import { describe, expect, test } from "bun:test";
import { renderPageAsync } from "../src/render/index";
import { h } from "../src/render/jsx";

/** Helper: consume a streaming Response into a string */
async function consumeResponse(res: Response): Promise<string> {
	return await res.text();
}

describe("renderPageAsync", () => {
	test("sends loading shell before data resolves", async () => {
		const html = await consumeResponse(
			renderPageAsync({
				component: (props) => h("div", {}, `Hello ${props.name}`),
				dataPromise: Promise.resolve({ name: "World" }),
				loadingFallback: "<p>Loading...</p>",
			}),
		);

		// Loading shell appears in output
		expect(html).toContain("vrx-shell");
		expect(html).toContain("Loading...");
		// Final content is also present
		expect(html).toContain("Hello World");
	});

	test("renders with loadingComponent instead of fallback", async () => {
		const html = await consumeResponse(
			renderPageAsync({
				component: (props) => h("p", {}, `Count: ${props.count}`),
				dataPromise: Promise.resolve({ count: 42 }),
				loadingComponent: () => h("div", { class: "spinner" }, "Spinning..."),
			}),
		);

		expect(html).toContain("Spinning...");
		expect(html).toContain("Count: 42");
	});

	test("wraps page in layout", async () => {
		const html = await consumeResponse(
			renderPageAsync({
				component: () => h("main", {}, "Page"),
				layout: (props) => h("div", { class: "layout" }, props.children),
				dataPromise: Promise.resolve({}),
			}),
		);

		expect(html).toContain('class="layout"');
		expect(html).toContain("Page");
	});

	test("includes meta tags in head", async () => {
		const html = await consumeResponse(
			renderPageAsync({
				component: () => h("p", {}, "Content"),
				dataPromise: Promise.resolve({}),
				meta: { title: "Async Page", description: "Test async" },
			}),
		);

		expect(html).toContain("<title>Async Page</title>");
		expect(html).toContain('content="Test async"');
	});

	test("includes CSS links", async () => {
		const html = await consumeResponse(
			renderPageAsync({
				component: () => h("p", {}, "Styled"),
				dataPromise: Promise.resolve({}),
				cssLinks: ["/style.css", "/app.css"],
			}),
		);

		expect(html).toContain('href="/style.css"');
		expect(html).toContain('href="/app.css"');
	});

	test("includes dev script", async () => {
		const html = await consumeResponse(
			renderPageAsync({
				component: () => h("p", {}, "Dev"),
				dataPromise: Promise.resolve({}),
				devScript: "console.log('hmr')",
			}),
		);

		expect(html).toContain("console.log('hmr')");
	});

	test("swap script removes shell and shows content", async () => {
		const html = await consumeResponse(
			renderPageAsync({
				component: () => h("p", {}, "Loaded"),
				dataPromise: Promise.resolve({}),
			}),
		);

		// Content is rendered inside hidden div
		expect(html).toContain('id="vrx-async-content"');
		// Swap script present
		expect(html).toContain("vrx-shell");
		expect(html).toContain(".remove()");
		expect(html).toContain('.style.display=""');
	});

	test("handles rejected promise with error message (dev)", async () => {
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = "development";
		try {
			const html = await consumeResponse(
				renderPageAsync({
					component: () => h("p", {}, "Never rendered"),
					dataPromise: Promise.reject(new Error("DB connection failed")),
				}),
			);

			// Error message shown (dev mode shows actual error)
			expect(html).toContain("DB connection failed");
			// Uses safe DOM APIs, not innerHTML
			expect(html).toContain("textContent");
			expect(html).toContain("createElement");
			expect(html).not.toContain("innerHTML");
		} finally {
			process.env.NODE_ENV = originalEnv;
		}
	});

	test("handles rejected promise with generic message (production)", async () => {
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = "production";
		try {
			const html = await consumeResponse(
				renderPageAsync({
					component: () => h("p", {}, "Never rendered"),
					dataPromise: Promise.reject(new Error("Secret DB error")),
				}),
			);

			// Production hides the actual error
			expect(html).toContain("An error occurred");
			expect(html).not.toContain("Secret DB error");
		} finally {
			process.env.NODE_ENV = originalEnv;
		}
	});

	test("returns proper content-type header", () => {
		const response = renderPageAsync({
			component: () => h("p", {}, "Test"),
			dataPromise: Promise.resolve({}),
		});

		expect(response.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
	});

	test("streams valid HTML document structure", async () => {
		const html = await consumeResponse(
			renderPageAsync({
				component: () => h("p", {}, "Content"),
				dataPromise: Promise.resolve({}),
			}),
		);

		expect(html).toContain("<!DOCTYPE html>");
		expect(html).toContain("<html lang=");
		expect(html).toContain("<head>");
		expect(html).toContain("</head>");
		expect(html).toContain("<body>");
		expect(html).toContain("</body>");
		expect(html).toContain("</html>");
	});
});
