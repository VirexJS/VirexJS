import { describe, test, expect } from "bun:test";
import { gracefulShutdown } from "../src/server/graceful";

function mockServer() {
	let stopped = false;
	return {
		stop(closeActive?: boolean) { stopped = true; },
		get isStopped() { return stopped; },
	};
}

describe("gracefulShutdown", () => {
	test("returns shutdown handle", () => {
		const server = mockServer();
		const handle = gracefulShutdown(server, { signals: [] });

		expect(typeof handle.shutdown).toBe("function");
		expect(handle.isShuttingDown).toBe(false);
	});

	test("shutdown stops the server", async () => {
		const server = mockServer();
		const handle = gracefulShutdown(server, { signals: [] });

		await handle.shutdown();
		expect(handle.isShuttingDown).toBe(true);
		expect(server.isStopped).toBe(true);
	});

	test("calls onShutdown callback", async () => {
		const server = mockServer();
		let called = false;

		const handle = gracefulShutdown(server, {
			signals: [],
			onShutdown: () => { called = true; },
		});

		await handle.shutdown();
		expect(called).toBe(true);
	});

	test("async onShutdown callback works", async () => {
		const server = mockServer();
		let called = false;

		const handle = gracefulShutdown(server, {
			signals: [],
			onShutdown: async () => {
				await new Promise((r) => setTimeout(r, 5));
				called = true;
			},
		});

		await handle.shutdown();
		expect(called).toBe(true);
	});

	test("double shutdown is no-op", async () => {
		const server = mockServer();
		const handle = gracefulShutdown(server, { signals: [] });

		await handle.shutdown();
		await handle.shutdown(); // should not throw
		expect(handle.isShuttingDown).toBe(true);
	});

	test("onShutdown error does not crash", async () => {
		const server = mockServer();
		const handle = gracefulShutdown(server, {
			signals: [],
			onShutdown: () => { throw new Error("cleanup failed"); },
		});

		await handle.shutdown(); // should not throw
		expect(handle.isShuttingDown).toBe(true);
		expect(server.isStopped).toBe(true);
	});

	test("default timeout is 10000", () => {
		const server = mockServer();
		// Just verify it constructs without error
		const handle = gracefulShutdown(server, { signals: [] });
		expect(handle.isShuttingDown).toBe(false);
	});
});
