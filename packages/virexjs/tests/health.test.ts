import { describe, expect, test } from "bun:test";
import { healthCheck } from "../src/server/health";
import { type MiddlewareContext, runMiddleware } from "../src/server/middleware";

function makeCtx(path: string): MiddlewareContext {
	return {
		request: new Request(`http://localhost${path}`),
		params: {},
		locals: {},
	};
}

describe("healthCheck", () => {
	test("responds on /health by default", async () => {
		const mw = healthCheck();
		const res = await runMiddleware([mw], makeCtx("/health"), async () => new Response("page"));

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.status).toBe("healthy");
		expect(body.timestamp).toBeDefined();
		expect(typeof body.uptime).toBe("number");
	});

	test("passes through non-health requests", async () => {
		const mw = healthCheck();
		const res = await runMiddleware([mw], makeCtx("/api/users"), async () => new Response("page"));

		expect(await res.text()).toBe("page");
	});

	test("custom path", async () => {
		const mw = healthCheck({ path: "/status" });

		const res1 = await runMiddleware([mw], makeCtx("/status"), async () => new Response("page"));
		expect(res1.status).toBe(200);

		const res2 = await runMiddleware([mw], makeCtx("/health"), async () => new Response("page"));
		expect(await res2.text()).toBe("page");
	});

	test("healthy checks return 200", async () => {
		const mw = healthCheck({
			checks: {
				db: () => true,
				cache: () => true,
			},
		});
		const res = await runMiddleware([mw], makeCtx("/health"), async () => new Response("page"));
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.status).toBe("healthy");
		expect(body.checks.db.status).toBe("healthy");
		expect(body.checks.cache.status).toBe("healthy");
		expect(typeof body.checks.db.ms).toBe("number");
	});

	test("unhealthy check returns 503", async () => {
		const mw = healthCheck({
			checks: {
				db: () => true,
				cache: () => false,
			},
		});
		const res = await runMiddleware([mw], makeCtx("/health"), async () => new Response("page"));
		const body = await res.json();

		expect(res.status).toBe(503);
		expect(body.status).toBe("unhealthy");
		expect(body.checks.db.status).toBe("healthy");
		expect(body.checks.cache.status).toBe("unhealthy");
	});

	test("throwing check is unhealthy", async () => {
		const mw = healthCheck({
			checks: {
				db: () => {
					throw new Error("connection failed");
				},
			},
		});
		const res = await runMiddleware([mw], makeCtx("/health"), async () => new Response("page"));
		const body = await res.json();

		expect(res.status).toBe(503);
		expect(body.checks.db.status).toBe("unhealthy");
	});

	test("async checks work", async () => {
		const mw = healthCheck({
			checks: {
				external: async () => {
					await new Promise((r) => setTimeout(r, 1));
					return true;
				},
			},
		});
		const res = await runMiddleware([mw], makeCtx("/health"), async () => new Response("page"));
		const body = await res.json();

		expect(body.status).toBe("healthy");
		expect(body.checks.external.ms).toBeGreaterThanOrEqual(0);
	});

	test("no checks returns healthy with no checks field", async () => {
		const mw = healthCheck();
		const res = await runMiddleware([mw], makeCtx("/health"), async () => new Response("page"));
		const body = await res.json();

		expect(body.status).toBe("healthy");
		expect(body.checks).toBeUndefined();
	});
});
