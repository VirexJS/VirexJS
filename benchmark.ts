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

console.log("\n  Done.\n");
