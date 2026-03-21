export { PluginRunner } from "./runner";
export type { BuildResult, ServerInfo, TransformHTMLContext, VirexPlugin } from "./types";

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
