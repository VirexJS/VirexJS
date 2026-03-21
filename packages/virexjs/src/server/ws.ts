/**
 * WebSocket route support for VirexJS.
 *
 * Built on Bun's native WebSocket API. Define typed WebSocket
 * handlers with connect/message/close lifecycle hooks.
 *
 * Usage:
 *   import { defineWSRoute, createWSServer } from "virexjs";
 *
 *   const chat = defineWSRoute({
 *     path: "/ws/chat",
 *     open(ws) { ws.send("Welcome!"); },
 *     message(ws, msg) { ws.send(`Echo: ${msg}`); },
 *     close(ws) { console.log("Client left"); },
 *   });
 *
 *   const wss = createWSServer({ port: 3002, routes: [chat] });
 */

/** WebSocket connection wrapper */
export interface WSConnection {
	/** Send a text message */
	send: (data: string) => void;
	/** Send binary data */
	sendBinary: (data: Uint8Array) => void;
	/** Close the connection */
	close: (code?: number, reason?: string) => void;
	/** Connection metadata */
	data: Record<string, unknown>;
}

/** WebSocket route definition */
export interface WSRoute {
	/** URL path for this WebSocket endpoint */
	path: string;
	/** Called when a client connects */
	open?: (ws: WSConnection) => void;
	/** Called when a message is received */
	message?: (ws: WSConnection, message: string) => void;
	/** Called when a binary message is received */
	binaryMessage?: (ws: WSConnection, data: Uint8Array) => void;
	/** Called when a client disconnects */
	close?: (ws: WSConnection, code: number, reason: string) => void;
	/** Validate the upgrade request (return false to reject) */
	upgrade?: (request: Request) => boolean | Record<string, unknown>;
}

/**
 * Helper to define a WebSocket route with type safety.
 */
export function defineWSRoute(route: WSRoute): WSRoute {
	return route;
}

/**
 * Create a WebSocket server with multiple route handlers.
 */
export function createWSServer(options: {
	port: number;
	routes: WSRoute[];
	hostname?: string;
}): { stop: () => void; port: number; clients: ReadonlySet<WSConnection> } {
	const { port, routes, hostname = "localhost" } = options;
	const routeMap = new Map<string, WSRoute>();
	const allClients = new Set<WSConnection>();

	for (const route of routes) {
		routeMap.set(route.path, route);
	}

	const server = Bun.serve({
		port,
		hostname,
		fetch(req, server) {
			const url = new URL(req.url);
			const route = routeMap.get(url.pathname);

			if (!route) {
				return new Response("Not Found", { status: 404 });
			}

			// Run upgrade validation if defined
			if (route.upgrade) {
				const result = route.upgrade(req);
				if (result === false) {
					return new Response("Forbidden", { status: 403 });
				}
				const data = typeof result === "object" ? result : {};
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				if (server.upgrade(req, { data: { ...data, _route: url.pathname } } as any)) {
					return;
				}
			} else {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				if (server.upgrade(req, { data: { _route: url.pathname } } as any)) {
					return;
				}
			}

			return new Response("Upgrade Required", { status: 426 });
		},
		websocket: {
			open(ws) {
				const routePath = (ws.data as unknown as Record<string, unknown>)?._route as string;
				const route = routeMap.get(routePath);
				const conn = wrapWS(ws);
				allClients.add(conn);
				(ws.data as unknown as Record<string, unknown>).__conn = conn;
				route?.open?.(conn);
			},
			message(ws, message) {
				const routePath = (ws.data as unknown as Record<string, unknown>)?._route as string;
				const route = routeMap.get(routePath);
				const conn = (ws.data as unknown as Record<string, unknown>).__conn as WSConnection;

				if (typeof message === "string") {
					route?.message?.(conn, message);
				} else {
					const bytes = message instanceof ArrayBuffer
						? new Uint8Array(message)
						: message;
					route?.binaryMessage?.(conn, bytes);
				}
			},
			close(ws, code, reason) {
				const routePath = (ws.data as unknown as Record<string, unknown>)?._route as string;
				const route = routeMap.get(routePath);
				const conn = (ws.data as unknown as Record<string, unknown>).__conn as WSConnection;
				allClients.delete(conn);
				route?.close?.(conn, code, reason);
			},
		},
	});

	return {
		stop: () => server.stop(),
		port,
		clients: allClients,
	};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrapWS(ws: any): WSConnection {
	return {
		send: (data: string) => ws.send(data),
		sendBinary: (data: Uint8Array) => ws.send(data),
		close: (code?: number, reason?: string) => ws.close(code, reason),
		data: (ws.data as unknown as Record<string, unknown>) ?? {},
	};
}
