import { describe, test, expect } from "bun:test";
import { csrf } from "../src/server/csrf";
import { runMiddleware, type MiddlewareContext } from "../src/server/middleware";

function makeCtx(method: string, opts?: { cookie?: string; header?: string; query?: string }): MiddlewareContext {
	const headers = new Headers();
	if (opts?.cookie) headers.set("Cookie", opts.cookie);
	if (opts?.header) headers.set("X-CSRF-Token", opts.header);

	let url = "http://localhost/form";
	if (opts?.query) url += `?_csrf=${opts.query}`;

	return {
		request: new Request(url, { method, headers }),
		params: {},
		locals: {} as Record<string, unknown>,
	};
}

describe("csrf middleware", () => {
	test("GET requests pass through and set token cookie", async () => {
		const mw = csrf();
		const ctx = makeCtx("GET");
		const res = await runMiddleware([mw], ctx, async () => new Response("ok"));

		expect(res.status).toBe(200);
		expect(res.headers.get("Set-Cookie")).toContain("vrx.csrf=");
		expect(ctx.locals.csrfToken).toBeTruthy();
		expect(typeof ctx.locals.csrfToken).toBe("string");
	});

	test("POST without token returns 403", async () => {
		const mw = csrf();
		const ctx = makeCtx("POST");
		const res = await runMiddleware([mw], ctx, async () => new Response("ok"));

		expect(res.status).toBe(403);
		expect(await res.text()).toContain("CSRF");
	});

	test("POST with valid header token passes", async () => {
		const mw = csrf();

		// First, GET to get a token
		const getCtx = makeCtx("GET");
		await runMiddleware([mw], getCtx, async () => new Response("ok"));
		const token = getCtx.locals.csrfToken as string;

		// POST with token in header
		const postCtx = makeCtx("POST", {
			cookie: `vrx.csrf=${token}`,
			header: token,
		});
		const res = await runMiddleware([mw], postCtx, async () => new Response("ok"));
		expect(res.status).toBe(200);
	});

	test("POST with valid query token passes", async () => {
		const mw = csrf();

		const getCtx = makeCtx("GET");
		await runMiddleware([mw], getCtx, async () => new Response("ok"));
		const token = getCtx.locals.csrfToken as string;

		const postCtx = makeCtx("POST", {
			cookie: `vrx.csrf=${token}`,
			query: token,
		});
		const res = await runMiddleware([mw], postCtx, async () => new Response("ok"));
		expect(res.status).toBe(200);
	});

	test("POST with wrong token returns 403", async () => {
		const mw = csrf();

		const getCtx = makeCtx("GET");
		await runMiddleware([mw], getCtx, async () => new Response("ok"));
		const token = getCtx.locals.csrfToken as string;

		const postCtx = makeCtx("POST", {
			cookie: `vrx.csrf=${token}`,
			header: "wrong-token",
		});
		const res = await runMiddleware([mw], postCtx, async () => new Response("ok"));
		expect(res.status).toBe(403);
	});

	test("ignored paths skip CSRF check", async () => {
		const mw = csrf({ ignorePaths: ["/api/webhook"] });

		const ctx = {
			request: new Request("http://localhost/api/webhook", { method: "POST" }),
			params: {},
			locals: {} as Record<string, unknown>,
		};
		const res = await runMiddleware([mw], ctx, async () => new Response("ok"));
		expect(res.status).toBe(200);
	});

	test("PUT and DELETE also require token", async () => {
		const mw = csrf();

		for (const method of ["PUT", "DELETE", "PATCH"]) {
			const ctx = makeCtx(method);
			const res = await runMiddleware([mw], ctx, async () => new Response("ok"));
			expect(res.status).toBe(403);
		}
	});

	test("token is 64 chars hex", async () => {
		const mw = csrf();
		const ctx = makeCtx("GET");
		await runMiddleware([mw], ctx, async () => new Response("ok"));

		const token = ctx.locals.csrfToken as string;
		expect(token.length).toBe(64);
		expect(token).toMatch(/^[0-9a-f]+$/);
	});
});
