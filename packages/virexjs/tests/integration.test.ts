import { beforeEach, describe, expect, test } from "bun:test";
import { guard } from "../src/auth/guard";
import { createJWT, verifyJWT } from "../src/auth/jwt";
import { parseEnvFile } from "../src/config/env";
import { createI18n, defineTranslations } from "../src/i18n/index";
import { definePlugin, PluginRunner } from "../src/plugin/index";
import { ErrorBoundary } from "../src/render/error-boundary";
import { Head, resetHeadCollector } from "../src/render/head";
import { createFAQ, JsonLd } from "../src/render/json-ld";
import type { VNode } from "../src/render/jsx";
import { h } from "../src/render/jsx";
import { useHead } from "../src/render/use-head";
import { createCache } from "../src/server/cache";
import { cors } from "../src/server/cors";
import { healthCheck } from "../src/server/health";
import { runMiddleware } from "../src/server/middleware";
import { rateLimit } from "../src/server/rate-limit";
import { requestId } from "../src/server/request-id";
import { securityHeaders } from "../src/server/security";
import { createSSEStream } from "../src/server/sse";
import {
	assertHTML,
	createTestLoaderContext,
	createTestRequest,
	renderComponent,
} from "../src/testing/index";
import { number, string, validate } from "../src/validation/index";

beforeEach(() => {
	resetHeadCollector();
});

// ─── Full page render with Head + useHead + ErrorBoundary + i18n ────────────

describe("full page render pipeline", () => {
	test("page with useHead + Head + ErrorBoundary + i18n renders correctly", () => {
		const i18n = createI18n({
			defaultLocale: "en",
			locales: {
				en: defineTranslations({ title: "Blog", greeting: "Hello {name}" }),
				tr: defineTranslations({ title: "Blog", greeting: "Merhaba {name}" }),
			},
		});

		const t = i18n.withLocale("en").t;

		function Page(_props: Record<string, unknown>): VNode {
			const head = useHead({
				title: t("title"),
				description: t("greeting", { name: "World" }),
				og: { title: t("title"), type: "website" },
			});

			return h(
				"div",
				null,
				head,
				h(Head, null, h("link", { rel: "stylesheet", href: "/app.css" })),
				h(ErrorBoundary, {
					fallback: (err: Error) => h("p", null, `Error: ${err.message}`),
					children: h(
						"main",
						null,
						h("h1", null, t("title")),
						h("p", null, t("greeting", { name: "World" })),
					),
				}),
			);
		}

		const { html, head } = renderComponent(Page, {});

		// Body rendered correctly
		expect(html).toContain("<h1>Blog</h1>");
		expect(html).toContain("Hello World");
		expect(html).not.toContain("Error:");

		// Head collected
		expect(head).toContain("<title>Blog</title>");
		expect(head).toContain('property="og:title"');
		expect(head).toContain("/app.css");
	});

	test("page with ErrorBoundary catching render error", () => {
		function BrokenComponent(): VNode {
			throw new Error("render crash");
		}

		function SafePage(_props: Record<string, unknown>): VNode {
			return h(
				"div",
				null,
				h(ErrorBoundary, {
					fallback: (err: Error) => h("div", { className: "error" }, `Caught: ${err.message}`),
					children: h(BrokenComponent, null),
				}),
			);
		}

		const { html } = renderComponent(SafePage, {});
		expect(html).toContain("Caught: render crash");
		expect(html).toContain('class="error"');
	});

	test("JsonLd + useHead together in head", () => {
		function SEOPage(_props: Record<string, unknown>): VNode {
			const head = useHead({ title: "FAQ Page" });
			return h(
				"div",
				null,
				head,
				h(JsonLd, {
					data: createFAQ([{ question: "What is VirexJS?", answer: "A web framework." }]),
				}),
				h("p", null, "Content"),
			);
		}

		const { html, head } = renderComponent(SEOPage, {});
		expect(html).toBe("<div><p>Content</p></div>");
		expect(head).toContain("<title>FAQ Page</title>");
		expect(head).toContain("application/ld+json");
		expect(head).toContain("FAQPage");
	});
});

// ─── Middleware chain integration ───────────────────────────────────────────

