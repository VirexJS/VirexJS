import { join } from "node:path";

/**
 * Generate robots.txt for production builds.
 * Writes to the output directory alongside sitemap.xml.
 *
 * Usage in virex.config.ts:
 *   export default defineConfig({
 *     baseURL: "https://example.com",
 *     robots: {
 *       allow: ["/"],
 *       disallow: ["/admin", "/api"],
 *       crawlDelay: 1,
 *     },
 *   });
 */
export interface RobotsConfig {
	/** Paths to allow (default: ["/"]) */
	allow?: string[];
	/** Paths to disallow */
	disallow?: string[];
	/** Crawl delay in seconds */
	crawlDelay?: number;
	/** Additional user-agent rules */
	rules?: Array<{
		userAgent: string;
		allow?: string[];
		disallow?: string[];
	}>;
}

export async function generateRobotsTxt(options: {
	outDir: string;
	baseURL: string;
	config?: RobotsConfig;
}): Promise<void> {
	const { outDir, baseURL, config = {} } = options;
	const base = baseURL.replace(/\/$/, "");

	const lines: string[] = [];

	// Default rules
	if (!config.rules || config.rules.length === 0) {
		lines.push("User-agent: *");

		const allow = config.allow ?? ["/"];
		for (const path of allow) {
			lines.push(`Allow: ${path}`);
		}

		if (config.disallow) {
			for (const path of config.disallow) {
				lines.push(`Disallow: ${path}`);
			}
		}

		if (config.crawlDelay) {
			lines.push(`Crawl-delay: ${config.crawlDelay}`);
		}
	}

	// Additional per-agent rules
	if (config.rules) {
		for (const rule of config.rules) {
			lines.push("");
			lines.push(`User-agent: ${rule.userAgent}`);
			if (rule.allow) {
				for (const path of rule.allow) {
					lines.push(`Allow: ${path}`);
				}
			}
			if (rule.disallow) {
				for (const path of rule.disallow) {
					lines.push(`Disallow: ${path}`);
				}
			}
		}
	}

	// Sitemap reference
	lines.push("");
	lines.push(`Sitemap: ${base}/sitemap.xml`);
	lines.push("");

	await Bun.write(join(outDir, "robots.txt"), lines.join("\n"));
}
