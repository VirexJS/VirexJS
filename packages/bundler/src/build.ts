import { join, resolve } from "node:path";
import { readdirSync, statSync, mkdirSync, cpSync } from "node:fs";
import { scanPages } from "@virexjs/router";
import { processCSS } from "./css";
import { writeBuildManifest } from "./manifest";

/**
 * Production build pipeline:
 * 1. Scan all pages (via router scanner)
 * 2. For each page: import → call loader (if static/hybrid) → render → write HTML
 * 3. Collect all CSS imports → concatenate → minify → write to dist/
 * 4. Copy public/ → dist/
 * 5. Generate build manifest
 * 6. Return build stats
 */
export async function buildProduction(options: {
	srcDir: string;
	outDir: string;
	publicDir: string;
	minify: boolean;
}): Promise<{
	pages: number;
	assets: number;
	totalSize: number;
	time: number;
}> {
	const startTime = performance.now();
	const { srcDir, outDir, publicDir, minify } = options;
	const pagesDir = join(srcDir, "pages");

	// Ensure output directory exists
	mkdirSync(outDir, { recursive: true });

	// 1. Scan pages
	const routes = scanPages(pagesDir);

	// 2. Render pages to HTML
	let totalSize = 0;
	const pageNames: string[] = [];

	for (const route of routes) {
		try {
			const mod = await import(route.absolutePath);
			const component = mod.default;
			if (!component) continue;

			// Run loader if exists
			let data = {};
			if (mod.loader) {
				data = await mod.loader({
					params: {},
					request: new Request("http://localhost/"),
					headers: new Headers(),
				});
			}

			// Render using the component — pass PageProps format
			const { renderToString } = await import("virexjs/render/jsx");
			const { buildDocument, renderMeta } = await import("virexjs/render/index");

			const pageProps = { data, params: {}, url: new URL("http://localhost/") };
			const vnode = component(pageProps);
			const bodyHtml = renderToString(vnode);
			let headHtml = "";
			if (mod.meta) {
				headHtml = renderMeta(mod.meta({ data, params: {} }));
			}

			const fullHtml = buildDocument({ head: headHtml, body: bodyHtml });

			// Determine output path
			const outputPath = route.segments.length === 0
				? join(outDir, "index.html")
				: join(outDir, ...route.segments, "index.html");

			const outputDir = outputPath.slice(0, outputPath.lastIndexOf("/") >= 0 ? outputPath.lastIndexOf("/") : outputPath.lastIndexOf("\\"));
			mkdirSync(outputDir, { recursive: true });
			await Bun.write(outputPath, fullHtml);

			totalSize += fullHtml.length;
			pageNames.push(route.relativePath);
		} catch (error) {
			console.error(`Failed to build page: ${route.relativePath}`, error);
		}
	}

	// 3. Process CSS
	let assetsCount = 0;
	const cssResult = await processCSS({ srcDir, outDir, minify });
	if (cssResult) {
		assetsCount++;
		totalSize += cssResult.size;
	}

	// 4. Copy public/ → dist/
	try {
		const publicEntries = readdirSync(publicDir);
		for (const entry of publicEntries) {
			const src = join(publicDir, entry);
			const dest = join(outDir, entry);
			cpSync(src, dest, { recursive: true });
			assetsCount++;
		}
	} catch {
		// Public dir may not exist
	}

	// 5. Generate manifest
	await writeBuildManifest(outDir, {
		version: "0.1.0",
		timestamp: Date.now(),
		pages: pageNames,
		assets: {},
		css: cssResult?.filename,
	});

	const time = Math.round(performance.now() - startTime);

	return {
		pages: pageNames.length,
		assets: assetsCount,
		totalSize,
		time,
	};
}