describe("middleware chain integration", () => {
	test("cors + rateLimit + securityHeaders + requestId chain", async () => {
		const middlewares = [
			requestId(),
			cors({ origin: "*" }),
			rateLimit({ max: 100, windowMs: 60_000 }),
			securityHeaders(),
		];

		const ctx = {
			request: new Request("http://localhost/api/test", {
				headers: { Origin: "http://example.com" },
			}),
			params: {},
			locals: {} as Record<string, unknown>,
		};

		const res = await runMiddleware(
			middlewares,
			ctx,
			async () =>
				new Response(JSON.stringify({ ok: true }), {
					headers: { "Content-Type": "application/json" },
				}),
		);

		// All headers should be present
		expect(res.headers.get("X-Request-ID")).toBeTruthy();
		expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
		expect(res.headers.get("X-RateLimit-Limit")).toBe("100");
		expect(res.headers.get("Content-Security-Policy")).toBeTruthy();
		expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");

		// Body intact
		const body = await res.json();
		expect(body.ok).toBe(true);

		// requestId set in locals
		expect(ctx.locals.requestId).toBeTruthy();
	});

	test("guard blocks + returns custom response", async () => {
		const middlewares = [
			guard({
				match: "/admin",
				check: (ctx) => ctx.request.headers.get("Authorization") === "Bearer valid",
				onDenied: () => new Response("Login required", { status: 401 }),
			}),
		];

		// Without auth
		const ctx1 = {
			request: new Request("http://localhost/admin/dashboard"),
			params: {},
			locals: {},
		};
		const res1 = await runMiddleware(middlewares, ctx1, async () => new Response("admin page"));
		expect(res1.status).toBe(401);

		// With auth
		const ctx2 = {
			request: new Request("http://localhost/admin/dashboard", {
				headers: { Authorization: "Bearer valid" },
			}),
			params: {},
			locals: {},
		};
		const res2 = await runMiddleware(middlewares, ctx2, async () => new Response("admin page"));
		expect(await res2.text()).toBe("admin page");
	});
});

// ─── JWT + session integration ──────────────────────────────────────────────

describe("JWT + session auth flow", () => {
	test("create JWT → verify → use in guard", async () => {
		const secret = "integration-test-secret";

		// 1. Create token
		const token = await createJWT({ userId: "u1", role: "admin" }, secret, { expiresIn: 3600 });

		// 2. Verify token
		const payload = await verifyJWT(token, secret);
		expect(payload.userId).toBe("u1");
		expect(payload.role).toBe("admin");

		// 3. Use in guard
		const mw = guard({
			match: "/api",
			check: async (ctx) => {
				const authHeader = ctx.request.headers.get("Authorization");
				if (!authHeader?.startsWith("Bearer ")) return false;
				try {
					await verifyJWT(authHeader.slice(7), secret);
					return true;
				} catch {
					return false;
				}
			},
		});

		const ctx = {
			request: new Request("http://localhost/api/data", {
				headers: { Authorization: `Bearer ${token}` },
			}),
			params: {},
			locals: {},
		};
		const res = await runMiddleware([mw], ctx, async () => new Response("data"));
		expect(res.status).toBe(200);
	});
});

// ─── Validation + form processing ───────────────────────────────────────────

describe("validation integration", () => {
	test("validate form data end-to-end", () => {
		const schema = {
			name: string().required().min(2).max(50).trim(),
			email: string().required().email(),
			age: number().min(0).max(150),
			bio: string().max(500).default(""),
		};

		// Valid data
		const valid = validate(schema, {
			name: "  Alice  ",
			email: "alice@example.com",
			age: "30",
		});
		expect(valid.success).toBe(true);
		expect(valid.data.name).toBe("Alice"); // trimmed
		expect(valid.data.age).toBe(30); // coerced
		expect(valid.data.bio).toBe(""); // default

		// Invalid data
		const invalid = validate(schema, {
			name: "",
			email: "not-email",
			age: "200",
		});
		expect(invalid.success).toBe(false);
		expect(invalid.errors.length).toBeGreaterThanOrEqual(2);
	});
});

// ─── Cache + i18n integration ───────────────────────────────────────────────

describe("cache + i18n integration", () => {
	test("cache translated content", () => {
		const i18n = createI18n({
			defaultLocale: "en",
			locales: {
				en: defineTranslations({ welcome: "Welcome to {site}" }),
				tr: defineTranslations({ welcome: "{site}'e hos geldiniz" }),
			},
		});

		const cache = createCache<string>({ ttl: 60_000 });

		function getWelcome(locale: string, site: string): string {
			const key = `welcome:${locale}:${site}`;
			let cached = cache.get(key);
			if (!cached) {
				cached = i18n.withLocale(locale).t("welcome", { site });
				cache.set(key, cached);
			}
			return cached;
		}

		expect(getWelcome("en", "VirexJS")).toBe("Welcome to VirexJS");
		expect(getWelcome("tr", "VirexJS")).toBe("VirexJS'e hos geldiniz");

		// Second call uses cache
		expect(cache.has("welcome:en:VirexJS")).toBe(true);
		expect(getWelcome("en", "VirexJS")).toBe("Welcome to VirexJS");
	});
});

