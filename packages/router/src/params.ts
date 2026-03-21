import type { ParamDef } from "./types";

/**
 * Parse a file/directory name into a param definition.
 * "[slug]" → { name: "slug", type: "single" }
 * "[...rest]" → { name: "rest", type: "catchAll" }
 * "blog" → null (not dynamic)
 */
export function parseSegment(segment: string): ParamDef | null {
	if (segment.startsWith("[...") && segment.endsWith("]")) {
		return { name: segment.slice(4, -1), type: "catchAll" };
	}
	if (segment.startsWith("[") && segment.endsWith("]")) {
		return { name: segment.slice(1, -1), type: "single" };
	}
	return null;
}

/**
 * Convert a file segment to a URL segment.
 * "[slug]" → ":slug"
 * "[...rest]" → "*rest"
 * "(auth)" → null (group, no URL segment)
 * "blog" → "blog"
 */
export function segmentToURL(segment: string): string | null {
	if (segment.startsWith("(") && segment.endsWith(")")) {
		return null;
	}
	if (segment.startsWith("[...") && segment.endsWith("]")) {
		return `*${segment.slice(4, -1)}`;
	}
	if (segment.startsWith("[") && segment.endsWith("]")) {
		return `:${segment.slice(1, -1)}`;
	}
	return segment;
}

/**
 * Extract param values from a URL path given a route pattern.
 * Pattern: ["blog", ":slug"], Path: ["blog", "hello-world"]
 * → { slug: "hello-world" }
 */
export function extractParams(
	patternSegments: string[],
	pathSegments: string[],
): Record<string, string> | null {
	const params: Record<string, string> = {};

	for (let i = 0; i < patternSegments.length; i++) {
		const pattern = patternSegments[i]!;
		const path = pathSegments[i];

		if (pattern.startsWith("*")) {
			const name = pattern.slice(1);
			params[name] = pathSegments.slice(i).join("/");
			return params;
		}

		if (path === undefined) {
			return null;
		}

		if (pattern.startsWith(":")) {
			const name = pattern.slice(1);
			params[name] = decodeURIComponent(path);
		} else if (pattern !== path) {
			return null;
		}
	}

	if (patternSegments.length !== pathSegments.length) {
		const lastPattern = patternSegments[patternSegments.length - 1];
		if (!lastPattern?.startsWith("*")) {
			return null;
		}
	}

	return params;
}
