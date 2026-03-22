/**
 * Critical CSS extraction.
 * Extracts CSS rules that match elements in the rendered HTML
 * and inlines them in the <head> for instant above-the-fold rendering.
 *
 * This eliminates render-blocking CSS — the browser can paint
 * immediately without waiting for external stylesheet downloads.
 *
 * Usage (in build pipeline):
 *   const critical = extractCriticalCSS(html, fullCSS);
 *   // Inline critical in <head>, async-load the rest
 */

/**
 * Extract CSS rules that are likely used in the given HTML.
 * Returns { critical: string, rest: string }
 */
export function extractCriticalCSS(
	html: string,
	fullCSS: string,
): { critical: string; rest: string } {
	// Parse selectors from CSS
	const rules = parseRules(fullCSS);

	const criticalRules: string[] = [];
	const restRules: string[] = [];

	for (const rule of rules) {
		if (rule.type === "at-rule") {
			// @media, @keyframes, @font-face — always include
			criticalRules.push(rule.raw);
		} else if (selectorMatchesHTML(rule.selector, html)) {
			criticalRules.push(rule.raw);
		} else {
			restRules.push(rule.raw);
		}
	}

	return {
		critical: criticalRules.join("\n"),
		rest: restRules.join("\n"),
	};
}

interface CSSRule {
	type: "rule" | "at-rule";
	selector: string;
	raw: string;
}

/**
 * Simple CSS rule parser — splits CSS into individual rules.
 * Handles nested @media blocks and top-level rules.
 */
function parseRules(css: string): CSSRule[] {
	const rules: CSSRule[] = [];
	let i = 0;

	while (i < css.length) {
		// Skip whitespace
		while (i < css.length && /\s/.test(css[i]!)) i++;
		if (i >= css.length) break;

		// Skip comments
		if (css[i] === "/" && css[i + 1] === "*") {
			const end = css.indexOf("*/", i + 2);
			i = end === -1 ? css.length : end + 2;
			continue;
		}

		// At-rule (@media, @keyframes, @font-face)
		if (css[i] === "@") {
			const start = i;
			const braceIdx = css.indexOf("{", i);
			if (braceIdx === -1) break;

			// Find matching closing brace (handling nesting)
			let depth = 1;
			let j = braceIdx + 1;
			while (j < css.length && depth > 0) {
				if (css[j] === "{") depth++;
				else if (css[j] === "}") depth--;
				j++;
			}

			rules.push({
				type: "at-rule",
				selector: css.slice(start, braceIdx).trim(),
				raw: css.slice(start, j),
			});
			i = j;
			continue;
		}

		// Regular rule
		const braceIdx = css.indexOf("{", i);
		if (braceIdx === -1) break;

		const closeIdx = css.indexOf("}", braceIdx);
		if (closeIdx === -1) break;

		const selector = css.slice(i, braceIdx).trim();
		const raw = css.slice(i, closeIdx + 1);

		if (selector) {
			rules.push({ type: "rule", selector, raw });
		}

		i = closeIdx + 1;
	}

	return rules;
}

/**
 * Check if a CSS selector might match elements in the HTML.
 * Uses heuristic matching — checks for tag names, classes, and IDs.
 */
function selectorMatchesHTML(selector: string, html: string): boolean {
	// Split compound selectors
	const parts = selector.split(",");

	for (const part of parts) {
		const trimmed = part.trim();
		if (!trimmed) continue;

		// Universal selector always matches
		if (trimmed === "*") return true;

		// Extract meaningful tokens from the selector
		const tokens = trimmed.match(/[.#]?[\w-]+/g);
		if (!tokens) continue;

		let allMatch = true;
		for (const token of tokens) {
			if (token.startsWith(".")) {
				// Class selector: look for class="...token..."
				const className = token.slice(1);
				if (!html.includes(className)) {
					allMatch = false;
					break;
				}
			} else if (token.startsWith("#")) {
				// ID selector: look for id="token"
				const id = token.slice(1);
				if (!html.includes(`id="${id}"`)) {
					allMatch = false;
					break;
				}
			} else {
				// Tag selector: look for <tag
				if (!html.includes(`<${token}`)) {
					allMatch = false;
					break;
				}
			}
		}

		if (allMatch) return true;
	}

	return false;
}

/**
 * Generate an async CSS loader script.
 * Loads the full stylesheet without blocking rendering.
 */
export function asyncCSSLoader(href: string): string {
	return `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="${href}"></noscript>`;
}
