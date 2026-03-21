import { describe, expect, test } from "bun:test";
import { guard } from "../src/auth/guard";
import { type MiddlewareContext, runMiddleware } from "../src/server/middleware";

function makeCtx(path: string, extras?: Partial<MiddlewareContext>): MiddlewareContext {
	return {
		request: new Request(`http://localhost${path}`),
		params: {},
		locals: {},
		...extras,
	};
}

async function runGuard(
	options: Parameters<typeof guard>[0],
	path: string,
	extras?: Partial<MiddlewareContext>,
): Promise<Response> {
	const mw = guard(options);
	return runMiddleware(
		[mw],
		makeCtx(path, extras),
		async () => new Response("ok", { status: 200 }),
	);
}

describe("guard with string match", () => {
	test("blocks matching path when check fails", async () => {
		const res = await runGuard(
			{
				match: "/admin",
				check: () => false,
			},
			"/admin/dashboard",
		);
		expect(res.status).toBe(403);
	});

	test("allows matching path when check passes", async () => {
		const res = await runGuard(
			{
				match: "/admin",
				check: () => true,
			},
			"/admin/dashboard",
		);
		expect(res.status).toBe(200);
	});

	test("skips non-matching path", async () => {
		const res = await runGuard(
			{
				match: "/admin",
				check: () => false,
			},
			"/public",
		);
		expect(res.status).toBe(200);
	});
});

describe("guard with array match", () => {
	test("matches exact paths", async () => {
		const opts = {
			match: ["/dashboard", "/settings"],
			check: () => false,
		};
		expect((await runGuard(opts, "/dashboard")).status).toBe(403);
		expect((await runGuard(opts, "/settings")).status).toBe(403);
		expect((await runGuard(opts, "/public")).status).toBe(200);
	});
});

describe("guard with regex match", () => {
	test("matches regex pattern", async () => {
		const res = await runGuard(
			{
				match: /^\/api\//,
				check: () => false,
			},
			"/api/users",
		);
		expect(res.status).toBe(403);
	});

	test("skips non-matching regex", async () => {
		const res = await runGuard(
			{
				match: /^\/api\//,
				check: () => false,
			},
			"/pages/about",
		);
		expect(res.status).toBe(200);
	});
});

describe("guard with function match", () => {
	test("uses function to match", async () => {
		const res = await runGuard(
			{
				match: (p) => p.includes("secret"),
				check: () => false,
			},
			"/the-secret-page",
		);
		expect(res.status).toBe(403);
	});
});

describe("guard check with context", () => {
	test("check receives middleware context", async () => {
		const res = await runGuard(
			{
				match: "/protected",
				check: (ctx) => ctx.locals.isAuthenticated === true,
			},
			"/protected",
			{ locals: { isAuthenticated: true } },
		);
		expect(res.status).toBe(200);
	});

	test("check can inspect headers", async () => {
		const headers = new Headers({ Authorization: "Bearer valid" });
		const res = await runGuard(
			{
				match: "/api",
				check: (ctx) => !!ctx.request.headers.get("Authorization"),
			},
			"/api/data",
			{ request: new Request("http://localhost/api/data", { headers }) },
		);
		expect(res.status).toBe(200);
	});

	test("async check works", async () => {
		const res = await runGuard(
			{
				match: "/protected",
				check: async () => {
					await new Promise((r) => setTimeout(r, 1));
					return true;
				},
			},
			"/protected",
		);
		expect(res.status).toBe(200);
	});
});

describe("guard onDenied", () => {
	test("custom denied response", async () => {
		const res = await runGuard(
			{
				match: "/admin",
				check: () => false,
				onDenied: () => new Response("Custom denied", { status: 401 }),
			},
			"/admin",
		);
		expect(res.status).toBe(401);
		expect(await res.text()).toBe("Custom denied");
	});

	test("redirect on denied", async () => {
		const res = await runGuard(
			{
				match: "/dashboard",
				check: () => false,
				onDenied: () =>
					new Response(null, {
						status: 302,
						headers: { Location: "/login" },
					}),
			},
			"/dashboard",
		);
		expect(res.status).toBe(302);
		expect(res.headers.get("Location")).toBe("/login");
	});

	test("default denied is 403", async () => {
		const res = await runGuard(
			{
				match: "/admin",
				check: () => false,
			},
			"/admin",
		);
		expect(res.status).toBe(403);
		expect(await res.text()).toBe("Forbidden");
	});
});
