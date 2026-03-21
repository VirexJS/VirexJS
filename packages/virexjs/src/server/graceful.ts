/**
 * Graceful shutdown handler for VirexJS servers.
 *
 * Listens for SIGINT/SIGTERM signals and gracefully stops the server,
 * allowing in-flight requests to complete before exiting.
 *
 * Usage:
 *   import { gracefulShutdown } from "virexjs";
 *
 *   const { server } = createServer(config);
 *   gracefulShutdown(server, {
 *     timeout: 10_000,
 *     onShutdown: async () => {
 *       await db.close();
 *       console.log("Cleanup complete");
 *     },
 *   });
 */

export interface ShutdownOptions {
	/** Maximum time to wait for in-flight requests (ms). Default: 10_000 */
	timeout?: number;
	/** Callback to run during shutdown (close DB, flush logs, etc.) */
	onShutdown?: () => void | Promise<void>;
	/** Signals to listen for. Default: ["SIGINT", "SIGTERM"] */
	signals?: string[];
}

export interface ShutdownHandle {
	/** Manually trigger shutdown */
	shutdown: () => Promise<void>;
	/** Whether shutdown has been initiated */
	readonly isShuttingDown: boolean;
}

/**
 * Register graceful shutdown handlers for a Bun server.
 */
export function gracefulShutdown(
	server: { stop: (closeActiveConnections?: boolean) => void },
	options?: ShutdownOptions,
): ShutdownHandle {
	const { timeout = 10_000, onShutdown, signals = ["SIGINT", "SIGTERM"] } = options ?? {};

	let shuttingDown = false;

	async function shutdown(): Promise<void> {
		if (shuttingDown) return;
		shuttingDown = true;

		console.log("\n  Shutting down gracefully...");

		// Run user cleanup
		if (onShutdown) {
			try {
				await onShutdown();
			} catch (err) {
				console.error("  Shutdown callback error:", err);
			}
		}

		// Stop accepting new connections, let existing finish
		try {
			server.stop(false);
		} catch {
			// Already stopped
		}

		// Force exit after timeout
		const timer = setTimeout(() => {
			console.error("  Forced shutdown after timeout");
			process.exit(1);
		}, timeout);

		// Don't let the timer keep the process alive
		if (timer && typeof timer === "object" && "unref" in timer) {
			(timer as NodeJS.Timeout).unref();
		}

		console.log("  Shutdown complete");
	}

	// Register signal handlers
	for (const signal of signals) {
		process.on(signal, () => {
			shutdown().then(() => process.exit(0));
		});
	}

	return {
		shutdown,
		get isShuttingDown() {
			return shuttingDown;
		},
	};
}
