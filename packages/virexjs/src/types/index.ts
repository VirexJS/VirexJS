import type { VirexConfig } from "../config/types";
import { DEFAULT_CONFIG } from "../config/defaults";

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
export function defineLoader<T extends Record<string, unknown>>(
	fn: LoaderFn<T>,
): LoaderFn<T> {
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

export { defineMiddleware } from "../server/middleware";
export { redirect, json, html, notFound, text, setCookie, parseCookies } from "../server/response";
export { cors } from "../server/cors";
export type { CORSOptions } from "../server/cors";
export { rateLimit } from "../server/rate-limit";
export type { RateLimitOptions } from "../server/rate-limit";
export { loadEnv, parseEnvFile } from "../config/env";
export { createLogger } from "../server/logger";
export type { Logger, LogLevel } from "../server/logger";
export { securityHeaders } from "../server/security";
export type { SecurityOptions } from "../server/security";
export { createCache } from "../server/cache";
export type { Cache } from "../server/cache";
export { validate, parseBody, string, number, boolean } from "../validation/index";
export type { Schema, ValidationResult, ValidationError, FieldValidator } from "../validation/index";
export { JsonLd, createBreadcrumbs, createFAQ } from "../render/json-ld";
export { defineWSRoute, createWSServer } from "../server/ws";
export type { WSRoute, WSConnection } from "../server/ws";
export { session, createMemoryStore } from "../server/session";
export type { SessionOptions, SessionStore } from "../server/session";
export { createSSEStream } from "../server/sse";
export type { SSEController } from "../server/sse";
export { createJWT, verifyJWT, decodeJWT, JWTError } from "../auth/jwt";
export type { JWTPayload, JWTOptions } from "../auth/jwt";
export { guard } from "../auth/guard";
export type { GuardOptions } from "../auth/guard";
export { defineAction, actionRedirect, actionJson, parseFormData } from "../server/action";
export type { ActionContext, ActionHandler } from "../server/action";
export { requestId } from "../server/request-id";
export { healthCheck } from "../server/health";
export type { StructuredData, ArticleLD, BreadcrumbLD, FAQLD } from "../render/json-ld";
export type { MiddlewareContext, MiddlewareNext, MiddlewareFn } from "../server/middleware";
export type { VirexConfig } from "../config/types";
export type { MetaData } from "../render/meta";
export { Head } from "../render/head";
export { useHead } from "../render/use-head";
export type { UseHeadOptions } from "../render/use-head";
export { ErrorBoundary } from "../render/error-boundary";
export type { ErrorBoundaryProps } from "../render/error-boundary";
export { definePlugin } from "../plugin/index";
export { createI18n, defineTranslations, detectLocale } from "../i18n/index";
export type { I18n, Translations, LocaleMap } from "../i18n/index";
export type { VirexPlugin, TransformHTMLContext, BuildResult, ServerInfo } from "../plugin/types";
