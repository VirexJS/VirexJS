import type { VirexConfig } from "../config/types";
import type { MiddlewareFn } from "../server/middleware";

/** Context passed to the transformHTML hook */
export interface TransformHTMLContext {
	/** The request URL pathname */
	pathname: string;
	/** Route params if matched */
	params: Record<string, string>;
	/** The original request */
	request: Request;
}

/** Build result info passed to the buildEnd hook */
export interface BuildResult {
	/** Number of static pages generated */
	pages: number;
	/** Number of assets copied */
	assets: number;
	/** Total size in bytes */
	totalSize: number;
	/** Output directory */
	outDir: string;
}

/** Server info passed to the serverCreated hook */
export interface ServerInfo {
	/** Port the server is listening on */
	port: number;
	/** Hostname the server is bound to */
	hostname: string;
	/** Number of routes registered */
	routeCount: number;
}

/**
 * VirexJS plugin definition.
 *
 * Plugins hook into the framework lifecycle to extend functionality.
 * All hooks are optional and called in the order plugins are registered.
 */
export interface VirexPlugin {
	/** Unique plugin name (used for logging and debugging) */
	name: string;

	/**
	 * Called after the config is fully resolved (defaults merged).
	 * Can mutate the config object to modify framework behavior.
	 */
	configResolved?: (config: VirexConfig) => void | Promise<void>;

	/**
	 * Called when the dev/preview server is created and ready.
	 */
	serverCreated?: (info: ServerInfo) => void | Promise<void>;

	/**
	 * Called before the production build starts.
	 */
	buildStart?: (config: VirexConfig) => void | Promise<void>;

	/**
	 * Called after the production build completes.
	 */
	buildEnd?: (result: BuildResult) => void | Promise<void>;

	/**
	 * Transform the rendered HTML before it is sent as a response.
	 * Return the modified HTML string, or undefined to leave it unchanged.
	 */
	transformHTML?: (
		html: string,
		ctx: TransformHTMLContext,
	) => string | undefined | Promise<string | undefined>;

	/**
	 * Return middleware functions to inject into the server's middleware chain.
	 * Called once when the server is being set up.
	 */
	middleware?: () => MiddlewareFn | MiddlewareFn[];
}
