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
 * - { type: "ping" } / { type: "pong" }  (heartbeat)
 *
 * Features:
 * - Heartbeat ping/pong to detect dead connections
 * - Debounced broadcasts to prevent rapid-fire reloads
 * - Clean dead client removal
 */
export function createHMRServer(port: number): {
	broadcast: (message: Record<string, unknown>) => void;
	stop: () => void;
	clientCount: () => number;
} {
	const clients = new Set<{ send: (data: string) => void; readyState: number }>();
	let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

	// Debounce: coalesce rapid file changes into one reload
	let pendingReload: ReturnType<typeof setTimeout> | null = null;
	const DEBOUNCE_MS = 50;

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
			message(_ws, message) {
				// Handle pong responses from client heartbeat
				try {
					const msg = JSON.parse(String(message));
					if (msg.type === "pong") return;
				} catch {
					// Ignore malformed messages
				}
			},
		},
	});

	// Heartbeat: ping clients every 30s, prune dead connections
	heartbeatTimer = setInterval(() => {
		const pingData = JSON.stringify({ type: "ping" });
		for (const client of clients) {
			try {
				if (client.readyState !== 1) {
					clients.delete(client);
				} else {
					client.send(pingData);
				}
			} catch {
				clients.delete(client);
			}
		}
	}, 30_000);

	function broadcast(message: Record<string, unknown>): void {
		// Debounce full-reload and page-update to prevent rapid fire
		if (message.type === "full-reload" || message.type === "page-update") {
			if (pendingReload) clearTimeout(pendingReload);
			pendingReload = setTimeout(() => {
				pendingReload = null;
				sendToAll(message);
			}, DEBOUNCE_MS);
			return;
		}
		// CSS updates sent immediately (no flicker)
		sendToAll(message);
	}

	function sendToAll(message: Record<string, unknown>): void {
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
		clientCount: () => clients.size,
		stop: () => {
			if (heartbeatTimer) clearInterval(heartbeatTimer);
			if (pendingReload) clearTimeout(pendingReload);
			server.stop();
		},
	};
}
