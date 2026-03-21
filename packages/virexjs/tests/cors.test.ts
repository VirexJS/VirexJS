import { describe, expect, test } from "bun:test";
import { cors } from "../src/server/cors";
import { type MiddlewareContext, runMiddleware } from "../src/server/middleware";

function makeCtx(method: string, origin?: string): MiddlewareContext {
	const headers = new Headers();
	if (origin) headers.set("Origin", origin);
	if (method === "OPTIONS") headers.set("Access-Control-Request-Headers", "Content-Type");
	return {
		request: new Request("http://localhost/api/test", { method, headers }),
		params: {},
		locals: {},
	};
}

async function runCors(
	options: Parameters<typeof cors>[0],
	method: string,
	origin?: string,
): Promise<Response> {
	const mw = cors(options);
	return runMiddleware(
		[mw],
		makeCtx(method, origin),
		async () => new Response("ok", { status: 200 }),
	);
}

// ─── Wildcard origin ────────────────────────────────────────────────────────

describe("cors wildcard", () => {
	test("adds Access-Control-Allow-Origin: * by default", async () => {
		const res = await runCors({}, "GET", "http://example.com");
		expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
	});

	test("preflight returns 204 with headers", async () => {
		const res = await runCors({}, "OPTIONS", "http://example.com");
		expect(res.status).toBe(204);
		expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
		expect(res.headers.get("Access-Control-Allow-Methods")).toContain("GET");
		expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
	});
});

// ─── Specific origin ────────────────────────────────────────────────────────

describe("cors specific origin", () => {
	test("allows matching origin", async () => {
		const res = await runCors({ origin: "http://example.com" }, "GET", "http://example.com");
		expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://example.com");
	});

	test("rejects non-matching origin", async () => {
		const res = await runCors({ origin: "http://example.com" }, "GET", "http://evil.com");
		expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
	});

	test("adds Vary: Origin for specific origins", async () => {
		const res = await runCors({ origin: "http://example.com" }, "GET", "http://example.com");
		expect(res.headers.get("Vary")).toContain("Origin");
	});
});

// ─── Origin array ───────────────────────────────────────────────────────────

describe("cors origin array", () => {
	test("allows origin in array", async () => {
		const res = await runCors({ origin: ["http://a.com", "http://b.com"] }, "GET", "http://b.com");
		expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://b.com");
	});

	test("rejects origin not in array", async () => {
		const res = await runCors({ origin: ["http://a.com", "http://b.com"] }, "GET", "http://c.com");
		expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
	});
});

// ─── Origin function ────────────────────────────────────────────────────────

describe("cors origin function", () => {
	test("allows when function returns true", async () => {
		const res = await runCors(
			{ origin: (o) => o.endsWith(".example.com") },
			"GET",
			"http://app.example.com",
		);
		expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://app.example.com");
	});

	test("rejects when function returns false", async () => {
		const res = await runCors(
			{ origin: (o) => o.endsWith(".example.com") },
			"GET",
			"http://evil.com",
		);
		expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
	});
});

// ─── Credentials ────────────────────────────────────────────────────────────

describe("cors credentials", () => {
	test("sets credentials header when enabled", async () => {
		const res = await runCors({ credentials: true }, "GET", "http://example.com");
		expect(res.headers.get("Access-Control-Allow-Credentials")).toBe("true");
	});

	test("no credentials header by default", async () => {
		const res = await runCors({}, "GET", "http://example.com");
		expect(res.headers.get("Access-Control-Allow-Credentials")).toBeNull();
	});

	test("credentials on preflight", async () => {
		const res = await runCors({ credentials: true }, "OPTIONS", "http://example.com");
		expect(res.headers.get("Access-Control-Allow-Credentials")).toBe("true");
	});
});

// ─── Custom methods / headers ───────────────────────────────────────────────

describe("cors custom methods and headers", () => {
	test("custom allowed methods on preflight", async () => {
		const res = await runCors({ methods: ["GET", "POST"] }, "OPTIONS", "http://example.com");
		expect(res.headers.get("Access-Control-Allow-Methods")).toBe("GET, POST");
	});

	test("custom allowed headers on preflight", async () => {
		const res = await runCors(
			{ allowedHeaders: ["X-Custom", "Authorization"] },
			"OPTIONS",
			"http://example.com",
		);
		expect(res.headers.get("Access-Control-Allow-Headers")).toBe("X-Custom, Authorization");
	});

	test("mirrors request headers when no allowedHeaders set", async () => {
		const res = await runCors({}, "OPTIONS", "http://example.com");
		expect(res.headers.get("Access-Control-Allow-Headers")).toBe("Content-Type");
	});

	test("exposed headers on actual request", async () => {
		const res = await runCors({ exposedHeaders: ["X-Total-Count"] }, "GET", "http://example.com");
		expect(res.headers.get("Access-Control-Expose-Headers")).toBe("X-Total-Count");
	});
});

// ─── Max-Age ────────────────────────────────────────────────────────────────

describe("cors max-age", () => {
	test("default max-age is 86400", async () => {
		const res = await runCors({}, "OPTIONS", "http://example.com");
		expect(res.headers.get("Access-Control-Max-Age")).toBe("86400");
	});

	test("custom max-age", async () => {
		const res = await runCors({ maxAge: 3600 }, "OPTIONS", "http://example.com");
		expect(res.headers.get("Access-Control-Max-Age")).toBe("3600");
	});
});
