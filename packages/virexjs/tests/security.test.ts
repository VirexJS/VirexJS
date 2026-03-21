import { describe, expect, test } from "bun:test";
import { type MiddlewareContext, runMiddleware } from "../src/server/middleware";
import { securityHeaders } from "../src/server/security";

function makeCtx(): MiddlewareContext {
	return {
		request: new Request("http://localhost/"),
		params: {},
		locals: {},
	};
}

async function runSecurity(options?: Parameters<typeof securityHeaders>[0]): Promise<Response> {
	const mw = securityHeaders(options);
	return runMiddleware([mw], makeCtx(), async () => new Response("ok"));
}

describe("securityHeaders defaults", () => {
	test("sets Content-Security-Policy", async () => {
		const res = await runSecurity();
		expect(res.headers.get("Content-Security-Policy")).toBe("default-src 'self'");
	});

	test("sets X-Content-Type-Options", async () => {
		const res = await runSecurity();
		expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
	});

	test("sets X-Frame-Options", async () => {
		const res = await runSecurity();
		expect(res.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
	});

	test("sets Strict-Transport-Security", async () => {
		const res = await runSecurity();
		expect(res.headers.get("Strict-Transport-Security")).toContain("max-age=31536000");
	});

	test("sets Referrer-Policy", async () => {
		const res = await runSecurity();
		expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
	});

	test("sets X-XSS-Protection to 0", async () => {
		const res = await runSecurity();
		expect(res.headers.get("X-XSS-Protection")).toBe("0");
	});

	test("sets Cross-Origin-Opener-Policy", async () => {
		const res = await runSecurity();
		expect(res.headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
	});

	test("does not set Permissions-Policy by default", async () => {
		const res = await runSecurity();
		expect(res.headers.get("Permissions-Policy")).toBeNull();
	});

	test("does not set Cross-Origin-Embedder-Policy by default", async () => {
		const res = await runSecurity();
		expect(res.headers.get("Cross-Origin-Embedder-Policy")).toBeNull();
	});
});

describe("securityHeaders custom", () => {
	test("custom CSP", async () => {
		const res = await runSecurity({
			contentSecurityPolicy: "default-src 'self'; img-src *",
		});
		expect(res.headers.get("Content-Security-Policy")).toBe("default-src 'self'; img-src *");
	});

	test("disable CSP with false", async () => {
		const res = await runSecurity({ contentSecurityPolicy: false });
		expect(res.headers.get("Content-Security-Policy")).toBeNull();
	});

	test("disable frame options", async () => {
		const res = await runSecurity({ frameOptions: false });
		expect(res.headers.get("X-Frame-Options")).toBeNull();
	});

	test("enable Permissions-Policy", async () => {
		const res = await runSecurity({
			permissionsPolicy: "camera=(), microphone=(), geolocation=()",
		});
		expect(res.headers.get("Permissions-Policy")).toContain("camera=()");
	});

	test("enable Cross-Origin-Embedder-Policy", async () => {
		const res = await runSecurity({ crossOriginEmbedderPolicy: "require-corp" });
		expect(res.headers.get("Cross-Origin-Embedder-Policy")).toBe("require-corp");
	});

	test("keeps response body intact", async () => {
		const res = await runSecurity();
		expect(await res.text()).toBe("ok");
	});
});
