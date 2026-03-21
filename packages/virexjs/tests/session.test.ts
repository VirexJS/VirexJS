import { describe, expect, test } from "bun:test";
import { type MiddlewareContext, runMiddleware } from "../src/server/middleware";
import { createMemoryStore, session } from "../src/server/session";

interface SessionAPI {
	get: (k: string) => unknown;
	set: (k: string, v: unknown) => void;
	delete: (k: string) => void;
	destroy: () => void;
	getAll: () => Record<string, unknown>;
	id: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSession(ctx: MiddlewareContext): SessionAPI {
	return (ctx.locals as Record<string, unknown>).session as SessionAPI;
}

function makeCtx(cookie?: string): MiddlewareContext {
	const headers = new Headers();
	if (cookie) headers.set("Cookie", cookie);
	return {
		request: new Request("http://localhost/", { headers }),
		params: {},
		locals: {} as Record<string, unknown>,
	};
}

async function runSession(
	options: Parameters<typeof session>[0],
	ctx: MiddlewareContext,
	handler?: () => Promise<Response>,
): Promise<Response> {
	const mw = session(options);
	return runMiddleware([mw], ctx, handler ?? (async () => new Response("ok")));
}

describe("session middleware", () => {
	test("creates a new session", async () => {
		const ctx = makeCtx();
		const res = await runSession({}, ctx);

		expect(res.headers.get("Set-Cookie")).toContain("vrx.sid=");
		expect(res.headers.get("Set-Cookie")).toContain("HttpOnly");
		expect(res.headers.get("Set-Cookie")).toContain("SameSite=Lax");
	});

	test("session.set and session.get work", async () => {
		const store = createMemoryStore();
		let capturedValue: unknown;

		const ctx = makeCtx();
		await runSession({ store }, ctx, async () => {
			const s = getSession(ctx);
			s.set("userId", "abc123");
			capturedValue = s.get("userId");
			return new Response("ok");
		});

		expect(capturedValue).toBe("abc123");
	});

	test("session persists across requests", async () => {
		const store = createMemoryStore();

		// Request 1: Set session data
		const ctx1 = makeCtx();
		const res1 = await runSession({ store }, ctx1, async () => {
			const s = getSession(ctx1);
			s.set("count", 1);
			return new Response("ok");
		});

		// Extract session cookie
		const setCookie = res1.headers.get("Set-Cookie")!;
		const sidMatch = setCookie.match(/vrx\.sid=([^;]+)/);
		const cookie = `vrx.sid=${sidMatch?.[1]}`;

		// Request 2: Read session data
		const ctx2 = makeCtx(cookie);
		let count: unknown;
		await runSession({ store }, ctx2, async () => {
			const s = getSession(ctx2);
			count = s.get("count");
			return new Response("ok");
		});

		expect(count).toBe(1);
	});

	test("session.destroy clears data", async () => {
		const store = createMemoryStore();

		// Request 1: Create session
		const ctx1 = makeCtx();
		const res1 = await runSession({ store }, ctx1, async () => {
			const s = getSession(ctx1);
			s.set("key", "value");
			return new Response("ok");
		});

		const setCookie = res1.headers.get("Set-Cookie")!;
		const sidMatch = setCookie.match(/vrx\.sid=([^;]+)/);
		const cookie = `vrx.sid=${sidMatch?.[1]}`;

		// Request 2: Destroy session
		const ctx2 = makeCtx(cookie);
		const res2 = await runSession({ store }, ctx2, async () => {
			const s = getSession(ctx2);
			s.destroy();
			return new Response("ok");
		});

		// Should clear cookie (Max-Age=0)
		expect(res2.headers.get("Set-Cookie")).toContain("Max-Age=0");
	});

	test("custom cookie name", async () => {
		const ctx = makeCtx();
		const res = await runSession({ cookieName: "my.session" }, ctx);
		expect(res.headers.get("Set-Cookie")).toContain("my.session=");
	});

	test("secure cookie flag", async () => {
		const ctx = makeCtx();
		const res = await runSession({ secure: true }, ctx);
		expect(res.headers.get("Set-Cookie")).toContain("Secure");
	});

	test("session.getAll returns all data", async () => {
		const ctx = makeCtx();
		let allData: unknown;

		await runSession({}, ctx, async () => {
			const s = getSession(ctx);
			s.set("a", 1);
			s.set("b", 2);
			allData = s.getAll();
			return new Response("ok");
		});

		expect(allData).toEqual({ a: 1, b: 2 });
	});

	test("session.id is available", async () => {
		const ctx = makeCtx();
		let sessionId: unknown;

		await runSession({}, ctx, async () => {
			const s = getSession(ctx);
			sessionId = s.id;
			return new Response("ok");
		});

		expect(typeof sessionId).toBe("string");
		expect((sessionId as string).length).toBe(48); // 24 bytes * 2 hex chars
	});
});

describe("createMemoryStore", () => {
	test("stores and retrieves data", async () => {
		const store = createMemoryStore();
		await store.set("sid1", { user: "alice" }, 3600);
		const data = await store.get("sid1");
		expect(data).toEqual({ user: "alice" });
	});

	test("returns null for missing key", async () => {
		const store = createMemoryStore();
		expect(await store.get("nonexistent")).toBeNull();
	});

	test("deletes data", async () => {
		const store = createMemoryStore();
		await store.set("sid2", { key: "val" }, 3600);
		await store.delete("sid2");
		expect(await store.get("sid2")).toBeNull();
	});

	test("expires after maxAge", async () => {
		const store = createMemoryStore();
		await store.set("sid3", { temp: true }, 0); // 0 seconds
		await new Promise((r) => setTimeout(r, 10));
		expect(await store.get("sid3")).toBeNull();
	});
});
