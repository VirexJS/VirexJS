import { resolve } from "node:path";
import { buildProduction } from "@virexjs/bundler";
import { loadConfig } from "../config/index";
import { PluginRunner } from "../plugin/runner";

/**
 * `virex build` command:
 * 1. Load config
 * 2. Run plugin buildStart hooks
 * 3. Run production build pipeline
 * 4. Run plugin buildEnd hooks
 * 5. Print build stats
 */
export async function build(_args: string[]): Promise<void> {
	console.log("\n  ⚡ VirexJS v0.1.0 — Building for production...\n");

	const config = await loadConfig();
	const cwd = process.cwd();
	const outDir = resolve(cwd, config.outDir);

	// Initialize plugins
	const pluginRunner = new PluginRunner(config.plugins ?? []);
	await pluginRunner.runConfigResolved(config);
	await pluginRunner.runBuildStart(config);

	const stats = await buildProduction({
		srcDir: resolve(cwd, config.srcDir),
		outDir,
		publicDir: resolve(cwd, config.publicDir),
		minify: config.build.minify,
	});

	// Run plugin buildEnd hooks
	await pluginRunner.runBuildEnd({
		pages: stats.pages,
		assets: stats.assets,
		totalSize: stats.totalSize,
		outDir,
	});

	const sizeKB = (stats.totalSize / 1024).toFixed(1);

	console.log(`  ✓ Build complete in ${stats.time}ms`);
	console.log(`  → ${stats.pages} pages rendered`);
	console.log(`  → ${stats.assets} assets copied`);
	console.log(`  → ${sizeKB} KB total output`);
	if (pluginRunner.count > 0) {
		console.log(`  → ${pluginRunner.count} plugin(s): ${pluginRunner.names.join(", ")}`);
	}
	console.log(`  → Output: ${outDir}\n`);
}
