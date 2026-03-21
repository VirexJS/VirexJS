import { join } from "node:path";

/**
 * Generate a sitemap.xml from built page paths.
 * Writes the sitemap to the output directory.
 */
export async function generateSitemap(options: {
	outDir: string;
	baseURL: string;
	pages: string[];
}): Promise<void> {
	const { outDir, baseURL, pages } = options;
	const base = baseURL.replace(/\/$/, "");

	const urls = pages.map((page) => {
		// Convert page paths to URLs
		const urlPath = pageToURL(page);
		return `  <url>\n    <loc>${escapeXml(base + urlPath)}</loc>\n    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>\n  </url>`;
	});

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

	await Bun.write(join(outDir, "sitemap.xml"), xml);
}

/**
 * Convert a page relative path to a URL path.
 * "index.tsx" → "/"
 * "about.tsx" → "/about"
 * "blog/index.tsx" → "/blog"
 * "blog/[slug].tsx [hello-world]" → "/blog/hello-world"
 */
function pageToURL(page: string): string {
	// Handle SSG pages with resolved params: "blog/[slug].tsx [hello-world]"
	const bracketMatch = page.match(/\s\[(.+)\]$/);
	if (bracketMatch) {
		const basePage = page.replace(/\s\[.+\]$/, "");
		const resolvedPath = bracketMatch[1]!;
		// Get directory part of the page
		const dir = basePage.includes("/") ? basePage.slice(0, basePage.lastIndexOf("/")) : "";
		return `/${dir ? dir + "/" : ""}${resolvedPath}`;
	}

	// Strip extension
	let path = page.replace(/\.(tsx|ts)$/, "");
	// Strip "index"
	path = path.replace(/\/index$/, "").replace(/^index$/, "");
	// Ensure leading slash
	return path ? `/${path}` : "/";
}

function escapeXml(str: string): string {
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
