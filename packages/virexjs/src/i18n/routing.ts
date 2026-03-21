import type { MiddlewareFn } from "../server/middleware";
import { detectLocale } from "./index";

/**
 * i18n Routing middleware — locale-based URL routing.
 *
 * Like Next.js internationalized routing:
 * - Detects locale from URL path (/en/about, /tr/about)
 * - Falls back to Accept-Language header detection
 * - Redirects root / to /{defaultLocale}/
 * - Sets ctx.locals.locale for downstream use
 *
 * Usage:
 *   import { i18nRouting } from "virexjs";
 *
 *   // src/middleware/i18n.ts
 *   export default i18nRouting({
 *     locales: ["en", "tr", "de"],
 *     defaultLocale: "en",
 *   });
 *
 *   // In pages: ctx.locals.locale === "tr"
 */
export interface I18nRoutingOptions {
	/** Supported locales */
	locales: string[];
	/** Default locale (fallback) */
	defaultLocale: string;
	/** Redirect / to /{locale}/. Default: true */
	redirectRoot?: boolean;
	/** Cookie name to persist locale choice. Default: "vrx_locale" */
	cookieName?: string;
}

export function i18nRouting(options: I18nRoutingOptions): MiddlewareFn {
	const { locales, defaultLocale, redirectRoot = true, cookieName = "vrx_locale" } = options;
	const localeSet = new Set(locales);

	return async (ctx, next) => {
		const url = new URL(ctx.request.url);
		const pathParts = url.pathname.split("/").filter(Boolean);
		const firstSegment = pathParts[0] ?? "";

		// Check if URL starts with a locale prefix
		if (localeSet.has(firstSegment)) {
			ctx.locals.locale = firstSegment;
			// Strip locale from path for route matching
			ctx.locals.originalPath = url.pathname;
			return next();
		}

		// No locale in URL — detect from cookie or Accept-Language
		const cookies = ctx.request.headers.get("Cookie") ?? "";
		const cookieMatch = cookies.match(new RegExp(`${cookieName}=([^;]+)`));
		const cookieLocale = cookieMatch?.[1];

		const locale =
			cookieLocale && localeSet.has(cookieLocale)
				? cookieLocale
				: detectLocale(ctx.request.headers.get("Accept-Language"), locales, defaultLocale);

		ctx.locals.locale = locale;

		// Redirect root to /{locale}/
		if (redirectRoot && url.pathname === "/") {
			const response = new Response(null, {
				status: 302,
				headers: {
					Location: `/${locale}/`,
					"Set-Cookie": `${cookieName}=${locale}; Path=/; Max-Age=31536000`,
				},
			});
			return response;
		}

		return next();
	};
}

/**
 * Set the user's locale preference cookie.
 */
export function setLocaleCookie(
	response: Response,
	locale: string,
	cookieName = "vrx_locale",
): Response {
	response.headers.append(
		"Set-Cookie",
		`${cookieName}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`,
	);
	return response;
}
