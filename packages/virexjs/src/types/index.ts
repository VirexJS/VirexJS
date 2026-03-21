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
export type { MiddlewareContext, MiddlewareNext, MiddlewareFn } from "../server/middleware";
export type { VirexConfig } from "../config/types";
export type { MetaData } from "../render/meta";
export { definePlugin } from "../plugin/index";
export type { VirexPlugin, TransformHTMLContext, BuildResult, ServerInfo } from "../plugin/types";
