import { describe, expect, test } from "bun:test";
import { i18nRouting } from "../src/i18n/routing";
import { runMiddleware } from "../src/server/middleware";

const options = { locales: ["en", "tr", "de"], defaultLocale: "en" };

describe("i18nRouting", () => {
	test("detects locale from URL prefix", async () => {
		const mw = i18nRouting(options);
		const ctx = {
			request: new Request("http://localhost/tr/about"),
			params: {},
			locals: {} as Record<string, unknown>,
		};

		await runMiddleware([mw], ctx, async () => new Response("ok"));
		expect(ctx.locals.locale).toBe("tr");
	});

	test("redirects root to default locale", async () => {
		const mw = i18nRouting(options);
		const ctx = {
			request: new Request("http://localhost/"),
			params: {},
			locals: {} as Record<string, unknown>,
		};

		const res = await runMiddleware([mw], ctx, async () => new Response("ok"));
		expect(res.status).toBe(302);
		expect(res.headers.get("Location")).toBe("/en/");
	});

	test("detects locale from Accept-Language", async () => {
		const mw = i18nRouting({ ...options, redirectRoot: false });
		const ctx = {
			request: new Request("http://localhost/page", {
				headers: { "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.5" },
			}),
			params: {},
			locals: {} as Record<string, unknown>,
		};

		await runMiddleware([mw], ctx, async () => new Response("ok"));
		expect(ctx.locals.locale).toBe("tr");
	});

	test("uses cookie locale over Accept-Language", async () => {
		const mw = i18nRouting({ ...options, redirectRoot: false });
		const ctx = {
			request: new Request("http://localhost/page", {
				headers: {
					Cookie: "vrx_locale=de",
					"Accept-Language": "tr",
				},
			}),
			params: {},
			locals: {} as Record<string, unknown>,
		};

		await runMiddleware([mw], ctx, async () => new Response("ok"));
		expect(ctx.locals.locale).toBe("de");
	});

	test("falls back to defaultLocale", async () => {
		const mw = i18nRouting({ ...options, redirectRoot: false });
		const ctx = {
			request: new Request("http://localhost/page", {
				headers: { "Accept-Language": "ja" },
			}),
			params: {},
			locals: {} as Record<string, unknown>,
		};

		await runMiddleware([mw], ctx, async () => new Response("ok"));
		expect(ctx.locals.locale).toBe("en");
	});
});
