/**
 * File upload handling for VirexJS.
 *
 * Parse multipart form data and extract uploaded files.
 * No external dependencies — uses Web API FormData.
 *
 * Usage:
 *   import { parseUpload } from "virexjs";
 *
 *   export const POST = defineAPIRoute(async ({ request }) => {
 *     const upload = await parseUpload(request, { maxFileSize: 5_000_000 });
 *     if (upload.error) return json({ error: upload.error }, { status: 400 });
 *
 *     for (const file of upload.files) {
 *       await Bun.write(`uploads/${file.name}`, file.data);
 *     }
 *     return json({ uploaded: upload.files.length });
 *   });
 */

export interface UploadedFile {
	/** Original filename */
	name: string;
	/** MIME type */
	type: string;
	/** File size in bytes */
	size: number;
	/** File content as Uint8Array */
	data: Uint8Array;
}

export interface UploadResult {
	/** Parsed files */
	files: UploadedFile[];
	/** Form fields (non-file) */
	fields: Record<string, string>;
	/** Error message if parsing failed */
	error?: string;
}

export interface UploadOptions {
	/** Maximum file size in bytes. Default: 10MB */
	maxFileSize?: number;
	/** Maximum number of files. Default: 10 */
	maxFiles?: number;
	/** Allowed MIME types. Default: all */
	allowedTypes?: string[];
}

/**
 * Parse a multipart upload request.
 */
export async function parseUpload(
	request: Request,
	options?: UploadOptions,
): Promise<UploadResult> {
	const { maxFileSize = 10_000_000, maxFiles = 10, allowedTypes } = options ?? {};

	const contentType = request.headers.get("Content-Type") ?? "";
	if (!contentType.includes("multipart/form-data")) {
		return { files: [], fields: {}, error: "Content-Type must be multipart/form-data" };
	}

	try {
		const formData = await request.formData();
		const files: UploadedFile[] = [];
		const fields: Record<string, string> = {};

		for (const [key, value] of formData.entries()) {
			if (typeof value === "string") {
				fields[key] = value;
				continue;
			}

			// File entry
			if (files.length >= maxFiles) {
				return { files, fields, error: `Maximum ${maxFiles} files allowed` };
			}

			const file = value as File;
			const size = file.size;

			if (size > maxFileSize) {
				return {
					files,
					fields,
					error: `File "${file.name}" exceeds max size (${Math.round(maxFileSize / 1_000_000)}MB)`,
				};
			}

			if (allowedTypes && !allowedTypes.includes(file.type)) {
				return {
					files,
					fields,
					error: `File type "${file.type}" not allowed. Allowed: ${allowedTypes.join(", ")}`,
				};
			}

			const buffer = await file.arrayBuffer();
			files.push({
				name: file.name,
				type: file.type,
				size,
				data: new Uint8Array(buffer),
			});
		}

		return { files, fields };
	} catch {
		return { files: [], fields: {}, error: "Failed to parse upload" };
	}
}
