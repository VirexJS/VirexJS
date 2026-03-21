import { describe, expect, test } from "bun:test";
import { h, renderToString } from "../src/render/jsx";
import { Link } from "../src/render/link";

describe("Link component", () => {
	test("renders basic anchor tag", () => {
		const html = renderToString(h(Link, { href: "/about" }, "About"));
		expect(html).toContain('href="/about"');
		expect(html).toContain("About");
		expect(html).toContain("<a");
	});

	test("renders with className", () => {
		const html = renderToString(h(Link, { href: "/", className: "nav-link" }, "Home"));
		expect(html).toContain('class="nav-link"');
	});

	test("renders with target and adds rel for _blank", () => {
		const html = renderToString(
			h(Link, { href: "https://example.com", target: "_blank" }, "External"),
		);
		expect(html).toContain('target="_blank"');
		expect(html).toContain('rel="noopener noreferrer"');
	});

	test("prefetch adds link prefetch hint", () => {
		const html = renderToString(h(Link, { href: "/blog", prefetch: true }, "Blog"));
		expect(html).toContain('rel="prefetch"');
		expect(html).toContain('as="document"');
		expect(html).toContain("<a");
	});

	test("prefetch not added for external URLs", () => {
		const html = renderToString(h(Link, { href: "https://example.com", prefetch: true }, "Ext"));
		expect(html).not.toContain('rel="prefetch"');
	});

	test("renders with style", () => {
		const html = renderToString(h(Link, { href: "/", style: { color: "red" } }, "Styled"));
		expect(html).toContain("color:red");
	});

	test("renders with title", () => {
		const html = renderToString(h(Link, { href: "/", title: "Go home" }, "Home"));
		expect(html).toContain('title="Go home"');
	});
});
