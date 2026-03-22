/**
 * Image optimization API endpoint.
 *
 * Serves optimized images on-the-fly:
 * - Resize to requested width (requires sharp)
 * - Serve as WebP when supported (requires sharp)
 * - Generate blur placeholders (requires sharp)
 * - Cache optimized versions to disk
 * - Falls back to passthrough with caching if sharp is not installed
 *
 * Usage:
 *   /_virex/image?url=/photos/hero.jpg&w=800&q=75
 *   /_virex/image?url=/photos/hero.jpg&w=800&q=75&blur=1  (returns base64 LQIP)
 *
 * Install sharp for full optimization:
 *   bun add sharp
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const SUPPORTED_FORMATS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"]);
const MAX_WIDTH = 3840;
const MIN_WIDTH = 16;
const ALLOWED_WIDTHS = [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];

/** Lazily resolved sharp module (optional peer dependency) */
let sharpModule: SharpModule | null | undefined;

interface SharpModule {
	(input: Buffer | ArrayBuffer): SharpInstance;
}

interface SharpInstance {
	resize(width: number, options?: { withoutEnlargement: boolean }): SharpInstance;
	webp(options?: { quality: number }): SharpInstance;
	jpeg(options?: { quality: number }): SharpInstance;
	png(options?: { quality: number }): SharpInstance;
	avif(options?: { quality: number }): SharpInstance;
	blur(sigma?: number): SharpInstance;
	toBuffer(): Promise<Buffer>;
	metadata(): Promise<{ width?: number; height?: number; format?: string }>;
}

interface OptimizeOptions {
	/** Public directory for source images */
	publicDir: string;
	/** Cache directory for optimized images */
	cacheDir: string;
}

/**
 * Try to load sharp. Returns null if not installed.
 */
function getSharp(): SharpModule | null {
	if (sharpModule !== undefined) return sharpModule;
	try {
		sharpModule = require("sharp") as SharpModule;
		return sharpModule;
	} catch {
		sharpModule = null;
		return null;
	}
}

/**
 * Snap requested width to nearest allowed value (prevents cache busting attacks).
 */
function snapWidth(requested: number): number {
	if (requested <= MIN_WIDTH) return MIN_WIDTH;
	if (requested >= MAX_WIDTH) return MAX_WIDTH;
	for (const w of ALLOWED_WIDTHS) {
		if (w >= requested) return w;
	}
	return MAX_WIDTH;
}

/**
 * Handle image optimization request.
 *
 * Query params:
 * - url: source image path (relative to public/)
 * - w: target width (optional, snapped to allowed values)
 * - q: quality 1-100 (optional, default 80)
 * - blur: if "1", return a tiny base64 blur placeholder (LQIP)
 */
