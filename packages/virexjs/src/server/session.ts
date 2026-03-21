import type { MiddlewareFn } from "./middleware";

/**
 * Session data store interface.
 * Default implementation uses in-memory Map.
 */
export interface SessionStore {
	get: (id: string) => Promise<Record<string, unknown> | null>;
	set: (id: string, data: Record<string, unknown>, maxAge: number) => Promise<void>;
	delete: (id: string) => Promise<void>;
}

/** Session middleware configuration */
export interface SessionOptions {
	/** Cookie name. Default: "vrx.sid" */
	cookieName?: string;
	/** Session max age in seconds. Default: 86400 (24h) */
	maxAge?: number;
	/** Cookie path. Default: "/" */
	path?: string;
	/** HttpOnly cookie flag. Default: true */
	httpOnly?: boolean;
	/** Secure cookie flag (HTTPS only). Default: false */
	secure?: boolean;
	/** SameSite cookie flag. Default: "Lax" */
	sameSite?: "Strict" | "Lax" | "None";
	/** Custom session store. Default: in-memory */
	store?: SessionStore;
	/** Secret for signing session IDs. Default: random */
	secret?: string;
}

/**
 * Create a session middleware.
 *
 * Attaches `ctx.locals.session` with get/set/destroy methods.
 *
 * Usage:
 *   import { session } from "virexjs";
 *
 *   // src/middleware/session.ts
 *   export default session({ maxAge: 3600, secure: true });
 *
 *   // In a loader or API route:
 *   const userId = ctx.locals.session.get("userId");
 *   ctx.locals.session.set("userId", "abc123");
 *   ctx.locals.session.destroy();
 */
export function session(options: SessionOptions = {}): MiddlewareFn {
	const {
		cookieName = "vrx.sid",
		maxAge = 86400,
		path = "/",
		httpOnly = true,
		secure = false,
		sameSite = "Lax",
		store = createMemoryStore(),
	} = options;

	return async (ctx, next) => {
		// Parse existing session ID from cookie
		const cookies = parseCookieHeader(ctx.request.headers.get("Cookie"));
		let sessionId = cookies[cookieName] ?? "";
		let sessionData: Record<string, unknown> = {};
		let isNew = false;

		if (sessionId) {
			const existing = await store.get(sessionId);
			if (existing) {
				sessionData = existing;
			} else {
				sessionId = "";
			}
		}

		if (!sessionId) {
			sessionId = generateSessionId();
			isNew = true;
		}

		let modified = false;
		let destroyed = false;

		// Attach session API to locals
		ctx.locals.session = {
			/** Get a session value */
			get(key: string): unknown {
				return sessionData[key];
			},
			/** Set a session value */
			set(key: string, value: unknown): void {
				sessionData[key] = value;
				modified = true;
			},
			/** Delete a session value */
			delete(key: string): void {
				delete sessionData[key];
				modified = true;
			},
			/** Destroy the entire session */
			destroy(): void {
				destroyed = true;
				sessionData = {};
			},
			/** Get all session data */
			getAll(): Record<string, unknown> {
				return { ...sessionData };
			},
			/** Session ID */
			id: sessionId,
		};

		const response = await next();

		// Persist session changes
		if (destroyed) {
			await store.delete(sessionId);
			// Clear the cookie
			response.headers.append(
				"Set-Cookie",
				buildCookie(cookieName, "", { path, maxAge: 0, httpOnly, secure, sameSite }),
			);
		} else if (modified || isNew) {
			await store.set(sessionId, sessionData, maxAge);
			response.headers.append(
				"Set-Cookie",
				buildCookie(cookieName, sessionId, { path, maxAge, httpOnly, secure, sameSite }),
			);
		}

		return response;
	};
}

/** Create an in-memory session store */
export function createMemoryStore(): SessionStore {
	const sessions = new Map<string, { data: Record<string, unknown>; expiresAt: number }>();

	return {
		async get(id) {
			const entry = sessions.get(id);
			if (!entry) return null;
			if (Date.now() >= entry.expiresAt) {
				sessions.delete(id);
				return null;
			}
			return entry.data;
		},
		async set(id, data, maxAge) {
			sessions.set(id, {
				data,
				expiresAt: Date.now() + maxAge * 1000,
			});
		},
		async delete(id) {
			sessions.delete(id);
		},
	};
}

/** Generate a random session ID */
function generateSessionId(): string {
	const bytes = new Uint8Array(24);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Parse Cookie header into key-value pairs */
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

/** Build a Set-Cookie header value */
function buildCookie(
	name: string,
	value: string,
	opts: { path: string; maxAge: number; httpOnly: boolean; secure: boolean; sameSite: string },
): string {
	const parts = [`${name}=${value}`];
	parts.push(`Path=${opts.path}`);
	parts.push(`Max-Age=${opts.maxAge}`);
	if (opts.httpOnly) parts.push("HttpOnly");
	if (opts.secure) parts.push("Secure");
	parts.push(`SameSite=${opts.sameSite}`);
	return parts.join("; ");
}
