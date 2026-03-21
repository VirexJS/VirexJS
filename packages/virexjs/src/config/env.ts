import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Load environment variables from .env files.
 *
 * Loading order (later files override earlier):
 * 1. `.env` — base defaults
 * 2. `.env.local` — local overrides (gitignored)
 * 3. `.env.{mode}` — mode-specific (e.g., `.env.production`)
 * 4. `.env.{mode}.local` — mode-specific local overrides
 *
 * Usage:
 *   import { loadEnv } from "virexjs";
 *   const env = loadEnv("production");
 *   // or loadEnv("development", "/path/to/project");
 *
 * Variables are also set on process.env.
 */
export function loadEnv(
	mode?: string,
	cwd?: string,
): Record<string, string> {
	const dir = cwd ?? process.cwd();
	const result: Record<string, string> = {};

	const files = [".env"];
	if (mode) {
		files.push(`.env.${mode}`);
	}
	files.push(".env.local");
	if (mode) {
		files.push(`.env.${mode}.local`);
	}

	for (const file of files) {
		const filePath = join(dir, file);
		if (!existsSync(filePath)) continue;

		try {
			const content = readFileSync(filePath, "utf-8");
			const parsed = parseEnvFile(content);
			Object.assign(result, parsed);
		} catch {
			// Skip unreadable files
		}
	}

	// Set on process.env (don't override existing)
	for (const [key, value] of Object.entries(result)) {
		if (process.env[key] === undefined) {
			process.env[key] = value;
		}
	}

	return result;
}

/**
 * Parse a .env file content into key-value pairs.
 *
 * Supports:
 * - KEY=value
 * - KEY="quoted value"
 * - KEY='single quoted'
 * - # comments
 * - Empty lines
 * - Multiline values with quotes
 * - Variable expansion: ${VAR} or $VAR (within same file)
 */
export function parseEnvFile(content: string): Record<string, string> {
	const result: Record<string, string> = {};
	const lines = content.split("\n");

	for (const rawLine of lines) {
		const line = rawLine.trim();

		// Skip empty lines and comments
		if (!line || line.startsWith("#")) {
			continue;
		}

		// Find the first = sign
		const eqIndex = line.indexOf("=");
		if (eqIndex < 0) continue;

		const key = line.slice(0, eqIndex).trim();
		let value = line.slice(eqIndex + 1).trim();

		// Skip invalid keys
		if (!key || /\s/.test(key)) continue;

		// Handle quoted values
		if ((value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))) {
			value = value.slice(1, -1);
		}

		// Handle escape sequences in double-quoted values
		if (rawLine.slice(eqIndex + 1).trim().startsWith('"')) {
			value = value
				.replace(/\\n/g, "\n")
				.replace(/\\r/g, "\r")
				.replace(/\\t/g, "\t")
				.replace(/\\\\/g, "\\");
		}

		// Strip inline comments (only for unquoted values)
		if (!rawLine.slice(eqIndex + 1).trim().startsWith('"') &&
			!rawLine.slice(eqIndex + 1).trim().startsWith("'")) {
			const commentIndex = value.indexOf(" #");
			if (commentIndex >= 0) {
				value = value.slice(0, commentIndex).trim();
			}
		}

		// Variable expansion
		value = value.replace(/\$\{(\w+)\}|\$(\w+)/g, (_match, braced: string, plain: string) => {
			const varName = braced ?? plain;
			return result[varName] ?? process.env[varName] ?? "";
		});

		result[key] = value;
	}

	return result;
}
