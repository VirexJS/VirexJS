/**
 * Response helper utilities for VirexJS route handlers.
 * Provides shorthand functions for common response patterns.
 */

/** Redirect to another URL */
export function redirect(url: string, status: 301 | 302 | 303 | 307 | 308 = 302): Response {
	return new Response(null, {
		status,
		headers: { Location: url },
	});
}

/** Return a JSON response */
export function json<T>(data: T, init?: { status?: number; headers?: Record<string, string> }): Response {
	return new Response(JSON.stringify(data), {
		status: init?.status ?? 200,
		headers: {
			"Content-Type": "application/json",
			...init?.headers,
		},
	});
}

/** Return an HTML response */
export function html(body: string, init?: { status?: number; headers?: Record<string, string> }): Response {
	return new Response(body, {
		status: init?.status ?? 200,
		headers: {
			"Content-Type": "text/html; charset=utf-8",
			...init?.headers,
		},
	});
}

/** Return a 404 Not Found response */
export function notFound(message = "Not Found"): Response {
	return new Response(message, { status: 404 });
}

/** Return a plain text response */
export function text(body: string, init?: { status?: number; headers?: Record<string, string> }): Response {
	return new Response(body, {
		status: init?.status ?? 200,
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			...init?.headers,
		},
	});
}

/** Set a cookie on a response */
export function setCookie(
	response: Response,
	name: string,
	value: string,
	options?: {
		maxAge?: number;
		path?: string;
		httpOnly?: boolean;
		secure?: boolean;
		sameSite?: "Strict" | "Lax" | "None";
	},
): Response {
	const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
	if (options?.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
	if (options?.path) parts.push(`Path=${options.path}`);
	if (options?.httpOnly) parts.push("HttpOnly");
	if (options?.secure) parts.push("Secure");
	if (options?.sameSite) parts.push(`SameSite=${options.sameSite}`);

	response.headers.append("Set-Cookie", parts.join("; "));
	return response;
}

/** Parse cookies from a request */
export function parseCookies(request: Request): Record<string, string> {
	const header = request.headers.get("Cookie");
	if (!header) return {};

	const cookies: Record<string, string> = {};
	for (const pair of header.split(";")) {
		const eqIndex = pair.indexOf("=");
		if (eqIndex < 0) continue;
		const key = decodeURIComponent(pair.slice(0, eqIndex).trim());
		const value = decodeURIComponent(pair.slice(eqIndex + 1).trim());
		cookies[key] = value;
	}
	return cookies;
}
