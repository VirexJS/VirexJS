import { afterAll, describe, expect, test } from "bun:test";
import { createHMRServer } from "../src/hmr";
import { generateHMRClientScript } from "../src/hmr-client";

// ─── HMR Server ─────────────────────────────────────────────────────────────

describe("createHMRServer", () => {
	const port = 18900 + Math.floor(Math.random() * 100);
	let hmr: ReturnType<typeof createHMRServer>;

	afterAll(() => {
		hmr?.stop();
	});

	test("starts and returns broadcast/stop", () => {
		hmr = createHMRServer(port);
		expect(typeof hmr.broadcast).toBe("function");
		expect(typeof hmr.stop).toBe("function");
	});

	test("HTTP endpoint returns 200", async () => {
		const res = await fetch(`http://localhost:${port}`);
		expect(res.status).toBe(200);
		const text = await res.text();
		expect(text).toContain("VirexJS HMR Server");
	});

	test("WebSocket connects and receives connected message", async () => {
		const ws = new WebSocket(`ws://localhost:${port}`);
		const messages: string[] = [];

		await new Promise<void>((resolve, reject) => {
			ws.onmessage = (event) => {
				messages.push(event.data as string);
				resolve();
			};
			ws.onerror = reject;
			setTimeout(() => reject(new Error("timeout")), 3000);
		});

		expect(messages).toHaveLength(1);
		const msg = JSON.parse(messages[0]!);
		expect(msg.type).toBe("connected");

		ws.close();
	});

	test("broadcast sends messages to connected clients", async () => {
		const ws = new WebSocket(`ws://localhost:${port}`);
		const messages: string[] = [];

		await new Promise<void>((resolve) => {
			ws.onmessage = (event) => {
				messages.push(event.data as string);
				if (messages.length === 1) {
					// After "connected", send a broadcast
					hmr.broadcast({ type: "full-reload" });
				}
				if (messages.length === 2) {
					resolve();
				}
			};
		});

		const msg = JSON.parse(messages[1]!);
		expect(msg.type).toBe("full-reload");

		ws.close();
	});

	test("broadcast CSS update message", async () => {
		const ws = new WebSocket(`ws://localhost:${port}`);
		const messages: string[] = [];

		await new Promise<void>((resolve) => {
			ws.onmessage = (event) => {
				messages.push(event.data as string);
				if (messages.length === 1) {
					hmr.broadcast({ type: "css-update", href: "/styles.css" });
				}
				if (messages.length === 2) {
					resolve();
				}
			};
		});

		const msg = JSON.parse(messages[1]!);
		expect(msg.type).toBe("css-update");
		expect(msg.href).toBe("/styles.css");

		ws.close();
	});

	test("broadcast error message", async () => {
		const ws = new WebSocket(`ws://localhost:${port}`);
		const messages: string[] = [];

		await new Promise<void>((resolve) => {
			ws.onmessage = (event) => {
				messages.push(event.data as string);
				if (messages.length === 1) {
					hmr.broadcast({ type: "error", message: "Syntax error", file: "app.tsx", line: 42 });
				}
				if (messages.length === 2) {
					resolve();
				}
			};
		});

		const msg = JSON.parse(messages[1]!);
		expect(msg.type).toBe("error");
		expect(msg.message).toBe("Syntax error");
		expect(msg.file).toBe("app.tsx");
		expect(msg.line).toBe(42);

		ws.close();
	});
});

// ─── HMR Client Script ─────────────────────────────────────────────────────

describe("generateHMRClientScript", () => {
	test("generates a JavaScript string", () => {
		const script = generateHMRClientScript(3001);
		expect(typeof script).toBe("string");
		expect(script.length).toBeGreaterThan(100);
	});

	test("includes the correct WebSocket port", () => {
		const script = generateHMRClientScript(4567);
		expect(script).toContain("ws://localhost:4567");
	});

	test("contains connect function", () => {
		const script = generateHMRClientScript(3001);
		expect(script).toContain("function connect()");
	});

	test("handles full-reload message", () => {
		const script = generateHMRClientScript(3001);
		expect(script).toContain("full-reload");
		expect(script).toContain("location.reload()");
	});

	test("handles css-update message", () => {
		const script = generateHMRClientScript(3001);
		expect(script).toContain("css-update");
		expect(script).toContain("updateCSS");
	});

	test("handles error overlay", () => {
		const script = generateHMRClientScript(3001);
		expect(script).toContain("showErrorOverlay");
		expect(script).toContain("vrx-error-overlay");
	});

	test("uses textContent for XSS safety", () => {
		const script = generateHMRClientScript(3001);
		expect(script).toContain("textContent");
		expect(script).not.toContain("innerHTML");
	});

	test("implements reconnection with backoff", () => {
		const script = generateHMRClientScript(3001);
		expect(script).toContain("retryDelay");
		expect(script).toContain("maxRetryDelay");
	});
});