export async function handleImageRequest(
	request: Request,
	options: OptimizeOptions,
): Promise<Response | null> {
	const url = new URL(request.url);
	const imagePath = url.searchParams.get("url");
	const widthParam = url.searchParams.get("w");
	const quality = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get("q") ?? "80", 10)));
	const wantBlur = url.searchParams.get("blur") === "1";

	if (!imagePath) {
		return new Response(JSON.stringify({ error: "Missing url parameter" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Security: resolve and verify path stays within publicDir
	const sourcePath = resolve(options.publicDir, imagePath.replace(/^\/+/, ""));
	if (!sourcePath.startsWith(resolve(options.publicDir))) {
		return new Response("Forbidden", { status: 403 });
	}

	const ext = extname(sourcePath).toLowerCase();
	if (!SUPPORTED_FORMATS.has(ext)) {
		return new Response(JSON.stringify({ error: "Unsupported image format" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	if (!existsSync(sourcePath)) {
		return new Response("Image not found", { status: 404 });
	}

	// SVGs don't need processing
	if (ext === ".svg") {
		const file = Bun.file(sourcePath);
		return new Response(file, {
			headers: {
				"Content-Type": "image/svg+xml",
				"Cache-Control": "public, max-age=31536000, immutable",
			},
		});
	}

	// Check browser format support
	const acceptHeader = request.headers.get("Accept") ?? "";
	const supportsWebP = acceptHeader.includes("image/webp");
	const supportsAvif = acceptHeader.includes("image/avif");

	const targetWidth = widthParam ? snapWidth(Number.parseInt(widthParam, 10)) : null;
	const sharp = getSharp();

	// LQIP blur placeholder (tiny base64 image for CSS background)
	if (wantBlur && sharp) {
		return handleBlurRequest(sourcePath, sharp, options.cacheDir);
	}

	// Determine target format
	const targetFormat = sharp
		? supportsAvif
			? "avif"
			: supportsWebP
				? "webp"
				: ext.replace(".", "")
		: ext.replace(".", "");

	// Generate cache key
	const cacheKey = createHash("md5")
		.update(`${sourcePath}:${targetWidth ?? "orig"}:${quality}:${targetFormat}`)
		.digest("hex");
	const cacheExt = `.${targetFormat === "jpeg" || targetFormat === "jpg" ? "jpg" : targetFormat}`;
	const cachePath = join(options.cacheDir, `${cacheKey}${cacheExt}`);

	mkdirSync(options.cacheDir, { recursive: true });

	// Serve from cache if exists
	if (existsSync(cachePath)) {
		const file = Bun.file(cachePath);
		return new Response(file, {
			headers: {
				"Content-Type": getContentType(cacheExt),
				"Cache-Control": "public, max-age=31536000, immutable",
				"X-VirexJS-Image": "CACHED",
			},
		});
	}

	// Read source
	const sourceFile = Bun.file(sourcePath);
	const sourceBuffer = await sourceFile.arrayBuffer();

	// If sharp is available, do real optimization
	if (sharp) {
		try {
			let pipeline = sharp(sourceBuffer);

			// Resize if width requested
			if (targetWidth) {
				pipeline = pipeline.resize(targetWidth, { withoutEnlargement: true });
			}

			// Convert format
			switch (targetFormat) {
				case "webp":
					pipeline = pipeline.webp({ quality });
					break;
				case "avif":
					pipeline = pipeline.avif({ quality });
					break;
				case "png":
					pipeline = pipeline.png({ quality });
					break;
				default:
					pipeline = pipeline.jpeg({ quality });
					break;
			}

			const optimized = await pipeline.toBuffer();

			// Write to cache
			try {
				writeFileSync(cachePath, optimized);
			} catch {
				// Cache write failed, serve directly
			}

			return new Response(new Uint8Array(optimized), {
				headers: {
					"Content-Type": getContentType(cacheExt),
					"Cache-Control": "public, max-age=31536000, immutable",
					"X-VirexJS-Image": "OPTIMIZED",
					"X-VirexJS-Sharp": "true",
				},
			});
		} catch {
			// Sharp processing failed, fall through to passthrough
		}
	}

	// Fallback: serve original with caching (no sharp)
	try {
		writeFileSync(cachePath, Buffer.from(sourceBuffer));
	} catch {
		// Cache write failed
	}

	return new Response(sourceBuffer, {
		headers: {
			"Content-Type": getContentType(ext),
			"Cache-Control": "public, max-age=31536000, immutable",
			"X-VirexJS-Image": "PASSTHROUGH",
		},
	});
}

/**
 * Generate a tiny blur placeholder (LQIP) as base64 data URI.
 * Returns a small (~200 byte) blurred image for CSS background-image.
 */
async function handleBlurRequest(
	sourcePath: string,
	sharp: SharpModule,
	cacheDir: string,
): Promise<Response> {
	const cacheKey = createHash("md5").update(`${sourcePath}:blur`).digest("hex");
	const cachePath = join(cacheDir, `${cacheKey}.blur.txt`);

	mkdirSync(cacheDir, { recursive: true });

	// Serve cached LQIP
	if (existsSync(cachePath)) {
		const cached = Bun.file(cachePath);
		const dataUri = await cached.text();
		return Response.json({ blurDataURL: dataUri });
	}

	const sourceBuffer = await Bun.file(sourcePath).arrayBuffer();
	const blurBuffer = await sharp(sourceBuffer).resize(8).blur(4).webp({ quality: 20 }).toBuffer();
	const dataUri = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

	try {
		writeFileSync(cachePath, dataUri);
	} catch {
		// Cache write failed
	}

	return Response.json(
		{ blurDataURL: dataUri },
		{
			headers: { "Cache-Control": "public, max-age=31536000, immutable" },
		},
	);
}

function getContentType(ext: string): string {
	const types: Record<string, string> = {
		".jpg": "image/jpeg",
		".jpeg": "image/jpeg",
		".png": "image/png",
		".gif": "image/gif",
		".webp": "image/webp",
		".avif": "image/avif",
		".svg": "image/svg+xml",
	};
	return types[ext] ?? "application/octet-stream";
}
