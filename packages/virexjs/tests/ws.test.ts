import { describe, test, expect, afterAll } from "bun:test";
import { defineWSRoute, createWSServer } from "../src/server/ws";

describe("defineWSRoute", () => {
	test("returns the route definition", () => {
		const route = defineWSRoute({
			path: "/ws/echo",
			open(ws) { ws.send("connected"); },
			message(ws, msg) { ws.send(`echo: ${msg}`); },
		});
		expect(route.path).toBe("/ws/echo");
		expect(typeof route.open).toBe("function");
		expect(typeof route.message).toBe("function");
	});
});

describe("createWSServer", () => {
	const port = 19100 + Math.floor(Math.random() * 100);
	let server: ReturnType<typeof createWSServer>;

	afterAll(() => {
		server?.stop();
	});

	test("starts and accepts connections", async () => {
		const events: string[] = [];

		server = createWSServer({
			port,
			routes: [
				defineWSRoute({
					path: "/ws/test",
					open() { events.push("open"); },
					message(_ws, msg) { events.push(`msg:${msg}`); },
					close() { events.push("close"); },
				}),
			],
		});

		expect(server.port).toBe(port);

		const ws = new WebSocket(`ws://localhost:${port}/ws/test`);
		await new Promise<void>((resolve) => {
			ws.onopen = () => {
				ws.send("hello");
				setTimeout(() => {
					ws.close();
					setTimeout(resolve, 50);
				}, 50);
			};
		});

		expect(events).toContain("open");
		expect(events).toContain("msg:hello");
		expect(events).toContain("close");
	});

	test("echo route works", async () => {
		const echoServer = createWSServer({
			port: port + 1,
			routes: [
				defineWSRoute({
					path: "/ws/echo",
					message(ws, msg) { ws.send(`echo: ${msg}`); },
				}),
			],
		});

		const messages: string[] = [];
		const ws = new WebSocket(`ws://localhost:${port + 1}/ws/echo`);

		await new Promise<void>((resolve) => {
			ws.onopen = () => ws.send("ping");
			ws.onmessage = (e) => {
				messages.push(e.data as string);
				ws.close();
				setTimeout(resolve, 50);
			};
		});

		expect(messages).toEqual(["echo: ping"]);
		echoServer.stop();
	});

	test("returns 404 for unknown path", async () => {
		const res = await fetch(`http://localhost:${port}/ws/unknown`);
		expect(res.status).toBe(404);
	});

	test("upgrade validation can reject", async () => {
		const guardedServer = createWSServer({
			port: port + 2,
			routes: [
				defineWSRoute({
					path: "/ws/guarded",
					upgrade(req) {
						return req.headers.get("X-Token") === "secret";
					},
					message(ws, msg) { ws.send(msg); },
				}),
			],
		});

		// Without token — should get 403
		const res = await fetch(`http://localhost:${port + 2}/ws/guarded`);
		expect(res.status).toBe(403);

		guardedServer.stop();
	});
});
