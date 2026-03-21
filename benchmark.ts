#!/usr/bin/env bun
/**
 * VirexJS Performance Benchmark
 *
 * Measures:
 * - Server startup time
 * - Page render time (renderToString)
 * - Route matching speed
 * - Build time
 *
 * Run: bun benchmark.ts
 */

import { h, renderToString } from "./packages/virexjs/src/render/jsx";
import { buildTree, matchRoute, scanPages } from "./packages/router/src/index";
import { resolve } from "node:path";

const ITERATIONS = 10_000;

function bench(name: string, fn: () => void, iterations = ITERATIONS): void {
	// Warmup
	for (let i = 0; i < 100; i++) fn();

	const start = performance.now();
	for (let i = 0; i < iterations; i++) fn();
	const elapsed = performance.now() - start;

	const opsPerSec = Math.round((iterations / elapsed) * 1000);
	const avgMs = (elapsed / iterations).toFixed(4);
	console.log(`  ${name}: ${opsPerSec.toLocaleString()} ops/sec (${avgMs}ms avg)`);
}

console.log("\n  VirexJS Performance Benchmark\n");
console.log("  Rendering:");

// Simple element
bench("h('div', null)", () => {
	h("div", null, "hello");
});

// Nested elements
bench("h() nested (5 levels)", () => {
	h("div", null, h("ul", null, h("li", null, h("a", { href: "/" }, h("span", null, "Link")))));
});

// renderToString simple
bench("renderToString simple", () => {
	renderToString(h("div", { className: "test" }, h("p", null, "Hello"), h("span", null, "World")));
});

// renderToString complex page
const complexPage = h(
	"html",
	null,
	h(
		"head",
		null,
		h("title", null, "Test"),
		h("meta", { name: "description", content: "Test page" }),
	),
	h(
		"body",
		null,
		h(
			"div",
			{ className: "container" },
			h("h1", null, "Hello World"),
			h(
				"ul",
				null,
				...Array.from({ length: 10 }, (_, i) =>
					h("li", null, h("a", { href: `/${i}` }, `Item ${i}`)),
				),
			),
			h("p", { style: { color: "red", fontSize: "16px" } }, "Styled paragraph"),
		),
	),
);

bench("renderToString full page", () => {
	renderToString(complexPage);
});

// Function component
function Card(props: Record<string, unknown>) {
	return h(
		"div",
		{ className: "card" },
		h("h2", null, props.title as string),
		h("p", null, props.desc as string),
	);
}

bench("renderToString with component", () => {
	renderToString(h(Card, { title: "Test", desc: "Description" }));
});

console.log("\n  Routing:");

// Route matching
const pagesDir = resolve("playground/src/pages");
try {
	const routes = scanPages(pagesDir);
	const tree = buildTree(routes);

	bench("scanPages", () => {
		scanPages(pagesDir);
	}, 1000);

	bench("buildTree", () => {
		buildTree(routes);
	});

	bench("matchRoute /", () => {
		matchRoute("/", tree);
	});

	bench("matchRoute /blog/hello-world", () => {
		matchRoute("/blog/hello-world", tree);
	});

	bench("matchRoute /nonexistent (miss)", () => {
		matchRoute("/this/does/not/exist", tree);
	});
} catch {
	console.log("  (Skipped — playground not found)");
}

// XSS escaping benchmark
console.log("\n  Security:");

bench("escapeHtml via renderToString", () => {
	renderToString(h("p", null, '<script>alert("xss")</script> & "quotes" & <tags>'));
});

// Validation benchmark
console.log("\n  Validation:");

import { validate, string, number } from "./packages/virexjs/src/validation/index";

const schema = {
	name: string().required().min(2).max(50).trim(),
	email: string().required().email(),
	age: number().min(0).max(150),
};

bench("validate (valid)", () => {
	validate(schema, { name: "  Alice  ", email: "alice@test.com", age: "30" });
});

bench("validate (invalid)", () => {
	validate(schema, { name: "", email: "bad", age: "200" });
});

// i18n benchmark
console.log("\n  i18n:");

import { createI18n, defineTranslations } from "./packages/virexjs/src/i18n/index";

const i18n = createI18n({
	defaultLocale: "en",
	locales: {
		en: defineTranslations({
			greeting: "Hello {name}",
			items: { one: "1 item", other: "{count} items" },
			nav: { home: "Home", about: "About" },
		}),
	},
});

bench("i18n t() simple", () => {
	i18n.t("greeting", { name: "World" });
});

bench("i18n t() nested", () => {
	i18n.t("nav.home");
});

bench("i18n t() plural", () => {
	i18n.t("items", { count: 5 });
});

console.log("\n  Done.\n");
