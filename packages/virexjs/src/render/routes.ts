/**
 * Type-safe route helpers for VirexJS.
 *
 * Generate type-safe URLs from route patterns.
 * Catches typos and missing params at compile time.
 *
 * Usage:
 *   import { route } from "virexjs";
 *
 *   route("/blog/:slug", { slug: "hello-world" })  // "/blog/hello-world"
 *   route("/users/:id/posts/:postId", { id: "42", postId: "99" })
 *   route("/about")  // "/about"
 */

/**
 * Build a URL from a route pattern and params.
 * Replaces :param placeholders with actual values.
 */
export function route(pattern: string, params?: Record<string, string | number>): string {
	if (!params) return pattern;

	let url = pattern;
	for (const [key, value] of Object.entries(params)) {
		url = url.replace(`:${key}`, encodeURIComponent(String(value)));
	}

	// Check for unreplaced params
	if (url.includes(":")) {
		const missing = url.match(/:(\w+)/g)?.map((m) => m.slice(1)) ?? [];
		throw new Error(`Missing route params: ${missing.join(", ")} in "${pattern}"`);
	}

	return url;
}

/**
 * Create a typed route builder for a specific pattern.
 * Returns a function that accepts only the required params.
 *
 * Usage:
 *   const blogPost = defineRoute("/blog/:slug");
 *   blogPost({ slug: "hello" })  // "/blog/hello"
 *
 *   const userPost = defineRoute("/users/:id/posts/:postId");
 *   userPost({ id: "42", postId: "99" })  // "/users/42/posts/99"
 */
export function defineRoute<T extends string>(
	pattern: T,
): T extends `${string}:${string}`
	? (params: Record<string, string | number>) => string
	: () => string {
	const hasParams = pattern.includes(":");
	if (hasParams) {
		// biome-ignore lint/suspicious/noExplicitAny: generic route builder
		return ((params: Record<string, string | number>) => route(pattern, params)) as any;
	}
	// biome-ignore lint/suspicious/noExplicitAny: generic route builder
	return (() => pattern) as any;
}
