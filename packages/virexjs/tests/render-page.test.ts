import { describe, expect, test } from "bun:test";
import { buildDocument, renderPage } from "../src/render/index";
import { h } from "../src/render/jsx";

describe("renderPage", () => {
	test("returns a streaming Response", () => {
		const res = renderPage({
			component: () => h("p", {}, "Hello"),
		});
		expect(res).toBeInstanceOf(Response);
		expect(res.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
	});

	test("streams valid HTML document", async () => {
		const res = renderPage({
			component: () => h("h1", {}, "Title"),
		});
		const html = await res.text();
		expect(html).toContain("<!DOCTYPE html>");
		expect(html).toContain("<html");
		expect(html).toContain("<head>");
		expect(html).toContain("<body>");
		expect(html).toContain("Title");
		expect(html).toContain("</html>");
	});

	test("renders with layout wrapper", async () => {
		const html = await renderPage({
			component: () => h("main", {}, "Content"),
			layout: (props) => h("div", { class: "layout" }, props.children),
		}).text();
		expect(html).toContain('class="layout"');
		expect(html).toContain("Content");
	});

	test("passes data to component", async () => {
		const html = await renderPage({
			component: (props) => h("p", {}, `Name: ${(props as Record<string, unknown>).name}`),
			data: { name: "Alice" },
		}).text();
		expect(html).toContain("Name: Alice");
	});

	test("includes meta tags", async () => {
		const html = await renderPage({
			component: () => h("p", {}, "Page"),
			meta: { title: "Test Page", description: "A test" },
		}).text();
		expect(html).toContain("<title>Test Page</title>");
		expect(html).toContain("A test");
	});

	test("includes CSS links", async () => {
		const html = await renderPage({
			component: () => h("p", {}, "Styled"),
			cssLinks: ["/app.css", "/theme.css"],
		}).text();
		expect(html).toContain('href="/app.css"');
		expect(html).toContain('href="/theme.css"');
	});

	test("includes dev script", async () => {
		const html = await renderPage({
			component: () => h("p", {}, "Dev"),
			devScript: "console.log('dev')",
		}).text();
		expect(html).toContain("console.log('dev')");
	});

	test("renders loading component when provided", async () => {
		const html = await renderPage({
			component: () => h("p", {}, "Main"),
			loadingComponent: () => h("div", { class: "loader" }, "Loading..."),
		}).text();
		expect(html).toContain("vrx-loading");
		expect(html).toContain("Loading...");
		expect(html).toContain("Main");
	});

	test("streams body in chunks for large content", async () => {
		const longContent = "x".repeat(20000);
		const html = await renderPage({
			component: () => h("p", {}, longContent),
		}).text();
		expect(html).toContain(longContent);
	});
});

describe("buildDocument", () => {
	test("returns complete HTML string", () => {
		const html = buildDocument({
			head: "<title>Test</title>",
			body: "<p>Hello</p>",
		});
		expect(html).toContain("<!DOCTYPE html>");
		expect(html).toContain("<title>Test</title>");
		expect(html).toContain("<p>Hello</p>");
		expect(html).toContain('lang="en"');
	});

	test("supports custom lang", () => {
		const html = buildDocument({
			lang: "tr",
			head: "",
			body: "",
		});
		expect(html).toContain('lang="tr"');
	});

	test("includes CSS links", () => {
		const html = buildDocument({
			head: "",
			body: "",
			cssLinks: ["/a.css", "/b.css"],
		});
		expect(html).toContain('href="/a.css"');
		expect(html).toContain('href="/b.css"');
	});

	test("includes dev script", () => {
		const html = buildDocument({
			head: "",
			body: "",
			devScript: "alert(1)",
		});
		expect(html).toContain("<script>alert(1)</script>");
	});

	test("includes charset and viewport meta", () => {
		const html = buildDocument({ head: "", body: "" });
		expect(html).toContain('charset="utf-8"');
		expect(html).toContain("viewport");
	});
});
