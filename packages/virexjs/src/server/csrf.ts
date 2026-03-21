import type { MiddlewareFn } from "./middleware";

/**
 * CSRF (Cross-Site Request Forgery) protection middleware.
 *
 * Generates a unique token per session and validates it on
 * state-changing requests (POST, PUT, PATCH, DELETE).
 *
 * The token can be read from:
 * - Header: X-CSRF-Token
 * - Body field: _csrf
 * - Query param: _csrf
 *
 * Usage:
 *   import { csrf } from "virexjs";
 *
 *   // src/middleware/csrf.ts
 *   export default csrf();
 *
 *   // In templates, include the token in forms:
 *   <input type="hidden" name="_csrf" value={ctx.locals.csrfToken} />
 */
export function csrf(options?: {
	/** Cookie name for CSRF token. Default: "vrx.csrf" */
	cookieName?: string;
	/** Header name to check. Default: "X-CSRF-Token" */
	headerName?: string;
	/** Form/query field name. Default: "_csrf" */
	fieldName?: string;
	/** Methods that require CSRF validation. Default: POST, PUT, PATCH, DELETE */
	methods?: string[];
	/** Paths to skip CSRF check (e.g., API webhooks). */
	ignorePaths?: string[];
}): MiddlewareFn {
	const {
		cookieName = "vrx.csrf",
		headerName = "X-CSRF-Token",
		fieldName = "_csrf",
		methods = ["POST", "PUT", "PATCH", "DELETE"],
		ignorePaths = [],
	} = options ?? {};

	const methodSet = new Set(methods);

	return async (ctx, next) => {
		const url = new URL(ctx.request.url);

		// Read or generate token
		const cookies = parseCookieHeader(ctx.request.headers.get("Cookie"));
		let token = cookies[cookieName];

		if (!token) {
			token = generateToken();
		}

		// Make token available to templates
		ctx.locals.csrfToken = token;

		// Skip validation for safe methods and ignored paths
		if (!methodSet.has(ctx.request.method) || ignorePaths.includes(url.pathname)) {
			const response = await next();
			setTokenCookie(response, cookieName, token);
			return response;
		}

		// Validate token from header, body field, or query param
		const headerToken = ctx.request.headers.get(headerName);
		const queryToken = url.searchParams.get(fieldName);

		let valid = false;

		if (headerToken && timingSafeEqual(headerToken, token)) {
			valid = true;
		} else if (queryToken && timingSafeEqual(queryToken, token)) {
			valid = true;
		} else {
			// Check body field (clone request so downstream can still read body)
			const contentType = ctx.request.headers.get("Content-Type") ?? "";
			if (
				contentType.includes("application/x-www-form-urlencoded") ||
				contentType.includes("multipart/form-data")
			) {
				try {
					const cloned = ctx.request.clone();
					const formData = await cloned.formData();
					const bodyToken = formData.get(fieldName);
					if (typeof bodyToken === "string" && timingSafeEqual(bodyToken, token)) {
						valid = true;
					}
				} catch {
					// Parse error — invalid body
				}
			}
		}

		if (!valid) {
			return new Response("Forbidden — invalid CSRF token", { status: 403 });
		}

		const response = await next();
		setTokenCookie(response, cookieName, token);
		return response;
	};
}

function generateToken(): string {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function setTokenCookie(response: Response, name: string, token: string): void {
	response.headers.append(
		"Set-Cookie",
		`${encodeURIComponent(name)}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict`,
	);
}

function parseCookieHeader(header: string | null): Record<string, string> {
	if (!header) return {};
	const cookies: Record<string, string> = {};
	for (const pair of header.split(";")) {
		const eq = pair.indexOf("=");
		if (eq < 0) continue;
		cookies[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim();
	}
	return cookies;
}

function timingSafeEqual(a: string, b: string): boolean {
	const { timingSafeEqual: cryptoEqual } = require("node:crypto");
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	if (bufA.length !== bufB.length) {
		cryptoEqual(bufA, bufA);
		return false;
	}
	return cryptoEqual(bufA, bufB);
}
