import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

/**
 * Collect user CSS files from the source directory.
 * Returns an array of CSS file paths relative to the source root,
 * suitable for injection as <link rel="stylesheet"> tags.
 *
 * Scans for: globals.css, app.css, styles.css, and any .css in src/styles/
 */
export function collectUserCSS(srcDir: string): string[] {
	const links: string[] = [];

	// Check for common CSS entry points
	const entryNames = ["globals.css", "global.css", "app.css", "styles.css"];
	for (const name of entryNames) {
		const cssPath = join(srcDir, name);
		if (existsSync(cssPath)) {
			links.push(`/src/${name}`);
		}
	}

	// Check for src/styles/ directory
	const stylesDir = join(srcDir, "styles");
	if (existsSync(stylesDir)) {
		try {
			const files = readdirSync(stylesDir);
			for (const file of files) {
				if (extname(file) === ".css") {
					links.push(`/src/styles/${file}`);
				}
			}
		} catch {
			// Ignore
		}
	}

	return links;
}
