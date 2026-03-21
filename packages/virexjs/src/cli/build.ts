import { resolve } from "node:path";
import { loadConfig } from "../config/index";
import { buildProduction } from "@virexjs/bundler";

/**
 * `virex build` command:
 * 1. Load config
 * 2. Run production build pipeline
 * 3. Print build stats
 */
export async function build(_args: string[]): Promise<void> {
	console.log("\n  ⚡ VirexJS v0.1.0 — Building for production...\n");

	const config = await loadConfig();
	const cwd = process.cwd();

	const stats = await buildProduction({
		srcDir: resolve(cwd, config.srcDir),
		outDir: resolve(cwd, config.outDir),
		publicDir: resolve(cwd, config.publicDir),
		minify: config.build.minify,
	});

	const sizeKB = (stats.totalSize / 1024).toFixed(1);

	console.log(`  ✓ Build complete in ${stats.time}ms`);
	console.log(`  → ${stats.pages} pages rendered`);
	console.log(`  → ${stats.assets} assets copied`);
	console.log(`  → ${sizeKB} KB total output`);
	console.log(`  → Output: ${resolve(cwd, config.outDir)}\n`);
}
