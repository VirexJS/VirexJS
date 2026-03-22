import { describe, expect, test } from "bun:test";
import { asyncCSSLoader, extractCriticalCSS } from "../src/critical-css";

const sampleCSS = `
body { margin: 0; font-family: sans-serif; }
h1 { font-size: 2rem; color: #111; }
h2 { font-size: 1.5rem; }
.hero { background: blue; }
.sidebar { width: 300px; }
.footer { padding: 20px; }
#main { max-width: 900px; }
#comments { border-top: 1px solid #ccc; }
@media (max-width: 768px) {
  .hero { padding: 10px; }
}
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2');
}
`;

const sampleHTML = `
<body>
<div id="main">
  <div class="hero">
    <h1>Hello World</h1>
  </div>
  <div class="footer">
    <p>Footer text</p>
  </div>
</div>
</body>
`;

describe("extractCriticalCSS", () => {
	test("includes rules matching HTML elements", () => {
		const { critical } = extractCriticalCSS(sampleHTML, sampleCSS);
		expect(critical).toContain("body");
		expect(critical).toContain("h1");
		expect(critical).toContain(".hero");
		expect(critical).toContain("#main");
		expect(critical).toContain(".footer");
	});

	test("excludes rules not matching HTML", () => {
		const { rest } = extractCriticalCSS(sampleHTML, sampleCSS);
		expect(rest).toContain(".sidebar");
		expect(rest).toContain("#comments");
		expect(rest).toContain("h2");
	});

	test("includes @media rules in critical", () => {
		const { critical } = extractCriticalCSS(sampleHTML, sampleCSS);
		expect(critical).toContain("@media");
	});

	test("includes @font-face in critical", () => {
		const { critical } = extractCriticalCSS(sampleHTML, sampleCSS);
		expect(critical).toContain("@font-face");
	});

	test("handles empty CSS", () => {
		const { critical, rest } = extractCriticalCSS(sampleHTML, "");
		expect(critical).toBe("");
		expect(rest).toBe("");
	});

	test("handles empty HTML", () => {
		const { critical, rest } = extractCriticalCSS("", sampleCSS);
		// At-rules always included, regular rules go to rest
		expect(critical).toContain("@media");
		expect(rest).toContain("body");
	});

	test("handles universal selector", () => {
		const css = "* { box-sizing: border-box; }";
		const { critical } = extractCriticalCSS("<div>hello</div>", css);
		expect(critical).toContain("box-sizing");
	});

	test("handles compound selectors", () => {
		const css = ".hero, .banner { background: blue; }";
		const html = '<div class="hero">Test</div>';
		const { critical } = extractCriticalCSS(html, css);
		expect(critical).toContain(".hero");
	});
});

describe("asyncCSSLoader", () => {
	test("generates async loader markup", () => {
		const result = asyncCSSLoader("/styles.abc123.css");
		expect(result).toContain('rel="preload"');
		expect(result).toContain('as="style"');
		expect(result).toContain("onload=");
		expect(result).toContain("<noscript>");
		expect(result).toContain("/styles.abc123.css");
	});
});
