import { join } from "node:path";

/** Map of file extensions to MIME types */
const MIME_TYPES: Record<string, string> = {
	".html": "text/html",
	".css": "text/css",
	".js": "application/javascript",
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
	".txt": "text/plain",
	".xml": "application/xml",
	".webp": "image/webp",
	".avif": "image/avif",
	".mp4": "video/mp4",
	".webm": "video/webm",
};

/**
 * Try to serve a static file from the public directory.
 * Returns null if file doesn't exist.
 * Sets correct Content-Type based on file extension.
 */
export async function serveStatic(
	path: string,
	publicDir: string,
): Promise<Response | null> {
	// Prevent directory traversal
	if (path.includes("..")) {
		return null;
	}

	const filePath = join(publicDir, path);
	const file = Bun.file(filePath);

	if (!(await file.exists())) {
		return null;
	}

	const ext = getExtension(filePath);
	const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

	return new Response(file, {
		headers: {
			"Content-Type": contentType,
		},
	});
}

/**
 * Serve a built asset with immutable cache headers.
 */
export async function serveBuiltAsset(
	path: string,
	outDir: string,
): Promise<Response | null> {
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
