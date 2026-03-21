import type { MatchResult, RouteNode } from "./types";

/**
 * Match a URL path against the route tree.
 *
 * Priority order:
 * 1. Exact static match
 * 2. Index file match (trailing / → index)
 * 3. Dynamic param match (:slug)
 * 4. Catch-all match (*rest)
 * 5. null (no match → 404)
 *
 * Also parses query string from the URL.
 */
export function matchRoute(url: string, tree: RouteNode): MatchResult | null {
	// Split URL from query string
	const questionIndex = url.indexOf("?");
	const pathname = questionIndex >= 0 ? url.slice(0, questionIndex) : url;
	const queryString = questionIndex >= 0 ? url.slice(questionIndex + 1) : "";

	// Parse query params
	const query = parseQuery(queryString);

	// Normalize path: remove trailing slash (except root)
	let normalizedPath = pathname;
	if (normalizedPath.length > 1 && normalizedPath.endsWith("/")) {
		normalizedPath = normalizedPath.slice(0, -1);
	}

	// Split into segments
	const segments = normalizedPath === "/" ? [] : normalizedPath.slice(1).split("/");

	// Walk the tree
	const result = walkTree(tree, segments, 0);
	if (!result) {
		return null;
	}

	return {
		route: result.node,
		params: result.params,
		query,
		path: normalizedPath,
	};
}

interface WalkResult {
	node: RouteNode;
	params: Record<string, string>;
}

function walkTree(node: RouteNode, segments: string[], depth: number): WalkResult | null {
	// We've consumed all segments — check if this node has a file
	if (depth === segments.length) {
		if (node.filePath !== null) {
			return { node, params: {} };
		}
		// Check for index child
		for (const child of node.children) {
			if (child.filePath !== null && child.segment === "") {
				return { node: child, params: {} };
			}
		}
		return null;
	}

	const segment = segments[depth]!;

	// 1. Try static children first
	for (const child of node.children) {
		if (!child.isDynamic && !child.isCatchAll && !child.isGroup) {
			if (child.segment === segment) {
				const result = walkTree(child, segments, depth + 1);
				if (result) {
					return result;
				}
			}
		}
	}

	// 2. Try group children (transparent — don't consume segment)
	for (const child of node.children) {
		if (child.isGroup) {
			const result = walkTree(child, segments, depth);
			if (result) {
				return result;
			}
		}
	}

	// 3. Try dynamic children
	for (const child of node.children) {
		if (child.isDynamic && !child.isCatchAll) {
			const result = walkTree(child, segments, depth + 1);
			if (result) {
				const paramName = child.params[0]?.name;
				if (paramName) {
					result.params[paramName] = decodeURIComponent(segment);
				}
				return result;
			}
		}
	}

	// 4. Try catch-all children
	for (const child of node.children) {
		if (child.isCatchAll && child.filePath !== null) {
			const paramName = child.params[0]?.name;
			const remainingSegments = segments.slice(depth);
			const params: Record<string, string> = {};
			if (paramName) {
				params[paramName] = remainingSegments.map(decodeURIComponent).join("/");
			}
			return { node: child, params };
		}
	}

	return null;
}

/**
 * Parse a query string into a Record<string, string>.
 */
function parseQuery(queryString: string): Record<string, string> {
	const query: Record<string, string> = {};
	if (!queryString) {
		return query;
	}

	const pairs = queryString.split("&");
	for (const pair of pairs) {
		const eqIndex = pair.indexOf("=");
		if (eqIndex >= 0) {
			const key = decodeURIComponent(pair.slice(0, eqIndex));
			const value = decodeURIComponent(pair.slice(eqIndex + 1));
			query[key] = value;
		} else if (pair) {
			query[decodeURIComponent(pair)] = "";
		}
	}

	return query;
}