// ─── Plugin + transformHTML integration ─────────────────────────────────────

describe("plugin pipeline integration", () => {
	test("multiple plugins transform HTML in sequence", async () => {
		const analyticsPlugin = definePlugin({
			name: "analytics",
			transformHTML(html) {
				return html.replace("</body>", "<script>track()</script></body>");
			},
		});

		const minifyPlugin = definePlugin({
			name: "minify",
			transformHTML(html) {
				return html.replace(/\s+/g, " ").trim();
			},
		});

		const runner = new PluginRunner([analyticsPlugin, minifyPlugin]);
		const ctx = { pathname: "/", params: {}, request: new Request("http://localhost/") };

		const result = await runner.runTransformHTML("<body>\n  <h1>Hello</h1>\n</body>", ctx);

		expect(result).toContain("track()");
		expect(result).not.toContain("\n");
	});
});

// ─── SSE stream integration ────────────────────────────────────────────────

describe("SSE integration", () => {
	test("create and consume SSE stream", async () => {
		const { response, send, close } = createSSEStream();

		send("hello");
		send("notification", { count: 3 });
		close();

		const text = await response.text();
		expect(text).toContain("data: hello");
		expect(text).toContain("event: notification");
		expect(text).toContain('"count":3');
		expect(response.headers.get("Content-Type")).toBe("text/event-stream");
	});
});

// ─── Health check with real checks ──────────────────────────────────────────

describe("health check integration", () => {
	test("health check with cache and validation", async () => {
		const cache = createCache<string>({ ttl: 60_000 });
		cache.set("test", "value");

		const mw = healthCheck({
			checks: {
				cache: () => cache.has("test"),
				validation: () => {
					const r = validate({ x: string().required() }, { x: "ok" });
					return r.success;
				},
			},
		});

		const ctx = {
			request: new Request("http://localhost/health"),
			params: {},
			locals: {},
		};
		const res = await runMiddleware([mw], ctx, async () => new Response("page"));
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.status).toBe("healthy");
		expect(body.checks.cache.status).toBe("healthy");
		expect(body.checks.validation.status).toBe("healthy");
	});
});

// ─── Testing utilities with real components ─────────────────────────────────

describe("testing utilities integration", () => {
	test("renderComponent + assertHTML", () => {
		function Card(props: { title: string; href: string }): VNode {
			return h(
				"div",
				{ className: "card" },
				h("h2", null, props.title),
				h("a", { href: props.href }, "Read more"),
			);
		}

		const { html } = renderComponent(Card, { title: "Test Card", href: "/post/1" });

		assertHTML(html).contains("div");
		assertHTML(html).contains("h2", "Test Card");
		assertHTML(html).hasAttribute("div", "class", "card");
		assertHTML(html).hasAttribute("a", "href", "/post/1");
		assertHTML(html).notContains("script");
	});

	test("createTestRequest for API testing", async () => {
		const req = createTestRequest("/api/users", {
			method: "POST",
			body: { name: "Alice", email: "alice@test.com" },
			headers: { Authorization: "Bearer token123" },
		});

		expect(req.method).toBe("POST");
		expect(req.headers.get("Authorization")).toBe("Bearer token123");
		expect(req.headers.get("Content-Type")).toBe("application/json");

		const body = await req.json();
		expect(body.name).toBe("Alice");
	});

	test("createTestLoaderContext for loader testing", () => {
		const ctx = createTestLoaderContext(
			{ slug: "hello-world" },
			{ path: "/blog/hello-world", headers: { "Accept-Language": "tr" } },
		);

		expect(ctx.params.slug).toBe("hello-world");
		expect(new URL(ctx.request.url).pathname).toBe("/blog/hello-world");
		expect(ctx.headers.get("Accept-Language")).toBe("tr");
	});
});

// ─── Env + config integration ───────────────────────────────────────────────

describe("env parsing integration", () => {
	test("parse complex env file with variable expansion", () => {
		const env = parseEnvFile(`
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DATABASE_URL=postgres://\${DB_HOST}:\${DB_PORT}/\${DB_NAME}

# App
APP_NAME="My App"
APP_SECRET='super-secret'
DEBUG=false
`);

		expect(env.DB_HOST).toBe("localhost");
		expect(env.DB_PORT).toBe("5432");
		expect(env.DATABASE_URL).toBe("postgres://localhost:5432/myapp");
		expect(env.APP_NAME).toBe("My App");
		expect(env.APP_SECRET).toBe("super-secret");
		expect(env.DEBUG).toBe("false");
	});
});
