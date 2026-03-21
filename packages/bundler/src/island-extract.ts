import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join, sep } from "node:path";

/**
 * Scan source files to find island components.
 * An island is any .tsx file in the islands/ directory,
 * OR any file that starts with "use island"; directive.
 *
 * Returns a registry mapping island names to file paths.
 */
export function extractIslands(srcDir: string): Map<string, { filePath: string; name: string }> {
	const islands = new Map<string, { filePath: string; name: string }>();
	const islandsDir = join(srcDir, "islands");

	// Scan islands/ directory
	scanIslandsDirectory(islandsDir, islands);

	// Scan all other .tsx files for "use island" directive
	scanForDirectives(srcDir, islandsDir, islands);

	return islands;
}

function scanIslandsDirectory(
	dir: string,
	islands: Map<string, { filePath: string; name: string }>,
): void {
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
			scanIslandsDirectory(fullPath, islands);
			continue;
		}

		if (!entry.endsWith(".tsx")) {
			continue;
		}

		const name = basename(entry, extname(entry));
		islands.set(name, { filePath: fullPath, name });
	}
}

function scanForDirectives(
	dir: string,
	islandsDir: string,
	islands: Map<string, { filePath: string; name: string }>,
): void {
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
			// Skip the islands directory itself and node_modules
			const normalizedFull = fullPath.split(sep).join("/");
			const normalizedIslands = islandsDir.split(sep).join("/");
			if (normalizedFull === normalizedIslands || entry === "node_modules") {
				continue;
			}
			scanForDirectives(fullPath, islandsDir, islands);
			continue;
		}

		if (!entry.endsWith(".tsx")) {
			continue;
		}

		try {
			const content = readFileSync(fullPath, "utf-8");
			const firstLine = content.trimStart().split("\n")[0] ?? "";
			if (
				firstLine.includes('"use island"') ||
				firstLine.includes("'use island'") ||
				firstLine.includes('// "use island"')
			) {
				const name = basename(entry, extname(entry));
				if (!islands.has(name)) {
					islands.set(name, { filePath: fullPath, name });
				}
			}
		} catch {}
	}
}
