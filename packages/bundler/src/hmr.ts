/**
 * HMR WebSocket server.
 * Runs alongside the HTTP server.
 * Sends messages to connected browsers on file changes.
 *
 * Message types:
 * - { type: "page-update", path: string, html: string }
 * - { type: "css-update", href: string }
 * - { type: "full-reload" }
 * - { type: "error", message: string, file: string, line?: number }
 * - { type: "connected" }
 */
export function createHMRServer(port: number): {
	broadcast: (message: Record<string, unknown>) => void;
	stop: () => void;
} {
	const clients = new Set<{ send: (data: string) => void }>();

	const server = Bun.serve({
		port,
		fetch(req, server) {
			if (server.upgrade(req)) {
				return;
			}
			return new Response("VirexJS HMR Server", { status: 200 });
		},
		websocket: {
			open(ws) {
				clients.add(ws);
				ws.send(JSON.stringify({ type: "connected" }));
			},
			close(ws) {
				clients.delete(ws);
			},
			message() {
				// Client messages not needed for basic HMR
			},
		},
	});

	function broadcast(message: Record<string, unknown>): void {
		const data = JSON.stringify(message);
		for (const client of clients) {
			try {
				client.send(data);
			} catch {
				clients.delete(client);
			}
		}
	}

	return {
		broadcast,
		stop: () => {
			server.stop();
		},
	};
}
