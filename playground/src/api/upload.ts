import { defineAPIRoute, json, parseUpload } from "virexjs";

/** File upload endpoint — demonstrates parseUpload() */
export const POST = defineAPIRoute(async ({ request }) => {
	const result = await parseUpload(request, {
		maxFileSize: 5_000_000, // 5MB
		maxFiles: 5,
		allowedTypes: ["image/jpeg", "image/png", "image/webp", "text/plain", "application/pdf"],
	});

	if (result.error) {
		return json({ error: result.error }, { status: 400 });
	}

	const fileInfo = result.files.map((f) => ({
		name: f.name,
		type: f.type,
		size: f.size,
		sizeFormatted: f.size > 1024 ? `${(f.size / 1024).toFixed(1)} KB` : `${f.size} B`,
	}));

	return json({
		uploaded: result.files.length,
		files: fileInfo,
		fields: result.fields,
	});
});
