import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { loadConfig } from "../config/index";

interface CheckResult {
	pass: string[];
	warn: string[];
	fail: string[];
}

/**
 * `virex check` command:
 * Validates project structure, config, pages, islands, and common issues.
 * Like `next lint` but for VirexJS — catches problems before they hit production.
 */
export async function check(_args: string[]): Promise<void> {
	const startTime = performance.now();
	console.log("\n  Checking VirexJS project...\n");

	const result: CheckResult = { pass: [], warn: [], fail: [] };

	// 1. Config
	await checkConfig(result);

	// 2. Project structure
	checkStructure(result);

	// 3. Pages
	checkPages(result);

	// 4. Islands
	checkIslands(result);

	// 5. API routes
	checkAPIRoutes(result);

	// 6. TypeScript
	await checkTypeScript(result);

	// Print results
	const elapsed = Math.round(performance.now() - startTime);

	for (const msg of result.pass) {
		console.log(`  ✓ ${msg}`);
	}
	for (const msg of result.warn) {
		console.log(`  ⚠ ${msg}`);
	}
	for (const msg of result.fail) {
		console.log(`  ✗ ${msg}`);
	}

	const total = result.pass.length + result.warn.length + result.fail.length;
	console.log(
		`\n  ${total} checks in ${elapsed}ms — ${result.pass.length} passed, ${result.warn.length} warnings, ${result.fail.length} errors\n`,
	);

	if (result.fail.length > 0) {
		process.exit(1);
	}
}

async function checkConfig(result: CheckResult): Promise<void> {
	try {
		const config = await loadConfig();
		result.pass.push("virex.config.ts loaded successfully");

		if (config.port < 1 || config.port > 65535) {
			result.fail.push(`Invalid port: ${config.port} (must be 1-65535)`);
		}

		if (!existsSync(resolve(process.cwd(), config.srcDir))) {
			result.fail.push(`Source directory not found: ${config.srcDir}`);
		} else {
			result.pass.push(`Source directory exists: ${config.srcDir}`);
		}
	} catch {
		result.warn.push("No virex.config.ts found (using defaults)");
	}
}

function checkStructure(result: CheckResult): void {
	const cwd = process.cwd();
	const requiredDirs = ["src/pages"];
	const optionalDirs = ["src/islands", "src/api", "src/components", "src/middleware", "public"];

	for (const dir of requiredDirs) {
		if (existsSync(join(cwd, dir))) {
			result.pass.push(`Required directory exists: ${dir}`);
		} else {
			result.fail.push(`Missing required directory: ${dir}`);
		}
	}

	for (const dir of optionalDirs) {
		if (existsSync(join(cwd, dir))) {
			result.pass.push(`Optional directory found: ${dir}`);
		}
	}

	// Check for tsconfig.json
	if (existsSync(join(cwd, "tsconfig.json"))) {
		result.pass.push("tsconfig.json found");
	} else {
		result.warn.push("No tsconfig.json — TypeScript features may not work correctly");
	}

	// Check for package.json
	if (existsSync(join(cwd, "package.json"))) {
		result.pass.push("package.json found");
	} else {
		result.fail.push("Missing package.json");
	}
}

function checkPages(result: CheckResult): void {
	const pagesDir = join(process.cwd(), "src/pages");
	if (!existsSync(pagesDir)) return;

	const pages = collectFiles(pagesDir, [".tsx", ".ts"]);
	let pageCount = 0;
	let hasIndex = false;

	for (const page of pages) {
		const relativePath = page.replace(pagesDir, "").replace(/\\/g, "/");
		pageCount++;

		if (relativePath === "/index.tsx" || relativePath === "/index.ts") {
			hasIndex = true;
		}

		// Check for common issues
		try {
			const content = readFileSync(page, "utf-8");

			// Check for default export
			if (!relativePath.startsWith("/_") && !content.includes("export default")) {
				result.warn.push(`Page missing default export: src/pages${relativePath}`);
			}

			// Check for "use client" in pages (should be in islands/)
			// Don't flag "use cache" pages
			if (
				content.includes('"use client"') &&
				!content.includes('"use cache"') &&
				!relativePath.includes("islands") &&
				!relativePath.startsWith("/_")
			) {
				result.warn.push(
					`"use client" in page file — move to src/islands/: src/pages${relativePath}`,
				);
			}
		} catch {
			// Skip unreadable files
		}
	}

	result.pass.push(`Found ${pageCount} page(s)`);

	if (!hasIndex) {
		result.warn.push("No index page (src/pages/index.tsx) — root URL will 404");
	} else {
		result.pass.push("Index page exists");
	}
}

