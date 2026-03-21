import type { MiddlewareFn } from "./middleware";

/** Security headers configuration */
export interface SecurityOptions {
	/** Content-Security-Policy. Default: "default-src 'self'" */
	contentSecurityPolicy?: string | false;
	/** X-Content-Type-Options. Default: "nosniff" */
	contentTypeOptions?: string | false;
	/** X-Frame-Options. Default: "SAMEORIGIN" */
	frameOptions?: string | false;
	/** Strict-Transport-Security. Default: "max-age=31536000; includeSubDomains" */
	hsts?: string | false;
	/** Referrer-Policy. Default: "strict-origin-when-cross-origin" */
	referrerPolicy?: string | false;
	/** X-XSS-Protection. Default: "0" (disabled, CSP is preferred) */
	xssProtection?: string | false;
	/** Permissions-Policy. Default: false (not set) */
	permissionsPolicy?: string | false;
	/** Cross-Origin-Opener-Policy. Default: "same-origin" */
	crossOriginOpenerPolicy?: string | false;
	/** Cross-Origin-Embedder-Policy. Default: false (not set) */
	crossOriginEmbedderPolicy?: string | false;
	/** Remove X-Powered-By header. Default: true */
	removePoweredBy?: boolean;
}

/**
 * Security headers middleware — similar to Helmet for Express.
 *
 * Adds security-related HTTP headers to all responses.
 * Set any option to false to skip that header.
 *
 * Usage:
 *   import { securityHeaders } from "virexjs";
 *
 *   // src/middleware/security.ts
 *   export default securityHeaders();
 *
 *   // With custom CSP:
 *   export default securityHeaders({
 *     contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline'",
 *   });
 */
export function securityHeaders(options: SecurityOptions = {}): MiddlewareFn {
	const {
		contentSecurityPolicy = "default-src 'self'",
		contentTypeOptions = "nosniff",
		frameOptions = "SAMEORIGIN",
		hsts = "max-age=31536000; includeSubDomains",
		referrerPolicy = "strict-origin-when-cross-origin",
		xssProtection = "0",
		permissionsPolicy = false,
		crossOriginOpenerPolicy = "same-origin",
		crossOriginEmbedderPolicy = false,
		removePoweredBy = true,
	} = options;

	const headers: [string, string][] = [];

	if (contentSecurityPolicy) headers.push(["Content-Security-Policy", contentSecurityPolicy]);
	if (contentTypeOptions) headers.push(["X-Content-Type-Options", contentTypeOptions]);
	if (frameOptions) headers.push(["X-Frame-Options", frameOptions]);
	if (hsts) headers.push(["Strict-Transport-Security", hsts]);
	if (referrerPolicy) headers.push(["Referrer-Policy", referrerPolicy]);
	if (xssProtection) headers.push(["X-XSS-Protection", xssProtection]);
	if (permissionsPolicy) headers.push(["Permissions-Policy", permissionsPolicy]);
	if (crossOriginOpenerPolicy) headers.push(["Cross-Origin-Opener-Policy", crossOriginOpenerPolicy]);
	if (crossOriginEmbedderPolicy) headers.push(["Cross-Origin-Embedder-Policy", crossOriginEmbedderPolicy]);

	return async (_ctx, next) => {
		const response = await next();

		for (const [name, value] of headers) {
			response.headers.set(name, value);
		}

		if (removePoweredBy) {
			response.headers.delete("X-Powered-By");
		}

		return response;
	};
}
