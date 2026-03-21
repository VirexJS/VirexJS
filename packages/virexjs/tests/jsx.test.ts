import { describe, expect, test } from "bun:test";
import type { VElement } from "../src/render/jsx";
import { clearIslands, Fragment, h, registerIsland, renderToString } from "../src/render/jsx";

describe("h() — JSX factory", () => {
	test("creates VElement for string type", () => {
		const node = h("div", null);
		expect(node).toEqual({ type: "div", props: {} });
	});

	test("creates VElement with props", () => {
		const node = h("a", { href: "/about" });
		expect(node).toEqual({ type: "a", props: { href: "/about" } });
	});

	test("creates VElement with children", () => {
		const node = h("p", null, "hello");
		expect(node).toEqual({ type: "p", props: { children: ["hello"] } });
	});

	test("Fragment returns children array", () => {
		const node = h(Fragment, null, "a", "b");
		expect(node).toEqual(["a", "b"]);
	});

	test("function component is deferred to renderToString", () => {
		function Greeting(props: Record<string, unknown>) {
			return h("span", null, `Hello ${props.name}`);
		}
		const node = h(Greeting, { name: "World" }) as VElement;
		// h() returns a VElement with function type (deferred)
		expect(node.type).toBe(Greeting);
		expect(node.props).toEqual({ name: "World", children: [] });
		// Actually renders when passed to renderToString
		expect(renderToString(node)).toBe("<span>Hello World</span>");
	});
});

describe("renderToString()", () => {
	test("renders simple div", () => {
		expect(renderToString(h("div", null))).toBe("<div></div>");
	});

	test("renders text content", () => {
		expect(renderToString(h("p", null, "hello"))).toBe("<p>hello</p>");
	});

	test("renders nested elements", () => {
		const node = h("div", null, h("span", null, "inner"));
		expect(renderToString(node)).toBe("<div><span>inner</span></div>");
	});

	test("renders null/undefined/boolean as empty", () => {
		expect(renderToString(null)).toBe("");
		expect(renderToString(undefined)).toBe("");
		expect(renderToString(true)).toBe("");
		expect(renderToString(false)).toBe("");
	});

	test("renders numbers as strings", () => {
		expect(renderToString(42)).toBe("42");
		expect(renderToString(h("span", null, 42))).toBe("<span>42</span>");
	});

	test("renders arrays", () => {
		expect(renderToString(["a", "b", "c"])).toBe("abc");
	});

	// XSS Prevention
	test("escapes HTML in text content", () => {
		expect(renderToString("<script>alert('xss')</script>")).toBe(
			"&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;",
		);
	});

	test("escapes HTML in attribute values", () => {
		const node = h("div", { title: '<img onerror="alert(1)">' });
		expect(renderToString(node)).toContain("&lt;img onerror=&quot;alert(1)&quot;&gt;");
	});

	// Attribute handling
	test("className becomes class", () => {
		const node = h("div", { className: "container" });
		expect(renderToString(node)).toBe('<div class="container"></div>');
	});

	test("htmlFor becomes for", () => {
		const node = h("label", { htmlFor: "email" });
		expect(renderToString(node)).toBe('<label for="email"></label>');
	});

	test("boolean attribute true renders without value", () => {
		const node = h("input", { disabled: true });
		expect(renderToString(node)).toBe("<input disabled>");
	});

	test("boolean attribute false is omitted", () => {
		const node = h("input", { disabled: false });
		expect(renderToString(node)).toBe("<input>");
	});

	test("null/undefined props are omitted", () => {
		const node = h("div", { id: null, className: undefined });
		expect(renderToString(node)).toBe("<div></div>");
	});

	// Style objects
	test("style object converts to CSS string", () => {
		const node = h("div", { style: { color: "red", fontSize: "16px" } });
		expect(renderToString(node)).toBe('<div style="color:red;font-size:16px"></div>');
	});

	test("style with camelCase converts to kebab-case", () => {
		const node = h("div", { style: { backgroundColor: "#fff", marginTop: "8px" } });
		const html = renderToString(node);
		expect(html).toContain("background-color:#fff");
		expect(html).toContain("margin-top:8px");
	});

	// Void elements
	test("void elements have no closing tag", () => {
		expect(renderToString(h("br", null))).toBe("<br>");
		expect(renderToString(h("hr", null))).toBe("<hr>");
		expect(renderToString(h("img", { src: "/logo.png" }))).toBe('<img src="/logo.png">');
		expect(renderToString(h("input", { type: "text" }))).toBe('<input type="text">');
		expect(renderToString(h("meta", { charset: "utf-8" }))).toBe('<meta charset="utf-8">');
	});

	// Event handlers and ref stripping
	test("event handlers are stripped", () => {
		const node = h("button", { onClick: () => {}, onSubmit: () => {} }, "click");
		expect(renderToString(node)).toBe("<button>click</button>");
	});

	test("ref prop is stripped", () => {
		const node = h("div", { ref: {} });
		expect(renderToString(node)).toBe("<div></div>");
	});

	// Raw HTML injection — React-compatible API for trusted server content only
	test("raw inner HTML renders correctly", () => {
		const node = h("div", { dangerouslySetInnerHTML: { __html: "<b>bold</b>" } });
		expect(renderToString(node)).toBe("<div><b>bold</b></div>");
	});

	// Function components in tree
	test("renders function components", () => {
		function Badge(props: Record<string, unknown>) {
			return h("span", { className: "badge" }, props.label);
		}
		const node = h("div", null, h(Badge, { label: "New" }));
		expect(renderToString(node)).toBe('<div><span class="badge">New</span></div>');
	});

	// Fragment rendering
	test("renders Fragment children inline", () => {
		const node = h("div", null, h(Fragment, null, h("span", null, "a"), h("span", null, "b")));
		expect(renderToString(node)).toBe("<div><span>a</span><span>b</span></div>");
	});

	// List rendering
	test("renders list of items", () => {
		const items = ["A", "B", "C"];
		const node = h("ul", null, ...items.map((item) => h("li", null, item)));
		expect(renderToString(node)).toBe("<ul><li>A</li><li>B</li><li>C</li></ul>");
	});
});

describe("Island markers", () => {
	test("registered island component gets wrapped with markers", () => {
		clearIslands();
		registerIsland("TestIsland");

		function TestIsland(props: Record<string, unknown>) {
			return h("span", null, String(props.count));
		}

		const node = h(TestIsland, { count: 5 });
		const html = renderToString(node);

		expect(html).toContain("<!--vrx-island:TestIsland:");
		expect(html).toContain('data-vrx-island="TestIsland"');
		expect(html).toContain("<!--/vrx-island-->");
		expect(html).toContain("<span>5</span>");

		clearIslands();
	});

	test("non-island component has no markers", () => {
		clearIslands();

		function PlainComponent() {
			return h("div", null, "plain");
		}

		const node = h(PlainComponent, {});
		const html = renderToString(node);

		expect(html).not.toContain("vrx-island");
		expect(html).toBe("<div>plain</div>");
	});

	test("island marker includes serialized props", () => {
		clearIslands();
		registerIsland("Counter");

		function Counter(props: Record<string, unknown>) {
			return h("span", null, String(props.initial));
		}

		const node = h(Counter, { initial: 10 });
		const html = renderToString(node);

		expect(html).toContain('"initial":10');

		clearIslands();
	});
});
