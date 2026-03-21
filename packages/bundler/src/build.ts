import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseSegment, scanPages } from "@virexjs/router";
import { processCSS } from "./css";
import { writeBuildManifest } from "./manifest";
import { generateSitemap } from "./sitemap";

/**
 * Check if a route has dynamic segments (e.g., [slug] or [...rest]).
 */
function isDynamicRoute(segments: string[]): boolean {
	return segments.some((s) => parseSegment(s) !== null);
}

/**
 * Production build pipeline:
 * 1. Scan all pages (via router scanner)
 * 2. For each static page: import → call loader → render → write HTML
 * 3. Skip dynamic pages (they require runtime params) — log them
 * 4. Collect all CSS → concatenate → minify → write to dist/
 * 5. Copy public/ → dist/
 * 6. Generate build manifest
 * 7. Return build stats
 */
export async function buildProduction(options: {
	srcDir: string;
	outDir: string;
	publicDir: string;
	minify: boolean;
	baseURL?: string;
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
	const dynamicPages: string[] = [];
	const skippedPages: string[] = [];

	for (const route of routes) {
		// Skip special pages (_404, _error, _layout)
		const fileName = route.segments[route.segments.length - 1] ?? "";
		if (fileName.startsWith("_")) {
			skippedPages.push(route.relativePath);
			continue;
		}

		// Dynamic routes: check for getStaticPaths() for SSG
		if (isDynamicRoute(route.segments)) {
			try {
				const mod = await import(route.absolutePath);
				if (typeof mod.getStaticPaths === "function") {
					// SSG: render each path returned by getStaticPaths
					const paths: { params: Record<string, string> }[] = await mod.getStaticPaths();
					for (const pathEntry of paths) {
						const rendered = await renderStaticPage(mod, route, pathEntry.params, outDir);
						if (rendered) {
							totalSize += rendered;
							pageNames.push(
								`${route.relativePath} [${Object.values(pathEntry.params).join("/")}]`,
							);
						}
					}
					continue;
				}
			} catch {
				// Fall through to skip
			}
			dynamicPages.push(route.relativePath);
			continue;
		}

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

			// Auto-detect _layout.tsx
			let layout: ((props: { children: unknown }) => unknown) | undefined;
			const layoutPath = join(dirname(route.absolutePath), "_layout.tsx");
			if (existsSync(layoutPath)) {
				try {
					const layoutMod = await import(layoutPath);
					layout = layoutMod.default;
				} catch {
					// Skip invalid layout
				}
			}

			// Render
			const { renderToString } = await import("virexjs/render/jsx");
			const { buildDocument, renderMeta } = await import("virexjs/render/index");

			const pageProps = { data, params: {}, url: new URL("http://localhost/") };
			let vnode = component(pageProps);

			if (layout) {
				vnode = layout({ children: vnode });
			}

			const bodyHtml = renderToString(vnode);
			let headHtml = "";
			if (mod.meta) {
				headHtml = renderMeta(mod.meta({ data, params: {} }));
			}

			const fullHtml = buildDocument({ head: headHtml, body: bodyHtml });

			// Determine output path
			const outputPath =
				route.segments.length === 0
					? join(outDir, "index.html")
					: join(outDir, ...route.segments, "index.html");

			const outputDir = dirname(outputPath);
			mkdirSync(outputDir, { recursive: true });
			await Bun.write(outputPath, fullHtml);

			totalSize += fullHtml.length;
			pageNames.push(route.relativePath);
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			console.error(`Failed to build page: ${route.relativePath}`, msg);
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

	// 6. Generate sitemap.xml
	if (options.baseURL) {
		await generateSitemap({ outDir, baseURL: options.baseURL, pages: pageNames });
	}

	// Log dynamic pages info
	if (dynamicPages.length > 0) {
		console.log(`  ℹ ${dynamicPages.length} dynamic route(s) skipped (server-only):`);
		for (const p of dynamicPages) {
			console.log(`    → ${p}`);
		}
	}

	const time = Math.round(performance.now() - startTime);

	return {
		pages: pageNames.length,
		assets: assetsCount,
		totalSize,
		time,
	};
}

/**
 * Render a single static page with given params (used for SSG of dynamic routes).
 * Returns the HTML size or null on failure.
 */
async function renderStaticPage(
	mod: Record<string, unknown>,
	route: { absolutePath: string; segments: string[] },
	params: Record<string, string>,
	outDir: string,
): Promise<number | null> {
	try {
		const component = mod.default as (props: Record<string, unknown>) => unknown;
		if (!component) return null;

		// Run loader with params
		let data = {};
		const loader = mod.loader as ((ctx: Record<string, unknown>) => unknown) | undefined;
		if (loader) {
			data = (await loader({
				params,
				request: new Request("http://localhost/"),
				headers: new Headers(),
			})) as Record<string, unknown>;
		}

		// Auto-detect _layout.tsx
		let layout: ((props: { children: unknown }) => unknown) | undefined;
		const layoutPath = join(dirname(route.absolutePath), "_layout.tsx");
		if (existsSync(layoutPath)) {
			try {
				const layoutMod = await import(layoutPath);
				layout = layoutMod.default;
			} catch {
				// Skip
			}
		}

		const { renderToString } = await import("virexjs/render/jsx");
		const { buildDocument, renderMeta } = await import("virexjs/render/index");

		const pageProps = { data, params, url: new URL("http://localhost/") };
		let vnode = component(pageProps);
		if (layout) {
			vnode = (layout as (p: { children: unknown }) => unknown)({ children: vnode });
		}

		const bodyHtml = renderToString(vnode as Parameters<typeof renderToString>[0]);
		let headHtml = "";
		const metaFn = mod.meta as
			| ((ctx: Record<string, unknown>) => Record<string, unknown>)
			| undefined;
		if (metaFn) {
			headHtml = renderMeta(metaFn({ data, params }));
		}

		const fullHtml = buildDocument({ head: headHtml, body: bodyHtml });

		// Build output path: replace dynamic segments with param values
		const resolvedSegments = route.segments.map((seg) => {
			const paramDef = parseSegment(seg);
			if (paramDef) {
				return params[paramDef.name] ?? seg;
			}
			return seg;
		});

		const outputPath = join(outDir, ...resolvedSegments, "index.html");
		mkdirSync(dirname(outputPath), { recursive: true });
		await Bun.write(outputPath, fullHtml);

		return fullHtml.length;
	} catch (error) {
		const msg = error instanceof Error ? error.message : String(error);
		console.error(`  Failed to render SSG page: ${JSON.stringify(params)}`, msg);
		return null;
	}
}
