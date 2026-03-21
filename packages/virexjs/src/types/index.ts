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

/**
 * Helper to define a VirexJS config with type safety.
 * Merges user config with defaults.
 */
export function defineConfig(config: Partial<VirexConfig>): VirexConfig {
	return { ...DEFAULT_CONFIG, ...config } as VirexConfig;
}

export type { VirexConfig } from "../config/types";
export type { MetaData } from "../render/meta";
