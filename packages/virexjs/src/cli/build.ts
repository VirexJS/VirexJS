import { resolve } from "node:path";
import { buildProduction } from "@virexjs/bundler";
import { loadConfig } from "../config/index";
import { PluginRunner } from "../plugin/runner";

/**
 * `virex build` command — production build with progress reporting.
 */
export async function build(_args: string[]): Promise<void> {
	process.env.NODE_ENV = "production";

	console.log("\n  ⚡ VirexJS v0.1.0 — Building for production...\n");

	const config = await loadConfig();
	const cwd = process.cwd();
	const outDir = resolve(cwd, config.outDir);

	// Step 1: Plugins
	const pluginRunner = new PluginRunner(config.plugins ?? []);
	await pluginRunner.runConfigResolved(config);
	if (pluginRunner.count > 0) {
		console.log(`  • Loading ${pluginRunner.count} plugin(s)...`);
	}
	await pluginRunner.runBuildStart(config);

	// Step 2: Build
	console.log("  • Scanning pages...");
	const buildStart = performance.now();

	const stats = await buildProduction({
		srcDir: resolve(cwd, config.srcDir),
		outDir,
		publicDir: resolve(cwd, config.publicDir),
		minify: config.build.minify,
	});

	const buildTime = Math.round(performance.now() - buildStart);

	// Step 3: Plugin post-build
	await pluginRunner.runBuildEnd({
		pages: stats.pages,
		assets: stats.assets,
		totalSize: stats.totalSize,
		outDir,
	});

	// Results
	const sizeKB = (stats.totalSize / 1024).toFixed(1);

	console.log("");
	console.log(`  ✓ Build complete in ${buildTime}ms`);
	console.log("");
	console.log(`    Pages:   ${stats.pages} rendered`);
	console.log(`    Assets:  ${stats.assets} copied`);
	console.log(`    Size:    ${sizeKB} KB`);
	if (pluginRunner.count > 0) {
		console.log(`    Plugins: ${pluginRunner.names.join(", ")}`);
	}
	console.log(`    Output:  ${outDir}`);
	console.log("");
}