function checkIslands(result: CheckResult): void {
	const islandsDir = join(process.cwd(), "src/islands");
	if (!existsSync(islandsDir)) return;

	const islands = collectFiles(islandsDir, [".tsx", ".ts"]);
	let validCount = 0;
	let missingDirective = 0;

	for (const island of islands) {
		const relativePath = island.replace(islandsDir, "").replace(/\\/g, "/");

		try {
			const content = readFileSync(island, "utf-8");
			const hasDirective =
				content.includes('"use island"') ||
				content.includes('"use client"') ||
				content.includes("'use island'") ||
				content.includes("'use client'");

			if (hasDirective) {
				validCount++;
			} else {
				missingDirective++;
				result.warn.push(
					`Island missing "use island" directive: src/islands${relativePath}`,
				);
			}
		} catch {
			// Skip
		}
	}

	if (islands.length > 0) {
		result.pass.push(`Found ${islands.length} island(s) (${validCount} with directive)`);
	}

	if (missingDirective > 0) {
		result.warn.push(
			`${missingDirective} island(s) missing directive — they won't hydrate on the client`,
		);
	}
}

function checkAPIRoutes(result: CheckResult): void {
	const apiDir = join(process.cwd(), "src/api");
	if (!existsSync(apiDir)) return;

	const routes = collectFiles(apiDir, [".ts", ".tsx"]);
	let validCount = 0;

	for (const route of routes) {
		const relativePath = route.replace(apiDir, "").replace(/\\/g, "/");

		try {
			const content = readFileSync(route, "utf-8");
			const hasHandler =
				content.includes("export async function GET") ||
				content.includes("export async function POST") ||
				content.includes("export function GET") ||
				content.includes("export function POST") ||
				content.includes("export const GET") ||
				content.includes("export const POST");

			if (hasHandler) {
				validCount++;
			} else {
				result.warn.push(
					`API route missing GET/POST export: src/api${relativePath}`,
				);
			}
		} catch {
			// Skip
		}
	}

	if (routes.length > 0) {
		result.pass.push(`Found ${routes.length} API route(s) (${validCount} valid)`);
	}
}

async function checkTypeScript(result: CheckResult): Promise<void> {
	try {
		const proc = Bun.spawn(["bunx", "tsc", "--noEmit"], {
			cwd: process.cwd(),
			stdout: "pipe",
			stderr: "pipe",
		});

		const [exitCode, stdoutText, stderrText] = await Promise.all([
			proc.exited,
			new Response(proc.stdout).text(),
			new Response(proc.stderr).text(),
		]);

		const combined = stdoutText + stderrText;
		// Filter out module resolution errors (common in monorepos)
		const allErrors = combined.match(/error TS\d+/g) ?? [];
		const moduleErrors = combined.match(/error TS2307/g) ?? []; // Cannot find module
		const realErrors = allErrors.length - moduleErrors.length;

		if (exitCode === 0 || allErrors.length === 0) {
			result.pass.push("TypeScript: no errors");
		} else if (realErrors === 0 && moduleErrors.length > 0) {
			result.warn.push(
				`TypeScript: ${moduleErrors.length} module resolution warning(s) (run bun install)`,
			);
		} else {
			result.fail.push(`TypeScript: ${realErrors} error(s)`);
		}
	} catch {
		result.warn.push("TypeScript check skipped (tsc not available)");
	}
}

function collectFiles(dir: string, extensions: string[]): string[] {
	const files: string[] = [];

	function scan(d: string): void {
		let entries: string[];
		try {
			entries = readdirSync(d);
		} catch {
			return;
		}

		for (const entry of entries) {
			const fullPath = join(d, entry);
			try {
				const stat = statSync(fullPath);
				if (stat.isDirectory()) {
					scan(fullPath);
				} else if (extensions.includes(extname(entry))) {
					files.push(fullPath);
				}
			} catch {
				continue;
			}
		}
	}

	scan(dir);
	return files;
}
