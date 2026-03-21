import { join } from "node:path";
import { DEFAULT_CONFIG } from "./defaults";
import type { VirexConfig } from "./types";

/**
 * Load config from virex.config.ts in the current working directory.
 * Deep-merge with defaults.
 * If no config file found, use defaults.
 */
export async function loadConfig(cwd?: string): Promise<VirexConfig> {
	const dir = cwd ?? process.cwd();
	const configPath = join(dir, "virex.config.ts");

	try {
		const configModule = await import(configPath);
		const userConfig = configModule.default ?? configModule;
		return deepMerge(
			DEFAULT_CONFIG as unknown as Record<string, unknown>,
			userConfig as Record<string, unknown>,
		) as unknown as VirexConfig;
	} catch {
		return { ...DEFAULT_CONFIG };
	}
}

/**
 * Deep merge two objects. Source values override target values.
 */
function deepMerge(
	target: Record<string, unknown>,
	source: Record<string, unknown>,
): Record<string, unknown> {
	const result: Record<string, unknown> = { ...target };

	for (const key of Object.keys(source)) {
		const sourceVal = source[key];
		const targetVal = target[key];

		if (isPlainObject(sourceVal) && isPlainObject(targetVal)) {
			result[key] = deepMerge(
				targetVal as Record<string, unknown>,
				sourceVal as Record<string, unknown>,
			);
		} else if (sourceVal !== undefined) {
			result[key] = sourceVal;
		}
	}

	return result;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export { DEFAULT_CONFIG } from "./defaults";
export type { VirexConfig } from "./types";
