import { readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { loadConfig } from "../config/index";

/**
 * `virex info` — display project information.
 * Shows routes, islands, API endpoints, config, and build stats.
 */
export async function info(_args: string[]): Promise<void> {
	const config = await loadConfig();
	const cwd = process.cwd();
	const srcDir = resolve(cwd, config.srcDir);

	const pages = countFiles(resolve(srcDir, "pages"), [".tsx", ".ts"]);
	const islands = countFiles(resolve(srcDir, "islands"), [".tsx"]);
	const api = countFiles(resolve(srcDir, "api"), [".ts"]);
	const middleware = countFiles(resolve(srcDir, "middleware"), [".ts"]);
	const components = countFiles(resolve(srcDir, "components"), [".tsx"]);

	console.log(`
  VirexJS Project Info

  Source:     ${config.srcDir}/
  Output:     ${config.outDir}/
  Port:       ${config.port}
  Render:     ${config.render}

  Pages:      ${pages}
  Islands:    ${islands}
  API routes: ${api}
  Middleware: ${middleware}
  Components: ${components}

  Config:
    HMR:        ${config.dev.hmr ? "enabled" : "disabled"} (port ${config.dev.hmrPort})
    Hydration:  ${config.islands.hydration}
    CSS engine: ${config.css.engine}
    Minify:     ${config.build.minify}
    Plugins:    ${config.plugins?.length ?? 0}

  Runtime:    Bun ${Bun.version}
`);
}

function countFiles(dir: string, extensions: string[]): number {
	try {
		const entries = readdirSync(dir);
		let count = 0;
		for (const entry of entries) {
			const fullPath = resolve(dir, entry);
			try {
				const stat = statSync(fullPath);
				if (stat.isFile() && extensions.some((ext) => entry.endsWith(ext))) {
					count++;
				} else if (stat.isDirectory()) {
					count += countFiles(fullPath, extensions);
				}
			} catch {}
		}
		return count;
	} catch {
		return 0;
	}
}
