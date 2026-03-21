/**
 * JWT (JSON Web Token) utilities for VirexJS.
 *
 * Lightweight JWT creation and verification using Web Crypto API.
 * Supports HS256 (HMAC-SHA256) algorithm — no external dependencies.
 *
 * Usage:
 *   import { createJWT, verifyJWT } from "virexjs";
 *
 *   const token = await createJWT({ userId: "123" }, "secret", { expiresIn: 3600 });
 *   const payload = await verifyJWT(token, "secret");
 */

/** JWT payload — standard claims + custom data */
export interface JWTPayload {
	/** Subject */
	sub?: string;
	/** Issued at (auto-set) */
	iat?: number;
	/** Expiration time */
	exp?: number;
	/** Not before */
	nbf?: number;
	/** Issuer */
	iss?: string;
	/** Audience */
	aud?: string;
	/** JWT ID */
	jti?: string;
	/** Custom claims */
	[key: string]: unknown;
}

/** JWT creation options */
export interface JWTOptions {
	/** Expiration time in seconds from now */
	expiresIn?: number;
	/** Issuer */
	issuer?: string;
	/** Audience */
	audience?: string;
	/** Subject */
	subject?: string;
}

/**
 * Create a signed JWT token.
 *
 * Uses HS256 (HMAC-SHA256) algorithm via Web Crypto API.
 */
export async function createJWT(
	payload: Record<string, unknown>,
	secret: string,
	options?: JWTOptions,
): Promise<string> {
	const now = Math.floor(Date.now() / 1000);

	const claims: JWTPayload = {
		...payload,
		iat: now,
	};

	if (options?.expiresIn) {
		claims.exp = now + options.expiresIn;
	}
	if (options?.issuer) claims.iss = options.issuer;
	if (options?.audience) claims.aud = options.audience;
	if (options?.subject) claims.sub = options.subject;

	const header = { alg: "HS256", typ: "JWT" };
	const encodedHeader = base64urlEncode(JSON.stringify(header));
	const encodedPayload = base64urlEncode(JSON.stringify(claims));

	const signingInput = `${encodedHeader}.${encodedPayload}`;
	const signature = await hmacSign(signingInput, secret);

	return `${signingInput}.${signature}`;
}

/**
 * Verify and decode a JWT token.
 *
 * Returns the payload if valid, throws on invalid/expired tokens.
 */
export async function verifyJWT(
	token: string,
	secret: string,
): Promise<JWTPayload> {
	const parts = token.split(".");
	if (parts.length !== 3) {
		throw new JWTError("Invalid token format");
	}

	const [encodedHeader, encodedPayload, signature] = parts as [string, string, string];

	// Verify signature
	const signingInput = `${encodedHeader}.${encodedPayload}`;
	const expectedSignature = await hmacSign(signingInput, secret);

	if (!timingSafeEqual(signature, expectedSignature)) {
		throw new JWTError("Invalid signature");
	}

	// Decode payload
	let payload: JWTPayload;
	try {
		payload = JSON.parse(base64urlDecode(encodedPayload));
	} catch {
		throw new JWTError("Invalid payload");
	}

	// Check expiration
	const now = Math.floor(Date.now() / 1000);
	if (payload.exp !== undefined && now >= payload.exp) {
		throw new JWTError("Token expired");
	}

	// Check not-before
	if (payload.nbf !== undefined && now < payload.nbf) {
		throw new JWTError("Token not yet valid");
	}

	return payload;
}

/**
 * Decode a JWT without verification (unsafe — for debugging only).
 */
export function decodeJWT(token: string): { header: Record<string, unknown>; payload: JWTPayload } {
	const parts = token.split(".");
	if (parts.length !== 3) {
		throw new JWTError("Invalid token format");
	}

	return {
		header: JSON.parse(base64urlDecode(parts[0]!)),
		payload: JSON.parse(base64urlDecode(parts[1]!)),
	};
}

/** Custom JWT error class */
export class JWTError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "JWTError";
	}
}

// ─── Internal helpers ───────────────────────────────────────────────────────

function base64urlEncode(str: string): string {
	const bytes = new TextEncoder().encode(str);
	const base64 = btoa(String.fromCharCode(...bytes));
	return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): string {
	let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
	const padding = base64.length % 4;
	if (padding) base64 += "=".repeat(4 - padding);
	const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}

async function hmacSign(data: string, secret: string): Promise<string> {
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);

	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(data),
	);

	const bytes = new Uint8Array(signature);
	const base64 = btoa(String.fromCharCode(...bytes));
	return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Timing-safe string comparison to prevent timing attacks */
function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return result === 0;
}
