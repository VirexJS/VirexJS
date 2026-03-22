import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Tailwind CSS integration for VirexJS.
 *
 * Two modes:
 * 1. **Auto** — Uses Tailwind CLI (`bunx tailwindcss`) if installed
 * 2. **Passthrough** — Falls back to collecting .css files as-is
 *
 * Dev mode: watches for changes, rebuilds CSS, triggers HMR css-update
 * Build mode: generates optimized, minified CSS with content hash
 *
 * Setup:
 *   bun add -d tailwindcss
 *   # VirexJS auto-detects and configures Tailwind
 */

interface TailwindResult {
	css: string;
	filename: string;
	size: number;
}

/**
 * Check if Tailwind CSS is available (installed as dependency).
 */
export function isTailwindAvailable(): boolean {
	try {
		require.resolve("tailwindcss");
		return true;
	} catch {
		return false;
	}
}

/**
 * Generate a default tailwind.config.js content for VirexJS projects.
 */
export function generateTailwindConfig(srcDir: string): string {
	return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "${srcDir}/**/*.{tsx,ts,html}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;
}

/**
 * Generate a default CSS input file with Tailwind directives.
 */
export function generateTailwindInput(): string {
	return `@tailwind base;
@tailwind components;
@tailwind utilities;
`;
}

/**
 * Process Tailwind CSS using the Tailwind CLI.
 * Returns the compiled CSS string.
 */
export async function processTailwindCSS(options: {
	srcDir: string;
	outDir: string;
	minify: boolean;
	/** Custom input CSS file path */
	inputCSS?: string;
}): Promise<TailwindResult | null> {
	const { srcDir, outDir, minify } = options;

	// Ensure tailwind config exists
	const configPath = findTailwindConfig(srcDir);
	if (!configPath) {
		// Auto-create default config
		const defaultConfigPath = join(resolve(srcDir, ".."), "tailwind.config.js");
		writeFileSync(defaultConfigPath, generateTailwindConfig(srcDir));
	}

	// Find or create input CSS
	const inputPath = options.inputCSS ?? findInputCSS(srcDir);
	let inputContent: string;

	if (inputPath && existsSync(inputPath)) {
		inputContent = readFileSync(inputPath, "utf-8");
	} else {
		// Create default input in src/
		inputContent = generateTailwindInput();
		const defaultInputPath = join(srcDir, "globals.css");
		writeFileSync(defaultInputPath, inputContent);
	}

	// Write temp input file
	mkdirSync(outDir, { recursive: true });
	const tempInputPath = join(outDir, "_tailwind_input.css");
	writeFileSync(tempInputPath, inputContent);

	// Run tailwindcss CLI
	try {
		const args = [
			"tailwindcss",
			"-i", tempInputPath,
			"--content", `${srcDir}/**/*.{tsx,ts,html}`,
		];

		if (minify) args.push("--minify");

		const proc = Bun.spawn(["bunx", ...args], {
			stdout: "pipe",
			stderr: "pipe",
			cwd: resolve(srcDir, ".."),
		});

		const [exitCode, stdout, stderr] = await Promise.all([
			proc.exited,
			new Response(proc.stdout).text(),
			new Response(proc.stderr).text(),
		]);

		// Clean up temp file
		try {
			const { unlinkSync } = await import("node:fs");
			unlinkSync(tempInputPath);
		} catch { /* ignore */ }

		if (exitCode !== 0) {
			console.error("  Tailwind CSS build failed:", stderr.trim());
			return null;
		}

		const css = stdout;
		if (!css.trim()) return null;

		// Write with content hash
		const hash = createHash("md5").update(css).digest("hex").slice(0, 8);
		const filename = `styles.${hash}.css`;
		const outPath = join(outDir, filename);
		writeFileSync(outPath, css);

		return { css, filename, size: css.length };
	} catch (error) {
		console.error("  Tailwind CSS not available. Install with: bun add -d tailwindcss");
		return null;
	}
}

/**
 * Find tailwind config file in project root.
 */
function findTailwindConfig(srcDir: string): string | null {
	const root = resolve(srcDir, "..");
	const names = [
		"tailwind.config.js",
		"tailwind.config.ts",
		"tailwind.config.mjs",
		"tailwind.config.cjs",
	];
	for (const name of names) {
		const p = join(root, name);
		if (existsSync(p)) return p;
	}
	return null;
}

/**
 * Find the main CSS input file.
 */
function findInputCSS(srcDir: string): string | null {
	const candidates = [
		join(srcDir, "globals.css"),
		join(srcDir, "global.css"),
		join(srcDir, "app.css"),
		join(srcDir, "styles.css"),
		join(srcDir, "index.css"),
	];
	for (const p of candidates) {
		if (existsSync(p)) return p;
	}
	return null;
}

/**
 * Dev mode: process Tailwind and return CSS link for injection.
 * Watches for changes via the existing file watcher.
 */
export async function processTailwindDev(options: {
	srcDir: string;
	outDir: string;
}): Promise<string | null> {
	const result = await processTailwindCSS({
		srcDir: options.srcDir,
		outDir: options.outDir,
		minify: false,
	});

	if (result) {
		return `/${result.filename}`;
	}
	return null;
}
