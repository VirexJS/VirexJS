import { resolve } from "node:path";
import { loadConfig } from "../config/index";
import { serveStatic } from "../server/static";

/**
 * `virex preview` command:
 * Preview a production build locally by serving the dist/ directory.
 */
export async function preview(_args: string[]): Promise<void> {
	const config = await loadConfig();
	const cwd = process.cwd();
	const outDir = resolve(cwd, config.outDir);

	const server = Bun.serve({
		port: config.port + 100,
		hostname: config.hostname,

		async fetch(request: Request): Promise<Response> {
			const url = new URL(request.url);
			let pathname = url.pathname;

			// Try exact path
			let response = await serveStatic(pathname, outDir);
			if (response) return response;

			// Try path/index.html
			if (!pathname.endsWith("/")) {
				pathname += "/";
			}
			response = await serveStatic(pathname + "index.html", outDir);
			if (response) return response;

			// Fallback to 404
			response = await serveStatic("/404.html", outDir);
			if (response) {
				return new Response(response.body, {
					status: 404,
					headers: response.headers,
				});
			}

			return new Response("404 — Not Found", { status: 404 });
		},
	});

	console.log(`
  ⚡ VirexJS v0.1.0 — Preview Mode

  → Local: http://localhost:${config.port + 100}
  → Serving: ${outDir}

  Press Ctrl+C to stop
`);

	process.on("SIGINT", () => {
		server.stop();
		process.exit(0);
	});
}
