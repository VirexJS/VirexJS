import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

/**
 * Collect all CSS files imported in the project.
 * Concatenate them, optionally minify, write to output.
 * Return the output filename (with hash for cache busting).
 */
export async function processCSS(options: {
	srcDir: string;
	outDir: string;
	minify: boolean;
}): Promise<{ filename: string; size: number } | null> {
	const cssFiles = collectCSSFiles(options.srcDir);

	if (cssFiles.length === 0) {
		return null;
	}

	let concatenated = "";
	for (const file of cssFiles) {
		try {
			concatenated += `${readFileSync(file, "utf-8")}\n`;
		} catch {}
	}

	if (options.minify) {
		concatenated = minifyCSS(concatenated);
	}

	// Generate content hash for cache busting
	const hash = createHash("md5").update(concatenated).digest("hex").slice(0, 8);
	const filename = `styles.${hash}.css`;
	const outPath = join(options.outDir, filename);

	await Bun.write(outPath, concatenated);

	return {
		filename,
		size: concatenated.length,
	};
}

/**
 * Collect all .css files recursively from a directory.
 */
function collectCSSFiles(dir: string): string[] {
	const files: string[] = [];
	scanForCSS(dir, files);
	return files;
}

function scanForCSS(dir: string, files: string[]): void {
	let entries: string[];
	try {
		entries = readdirSync(dir);
	} catch {
		return;
	}

	for (const entry of entries) {
		const fullPath = join(dir, entry);
		let stat: ReturnType<typeof statSync> | null = null;
		try {
			stat = statSync(fullPath);
		} catch {
			continue;
		}

		if (stat.isDirectory()) {
			if (entry !== "node_modules") {
				scanForCSS(fullPath, files);
			}
			continue;
		}

		if (extname(entry) === ".css") {
			files.push(fullPath);
		}
	}
}

/**
 * Basic CSS minification without external tools.
 * Strips comments, collapses whitespace, removes empty rules.
 */
function minifyCSS(css: string): string {
	let result = css;

	// Remove comments
	result = result.replace(/\/\*[\s\S]*?\*\//g, "");

	// Collapse whitespace
	result = result.replace(/\s+/g, " ");

	// Remove spaces around special characters
	result = result.replace(/\s*([{}:;,>~+])\s*/g, "$1");

	// Remove trailing semicolons before closing brace
	result = result.replace(/;}/g, "}");

	// Remove empty rules
	result = result.replace(/[^{}]+\{\s*\}/g, "");

	return result.trim();
}
