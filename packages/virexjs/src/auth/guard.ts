import type { MiddlewareFn, MiddlewareContext } from "../server/middleware";

/**
 * Route guard — protect routes based on conditions.
 *
 * Usage:
 *   import { guard } from "virexjs";
 *
 *   // Protect all /admin/* routes
 *   export default guard({
 *     match: (pathname) => pathname.startsWith("/admin"),
 *     check: async (ctx) => {
 *       const token = ctx.request.headers.get("Authorization");
 *       return !!token; // true = allowed, false = denied
 *     },
 *     onDenied: () => new Response("Forbidden", { status: 403 }),
 *   });
 *
 *   // Redirect to login
 *   export default guard({
 *     match: ["/dashboard", "/settings", "/profile"],
 *     check: (ctx) => !!ctx.locals.userId,
 *     onDenied: () => Response.redirect("/login"),
 *   });
 */

/** Guard configuration */
export interface GuardOptions {
	/** URL path matcher — string prefix, array of paths, regex, or function */
	match: string | string[] | RegExp | ((pathname: string) => boolean);
	/** Check function — return true to allow, false to deny */
	check: (ctx: MiddlewareContext) => boolean | Promise<boolean>;
	/** Response to return when denied. Default: 403 Forbidden */
	onDenied?: (ctx: MiddlewareContext) => Response | Promise<Response>;
}

/**
 * Create a route guard middleware.
 */
export function guard(options: GuardOptions): MiddlewareFn {
	const { match, check, onDenied } = options;
	const matcher = buildMatcher(match);
	const defaultDenied = () => new Response("Forbidden", { status: 403 });

	return async (ctx, next) => {
		const url = new URL(ctx.request.url);

		if (!matcher(url.pathname)) {
			return next();
		}

		const allowed = await check(ctx);
		if (!allowed) {
			return (onDenied ?? defaultDenied)(ctx);
		}

		return next();
	};
}

function buildMatcher(match: GuardOptions["match"]): (pathname: string) => boolean {
	if (typeof match === "string") {
		return (p) => p.startsWith(match);
	}
	if (Array.isArray(match)) {
		const set = new Set(match);
		return (p) => set.has(p);
	}
	if (match instanceof RegExp) {
		return (p) => match.test(p);
	}
	return match;
}
