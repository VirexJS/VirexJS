/**
 * Dynamic OG Image generator — creates social preview images as SVG.
 *
 * No external dependencies. Generates SVG that can be served as an image.
 * Browsers and social platforms render SVG natively.
 *
 * Usage:
 *   // In an API route:
 *   import { generateOGImage } from "virexjs";
 *
 *   export const GET = defineAPIRoute(({ request }) => {
 *     const url = new URL(request.url);
 *     const title = url.searchParams.get("title") ?? "VirexJS";
 *     return generateOGImage({ title, subtitle: "Ship HTML, not JavaScript" });
 *   });
 *
 *   // In useHead:
 *   useHead({ og: { image: "/api/og?title=My+Page" } });
 */

export interface OGImageOptions {
	/** Main title text */
	title: string;
	/** Subtitle text */
	subtitle?: string;
	/** Background color */
	bgColor?: string;
	/** Text color */
	textColor?: string;
	/** Accent color */
	accentColor?: string;
	/** Width in pixels */
	width?: number;
	/** Height in pixels */
	height?: number;
	/** Brand/site name */
	brand?: string;
}

/**
 * Generate an OG image as SVG and return as Response.
 */
export function generateOGImage(options: OGImageOptions): Response {
	const {
		title,
		subtitle,
		bgColor = "#0f172a",
		textColor = "#f8fafc",
		accentColor = "#3b82f6",
		width = 1200,
		height = 630,
		brand = "VirexJS",
	} = options;

	// Truncate title if too long
	const maxTitleLen = 60;
	const displayTitle = title.length > maxTitleLen ? `${title.slice(0, maxTitleLen)}...` : title;

	// Calculate font size based on title length
	const titleFontSize = displayTitle.length > 40 ? 48 : displayTitle.length > 20 ? 56 : 64;

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor}"/>
      <stop offset="100%" style="stop-color:${adjustColor(bgColor, 20)}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect x="0" y="${height - 6}" width="${width}" height="6" fill="${accentColor}"/>
  <circle cx="${width - 100}" cy="100" r="200" fill="${accentColor}" opacity="0.08"/>
  <circle cx="100" cy="${height - 80}" r="150" fill="${accentColor}" opacity="0.06"/>
  <text x="80" y="${height / 2 - (subtitle ? 20 : 0)}" font-family="system-ui, sans-serif" font-size="${titleFontSize}" font-weight="700" fill="${textColor}">${escapeXml(displayTitle)}</text>
  ${subtitle ? `<text x="80" y="${height / 2 + 40}" font-family="system-ui, sans-serif" font-size="28" fill="${textColor}" opacity="0.7">${escapeXml(subtitle)}</text>` : ""}
  <text x="80" y="${height - 50}" font-family="system-ui, sans-serif" font-size="24" font-weight="600" fill="${accentColor}">${escapeXml(brand)}</text>
</svg>`;

	return new Response(svg, {
		headers: {
			"Content-Type": "image/svg+xml",
			"Cache-Control": "public, max-age=86400",
		},
	});
}

function escapeXml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function adjustColor(hex: string, amount: number): string {
	const num = Number.parseInt(hex.replace("#", ""), 16);
	const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
	const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
	const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
	return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
