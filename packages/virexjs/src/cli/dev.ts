import { networkInterfaces } from "node:os";
import { resolve } from "node:path";
import { createHMRServer, generateHMRClientScript, startDevMode } from "@virexjs/bundler";
import { loadConfig } from "../config/index";
import { createServer } from "../server/index";

/**
 * `virex dev` command:
 * 1. Print startup banner
 * 2. Load config from virex.config.ts (or defaults)
 * 3. Scan routes
 * 4. Start HTTP server (Bun.serve)
 * 5. Start HMR WebSocket server
 * 6. Start file watcher
 * 7. Print ready message with URL and timing
 */
export async function dev(args: string[]): Promise<void> {
	const startTime = performance.now();

	// Load config and apply CLI overrides
	const config = await loadConfig();
	const { parseArgs } = await import("./args");
	const flags = parseArgs(args);
	if (typeof flags.port === "string") config.port = Number(flags.port);
	if (typeof flags.host === "string") config.hostname = flags.host;
	if (flags.hmr === false) config.dev.hmr = false;
	if (flags.open === true) config.dev.open = true;
	const srcDir = resolve(process.cwd(), config.srcDir);

	// Start HMR server (try configured port, fallback to alternatives)
	let hmrServer: ReturnType<typeof createHMRServer> | null = null;
	let devScript: string | undefined;
	let hmrPort = config.dev.hmrPort;
	if (config.dev.hmr) {
		const maxAttempts = 10;
		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			try {
				hmrServer = createHMRServer(hmrPort);
				devScript = generateHMRClientScript(hmrPort);
				break;
			} catch {
				hmrPort++;
			}
		}
		if (!hmrServer) {
			console.warn("  ⚠ HMR server could not start (ports in use). Running without HMR.");
		}
	}

	// Start HTTP server (retry on port conflict)
	let routeCount = 0;
	for (let attempt = 0; attempt < 10; attempt++) {
		try {
			const result = createServer(config, { devScript });
			routeCount = result.routeCount;
			break;
		} catch {
			if (attempt === 9) {
				console.error(`  Error: Could not start server on port ${config.port}.`);
				process.exit(1);
			}
			config.port++;
		}
	}

	// Start file watcher
	const watcher = startDevMode({
		srcDir,
		onFileChange: (filePath, _event) => {
			if (hmrServer) {
				if (filePath.endsWith(".css")) {
					hmrServer.broadcast({ type: "css-update", href: filePath });
				} else {
					hmrServer.broadcast({ type: "full-reload" });
				}
			}
		},
	});

	const elapsed = Math.round(performance.now() - startTime);
	const networkIP = getNetworkIP();

	console.log(`
  ⚡ VirexJS v0.1.0

  → Local:   http://localhost:${config.port}${networkIP ? `\n  → Network: http://${networkIP}:${config.port}` : ""}${hmrServer ? `\n  → HMR:     ws://localhost:${hmrPort}` : ""}

  Ready in ${elapsed}ms · ${routeCount} routes found
`);

	// Handle graceful shutdown
	process.on("SIGINT", () => {
		watcher.stop();
		hmrServer?.stop();
		process.exit(0);
	});
}

function getNetworkIP(): string | null {
	const interfaces = networkInterfaces();
	for (const iface of Object.values(interfaces)) {
		if (!iface) continue;
		for (const alias of iface) {
			if (alias.family === "IPv4" && !alias.internal) {
				return alias.address;
			}
		}
	}
	return null;
}
