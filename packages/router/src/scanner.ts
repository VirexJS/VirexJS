import { readdirSync, statSync } from "node:fs";
import { basename, extname, join, relative, sep } from "node:path";
import type { ScannedRoute } from "./types";

const VALID_EXTENSIONS = new Set([".tsx", ".ts"]);
const _IGNORED_PREFIXES = ["_"];

/**
 * Recursively scan a pages directory and return all route files.
 *
 * Rules:
 * - Only .tsx and .ts files (not .css, .test.ts, etc.)
 * - Files starting with _ are special: _404.tsx, _error.tsx, _layout.tsx
 * - Directories in parentheses are route groups: (auth)/login.tsx → /login
 * - index.tsx maps to the directory path: blog/index.tsx → /blog
 */
export function scanPages(pagesDir: string): ScannedRoute[] {
	const routes: ScannedRoute[] = [];
	scanDirectory(pagesDir, pagesDir, routes);
	return routes;
}

function scanDirectory(dir: string, pagesDir: string, routes: ScannedRoute[]): void {
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
			scanDirectory(fullPath, pagesDir, routes);
			continue;
		}

		if (!stat.isFile()) {
			continue;
		}

		const ext = extname(entry);
		if (!VALID_EXTENSIONS.has(ext)) {
			continue;
		}

		// Skip test files
		if (entry.endsWith(".test.ts") || entry.endsWith(".test.tsx")) {
			continue;
		}

		const relativePath = relative(pagesDir, fullPath).split(sep).join("/");
		const segments = computeSegments(relativePath);

		routes.push({
			relativePath,
			absolutePath: fullPath,
			segments,
		});
	}
}

/**
 * Compute URL segments from a relative file path.
 * "blog/[slug].tsx" → ["blog", "[slug]"]
 * "index.tsx" → []
 * "(auth)/login.tsx" → ["(auth)", "login"]
 * "_404.tsx" → ["_404"]
 */
function computeSegments(relativePath: string): string[] {
	const parts = relativePath.split("/");
	const segments: string[] = [];

	for (let i = 0; i < parts.length; i++) {
		let part = parts[i]!;

		// Last part is the file — strip extension
		if (i === parts.length - 1) {
			part = basename(part, extname(part));
			// index maps to parent directory
			if (part === "index") {
				continue;
			}
		}

		segments.push(part);
	}

	return segments;
}
