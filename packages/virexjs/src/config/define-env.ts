/**
 * Type-safe environment variables.
 *
 * Define required env vars with types and defaults.
 * Throws at startup if required vars are missing.
 *
 * Usage:
 *   const env = defineEnv({
 *     DATABASE_URL: { type: "string", required: true },
 *     PORT: { type: "number", default: 3000 },
 *     DEBUG: { type: "boolean", default: false },
 *     API_KEYS: { type: "string[]", default: [] },
 *   });
 *
 *   env.DATABASE_URL  // string (guaranteed)
 *   env.PORT          // number
 *   env.DEBUG         // boolean
 */

interface EnvVarDef {
	type: "string" | "number" | "boolean" | "string[]";
	required?: boolean;
	default?: string | number | boolean | string[];
	description?: string;
}

type EnvSchema = Record<string, EnvVarDef>;

type InferEnvType<T extends EnvVarDef> = T["type"] extends "string"
	? string
	: T["type"] extends "number"
		? number
		: T["type"] extends "boolean"
			? boolean
			: T["type"] extends "string[]"
				? string[]
				: unknown;

type InferEnv<S extends EnvSchema> = {
	[K in keyof S]: InferEnvType<S[K]>;
};

/**
 * Define and validate environment variables at startup.
 * Returns a typed object with coerced values.
 */
export function defineEnv<S extends EnvSchema>(schema: S): InferEnv<S> {
	const result: Record<string, unknown> = {};
	const errors: string[] = [];

	for (const [key, def] of Object.entries(schema)) {
		const raw = process.env[key];

		if (raw === undefined || raw === "") {
			if (def.required && def.default === undefined) {
				errors.push(
					`Missing required env var: ${key}${def.description ? ` (${def.description})` : ""}`,
				);
				continue;
			}
			result[key] = def.default;
			continue;
		}

		// Coerce to correct type
		switch (def.type) {
			case "string":
				result[key] = raw;
				break;
			case "number": {
				const num = Number(raw);
				if (Number.isNaN(num)) {
					errors.push(`Env var ${key} must be a number, got "${raw}"`);
				} else {
					result[key] = num;
				}
				break;
			}
			case "boolean":
				result[key] = raw === "true" || raw === "1" || raw === "yes";
				break;
			case "string[]":
				result[key] = raw
					.split(",")
					.map((s) => s.trim())
					.filter(Boolean);
				break;
		}
	}

	if (errors.length > 0) {
		throw new Error(`Environment validation failed:\n  ${errors.join("\n  ")}`);
	}

	return result as InferEnv<S>;
}
