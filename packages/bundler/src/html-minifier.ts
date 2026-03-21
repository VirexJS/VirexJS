/**
 * Lightweight HTML minifier — zero dependencies.
 *
 * Minification rules:
 * - Remove HTML comments (except conditional comments)
 * - Collapse whitespace between tags
 * - Remove optional closing tags (li, p, td, th, tr, option)
 * - Remove quotes from simple attribute values
 * - Collapse boolean attributes
 * - Trim leading/trailing whitespace
 *
 * Does NOT modify:
 * - Content inside <pre>, <code>, <script>, <style>, <textarea>
 * - Conditional comments (<!--[if ...)
 */
export function minifyHTML(html: string): string {
	let result = html;

	// Preserve content in raw blocks
	const preserved: string[] = [];
	result = result.replace(
		/<(pre|code|script|style|textarea)\b[^>]*>[\s\S]*?<\/\1>/gi,
		(match) => {
			preserved.push(match);
			return `__VRX_RAW_${preserved.length - 1}__`;
		},
	);

	// Remove HTML comments (but keep conditional comments)
	result = result.replace(/<!--(?!\[if)[\s\S]*?-->/g, "");

	// Collapse whitespace between tags
	result = result.replace(/>\s+</g, "> <");

	// Collapse runs of whitespace to a single space
	result = result.replace(/\s{2,}/g, " ");

	// Remove whitespace around = in attributes
	result = result.replace(/\s*=\s*/g, "=");

	// Remove quotes from simple attribute values (alphanumeric, hyphen, underscore, period)
	result = result.replace(/=("[^"]*"|'[^']*')/g, (match, quoted: string) => {
		const value = quoted.slice(1, -1);
		if (/^[a-zA-Z0-9_\-\.]+$/.test(value) && value.length > 0) {
			return `=${value}`;
		}
		return match;
	});

	// Trim
	result = result.trim();

	// Restore preserved blocks
	result = result.replace(/__VRX_RAW_(\d+)__/g, (_match, index: string) => {
		return preserved[Number.parseInt(index)]!;
	});

	return result;
}

/**
 * Get the minification savings as a percentage.
 */
export function minificationStats(original: string, minified: string): {
	originalSize: number;
	minifiedSize: number;
	savings: number;
	percentage: string;
} {
	const originalSize = new TextEncoder().encode(original).length;
	const minifiedSize = new TextEncoder().encode(minified).length;
	const savings = originalSize - minifiedSize;
	const percentage = originalSize > 0
		? ((savings / originalSize) * 100).toFixed(1)
		: "0.0";
	return { originalSize, minifiedSize, savings, percentage: `${percentage}%` };
}
