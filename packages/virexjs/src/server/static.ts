import { join, resolve, sep } from "node:path";

/** Map of file extensions to MIME types */
const MIME_TYPES: Record<string, string> = {
	".html": "text/html",
	".css": "text/css",
	".js": "application/javascript",
	".mjs": "application/javascript",
	".json": "application/json",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
	".woff2": "font/woff2",
	".woff": "font/woff",
	".ttf": "font/ttf",
	".otf": "font/otf",
	".txt": "text/plain",
	".xml": "application/xml",
	".webp": "image/webp",
	".avif": "image/avif",
	".mp4": "video/mp4",
	".webm": "video/webm",
	".wasm": "application/wasm",
	".map": "application/json",
};

/**
 * Try to serve a static file from the public directory.
 * Returns null if file doesn't exist.
 * Sets correct Content-Type and ETag based on file extension and last modified time.
 */
export async function serveStatic(
	path: string,
	publicDir: string,
	request?: Request,
): Promise<Response | null> {
	// Prevent directory traversal — join then resolve, verify path stays within publicDir
	const normalizedPublicDir = resolve(publicDir);
	const filePath = resolve(join(publicDir, path));
	if (!filePath.startsWith(normalizedPublicDir + sep) && filePath !== normalizedPublicDir) {
		return null;
	}
	const file = Bun.file(filePath);

	if (!(await file.exists())) {
		return null;
	}

	const ext = getExtension(filePath);
	const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

	// Generate ETag from file size + last modified
	const lastModified = file.lastModified;
	const size = file.size;
	const etag = `"${size.toString(36)}-${lastModified.toString(36)}"`;

	// Check If-None-Match for conditional requests
	if (request) {
		const ifNoneMatch = request.headers.get("If-None-Match");
		if (ifNoneMatch === etag) {
			return new Response(null, { status: 304, headers: { ETag: etag } });
		}
	}

	return new Response(file, {
		headers: {
			"Content-Type": contentType,
			ETag: etag,
			"Cache-Control": "public, max-age=3600",
		},
	});
}

/**
 * Serve a built asset with immutable cache headers.
 */
export async function serveBuiltAsset(path: string, outDir: string): Promise<Response | null> {
	const response = await serveStatic(path, outDir);
	if (!response) {
		return null;
	}

	response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
	return response;
}

function getExtension(filePath: string): string {
	const lastDot = filePath.lastIndexOf(".");
	return lastDot >= 0 ? filePath.slice(lastDot) : "";
}
