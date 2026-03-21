import type { VirexConfig } from "../config/types";
import type { MiddlewareFn } from "../server/middleware";
import type { VirexPlugin, ServerInfo, BuildResult, TransformHTMLContext } from "./types";

/**
 * Plugin runner — orchestrates lifecycle hooks across registered plugins.
 * Plugins are called in registration order. Errors in one plugin do not
 * block others (logged to stderr).
 */
export class PluginRunner {
	private plugins: VirexPlugin[];

	constructor(plugins: VirexPlugin[]) {
		this.plugins = plugins;
	}

	/** Number of registered plugins */
	get count(): number {
		return this.plugins.length;
	}

	/** Get plugin names */
	get names(): string[] {
		return this.plugins.map((p) => p.name);
	}

	/** Run configResolved hooks — plugins may mutate the config */
	async runConfigResolved(config: VirexConfig): Promise<void> {
		for (const plugin of this.plugins) {
			if (plugin.configResolved) {
				try {
					await plugin.configResolved(config);
				} catch (err) {
					console.error(`[virex] plugin "${plugin.name}" configResolved error:`, err);
				}
			}
		}
	}

	/** Run serverCreated hooks */
	async runServerCreated(info: ServerInfo): Promise<void> {
		for (const plugin of this.plugins) {
			if (plugin.serverCreated) {
				try {
					await plugin.serverCreated(info);
				} catch (err) {
					console.error(`[virex] plugin "${plugin.name}" serverCreated error:`, err);
				}
			}
		}
	}

	/** Run buildStart hooks */
	async runBuildStart(config: VirexConfig): Promise<void> {
		for (const plugin of this.plugins) {
			if (plugin.buildStart) {
				try {
					await plugin.buildStart(config);
				} catch (err) {
					console.error(`[virex] plugin "${plugin.name}" buildStart error:`, err);
				}
			}
		}
	}

	/** Run buildEnd hooks */
	async runBuildEnd(result: BuildResult): Promise<void> {
		for (const plugin of this.plugins) {
			if (plugin.buildEnd) {
				try {
					await plugin.buildEnd(result);
				} catch (err) {
					console.error(`[virex] plugin "${plugin.name}" buildEnd error:`, err);
				}
			}
		}
	}

	/**
	 * Run transformHTML hooks in sequence.
	 * Each plugin receives the output of the previous plugin.
	 */
	async runTransformHTML(html: string, ctx: TransformHTMLContext): Promise<string> {
		let result = html;
		for (const plugin of this.plugins) {
			if (plugin.transformHTML) {
				try {
					const transformed = await plugin.transformHTML(result, ctx);
					if (typeof transformed === "string") {
						result = transformed;
					}
				} catch (err) {
					console.error(`[virex] plugin "${plugin.name}" transformHTML error:`, err);
				}
			}
		}
		return result;
	}

	/** Collect middleware from all plugins */
	collectMiddleware(): MiddlewareFn[] {
		const middlewares: MiddlewareFn[] = [];
		for (const plugin of this.plugins) {
			if (plugin.middleware) {
				try {
					const result = plugin.middleware();
					if (Array.isArray(result)) {
						middlewares.push(...result);
					} else {
						middlewares.push(result);
					}
				} catch (err) {
					console.error(`[virex] plugin "${plugin.name}" middleware error:`, err);
				}
			}
		}
		return middlewares;
	}
}
