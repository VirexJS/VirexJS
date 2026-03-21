export type { VirexPlugin, TransformHTMLContext, BuildResult, ServerInfo } from "./types";
export { PluginRunner } from "./runner";

/**
 * Helper to define a plugin with full type inference.
 *
 * Usage:
 *   export default definePlugin({
 *     name: "my-plugin",
 *     configResolved(config) { ... },
 *     transformHTML(html, ctx) { ... },
 *   });
 *
 * Or as a factory for configurable plugins:
 *   export default function myPlugin(options?: { inject?: boolean }) {
 *     return definePlugin({
 *       name: "my-plugin",
 *       transformHTML(html) {
 *         if (options?.inject) return html + "<script>...</script>";
 *       },
 *     });
 *   }
 */
import type { VirexPlugin } from "./types";

export function definePlugin(plugin: VirexPlugin): VirexPlugin {
	return plugin;
}
