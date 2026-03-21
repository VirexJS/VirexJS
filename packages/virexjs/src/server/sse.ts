/**
 * Server-Sent Events (SSE) support for VirexJS.
 *
 * Create SSE endpoints that push real-time updates to clients
 * over HTTP without WebSocket complexity.
 *
 * Usage:
 *   import { createSSEStream, defineAPIRoute } from "virexjs";
 *
 *   export const GET = defineAPIRoute(({ request }) => {
 *     const { response, send, close } = createSSEStream(request);
 *
 *     // Send events
 *     send("Hello!");
 *     send({ type: "update", data: { count: 1 } });
 *
 *     // Named events
 *     send("user-joined", "Alice");
 *
 *     // Auto-close on client disconnect
 *     return response;
 *   });
 */

/** SSE stream controller */
export interface SSEController {
	/** The Response object to return from the handler */
	response: Response;
	/** Send a data-only event */
	send(data: string | Record<string, unknown>): void;
	/** Send a named event */
	send(event: string, data: string | Record<string, unknown>): void;
	/** Send a comment (keep-alive) */
	comment(text: string): void;
	/** Close the stream */
	close(): void;
	/** Whether the stream is still open */
	readonly open: boolean;
}

/**
 * Create a Server-Sent Events stream.
 *
 * Returns a controller with `response`, `send()`, and `close()`.
 * The response includes correct SSE headers (text/event-stream).
 */
export function createSSEStream(
	_request?: Request,
	options?: {
		/** Retry interval hint for clients in ms. Default: 3000 */
		retry?: number;
		/** Custom headers */
		headers?: Record<string, string>;
	},
): SSEController {
	const { retry = 3000, headers: customHeaders = {} } = options ?? {};

	let controller: ReadableStreamDefaultController<Uint8Array> | null = null;
	let isOpen = true;
	const encoder = new TextEncoder();

	const stream = new ReadableStream<Uint8Array>({
		start(ctrl) {
			controller = ctrl;
			// Send retry directive
			ctrl.enqueue(encoder.encode(`retry: ${retry}\n\n`));
		},
		cancel() {
			isOpen = false;
		},
	});

	const response = new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache, no-store, must-revalidate",
			Connection: "keep-alive",
			"X-Accel-Buffering": "no",
			...customHeaders,
		},
	});

	function send(eventOrData: string | Record<string, unknown>, data?: string | Record<string, unknown>): void {
		if (!isOpen || !controller) return;

		let eventName: string | undefined;
		let eventData: string;

		if (data !== undefined) {
			// send(event, data) form
			eventName = eventOrData as string;
			eventData = typeof data === "object" ? JSON.stringify(data) : data;
		} else {
			// send(data) form
			eventData = typeof eventOrData === "object"
				? JSON.stringify(eventOrData)
				: eventOrData;
		}

		let message = "";
		if (eventName) {
			message += `event: ${eventName}\n`;
		}

		// Handle multi-line data
		for (const line of eventData.split("\n")) {
			message += `data: ${line}\n`;
		}
		message += "\n";

		try {
			controller.enqueue(encoder.encode(message));
		} catch {
			isOpen = false;
		}
	}

	return {
		response,
		send: send as SSEController["send"],
		comment(text: string): void {
			if (!isOpen || !controller) return;
			try {
				controller.enqueue(encoder.encode(`: ${text}\n\n`));
			} catch {
				isOpen = false;
			}
		},
		close(): void {
			if (!isOpen || !controller) return;
			isOpen = false;
			try {
				controller.close();
			} catch {
				// Already closed
			}
		},
		get open(): boolean {
			return isOpen;
		},
	};
}
