import { resolve } from "node:path";
import { defineAPIRoute } from "virexjs";
import { generateAPIDocs, renderAPIDocsHTML } from "virexjs/server/api-docs";

export const GET = defineAPIRoute(({ request }) => {
	const apiDir = resolve(process.cwd(), "src/api");
	const docs = generateAPIDocs(apiDir, {
		title: "VirexJS Playground API",
		version: "0.1.0",
		baseUrl: "/api",
	});

	// Return HTML or JSON based on Accept header
	const accept = request.headers.get("Accept") ?? "";
	if (accept.includes("application/json")) {
		return Response.json(docs);
	}

	return new Response(renderAPIDocsHTML(docs), {
		headers: { "Content-Type": "text/html; charset=utf-8" },
	});
});
