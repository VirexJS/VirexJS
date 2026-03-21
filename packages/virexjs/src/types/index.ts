import { DEFAULT_CONFIG } from "../config/defaults";
import type { VirexConfig } from "../config/types";

/** Props passed to page components */
export interface PageProps<T = Record<string, unknown>> {
	data: T;
	params: Record<string, string>;
	url: URL;
}

/** Context passed to loader functions */
export interface LoaderContext {
	params: Record<string, string>;
	request: Request;
	headers: Headers;
}

/** Context passed to meta functions */
export interface MetaContext<T = Record<string, unknown>> {
	data: T;
	params: Record<string, string>;
}

/** Context passed to API route handlers */
export interface APIContext {
	request: Request;
	params: Record<string, string>;
}

/** Type for loader functions */
export type LoaderFn<T = Record<string, unknown>> = (ctx: LoaderContext) => T | Promise<T>;

/** Type for API route handlers */
export type APIHandler = (ctx: APIContext) => Response | Promise<Response>;

/** Return type for getStaticPaths — used for SSG of dynamic routes */
export interface StaticPath {
	params: Record<string, string>;
}

/** Type for getStaticPaths functions */
export type GetStaticPathsFn = () => StaticPath[] | Promise<StaticPath[]>;

/**
 * Helper to define a VirexJS config with type safety.
 */
export function defineConfig(config: Partial<VirexConfig>): VirexConfig {
	return { ...DEFAULT_CONFIG, ...config } as VirexConfig;
}

/**
 * Helper to define a type-safe loader function.
 * Usage:
 *   export const loader = defineLoader(async (ctx) => {
 *     return { posts: await getPosts(ctx.params.slug) };
 *   });
 */
export function defineLoader<T extends Record<string, unknown>>(fn: LoaderFn<T>): LoaderFn<T> {
	return fn;
}

/**
 * Helper to define a type-safe API route handler.
 * Usage:
 *   export const GET = defineAPIRoute(async (ctx) => {
 *     return Response.json({ id: ctx.params.id });
 *   });
 */
export function defineAPIRoute(fn: APIHandler): APIHandler {
	return fn;
}

export type { GuardOptions } from "../auth/guard";
export { guard } from "../auth/guard";
export type { JWTOptions, JWTPayload } from "../auth/jwt";
export { createJWT, decodeJWT, JWTError, verifyJWT } from "../auth/jwt";
export { loadEnv, parseEnvFile } from "../config/env";
export type { VirexConfig } from "../config/types";
export type { I18n, LocaleMap, Translations } from "../i18n/index";
export { createI18n, defineTranslations, detectLocale } from "../i18n/index";
export { definePlugin } from "../plugin/index";
export type { BuildResult, ServerInfo, TransformHTMLContext, VirexPlugin } from "../plugin/types";
export type { ErrorBoundaryProps } from "../render/error-boundary";
export { ErrorBoundary } from "../render/error-boundary";
export { Head } from "../render/head";
export type { ImageProps } from "../render/image";
export { Image } from "../render/image";
export type { ArticleLD, BreadcrumbLD, FAQLD, StructuredData } from "../render/json-ld";
export { createBreadcrumbs, createFAQ, JsonLd } from "../render/json-ld";
export type { LinkProps } from "../render/link";
export { Link } from "../render/link";
export type { MetaData } from "../render/meta";
export { defineRoute, route } from "../render/routes";
export type { UseHeadOptions } from "../render/use-head";
export { useHead } from "../render/use-head";
export type { ActionContext, ActionHandler } from "../server/action";
export { actionJson, actionRedirect, defineAction, parseFormData } from "../server/action";
export { bodyLimit } from "../server/body-limit";
export type { Cache } from "../server/cache";
export { createCache } from "../server/cache";
export type { CORSOptions } from "../server/cors";
export { cors } from "../server/cors";
export { csrf } from "../server/csrf";
export type { ShutdownHandle, ShutdownOptions } from "../server/graceful";
export { gracefulShutdown } from "../server/graceful";
export { healthCheck } from "../server/health";
export { getISRCache, getISRStats, invalidateISR, setISRCache } from "../server/isr";
export type { Logger, LogLevel } from "../server/logger";
export { createLogger } from "../server/logger";
export type { MiddlewareContext, MiddlewareFn, MiddlewareNext } from "../server/middleware";
export { defineMiddleware } from "../server/middleware";
export type { RateLimitOptions } from "../server/rate-limit";
export { rateLimit } from "../server/rate-limit";
export { requestId } from "../server/request-id";
export { html, json, notFound, parseCookies, redirect, setCookie, text } from "../server/response";
export { loadRouteMiddleware } from "../server/route-middleware";
export type { SecurityOptions } from "../server/security";
export { securityHeaders } from "../server/security";
export type { SessionOptions, SessionStore } from "../server/session";
export { createMemoryStore, session } from "../server/session";
export type { SSEController } from "../server/sse";
export { createSSEStream } from "../server/sse";
export type { WSConnection, WSRoute } from "../server/ws";
export { createWSServer, defineWSRoute } from "../server/ws";
export type {
	FieldValidator,
	Schema,
	ValidationError,
	ValidationResult,
} from "../validation/index";
export { boolean, number, parseBody, string, validate } from "../validation/index";
