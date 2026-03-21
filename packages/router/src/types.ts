export interface ParamDef {
	name: string;
	type: "single" | "catchAll";
}

export interface RouteNode {
	/** URL segment: "blog", ":slug", "*rest" */
	segment: string;
	/** Absolute file path to .tsx/.ts file */
	filePath: string | null;
	/** Is this a dynamic param segment? */
	isDynamic: boolean;
	/** Is this a catch-all [...rest] segment? */
	isCatchAll: boolean;
	/** Is this a route group (parenthesized)? */
	isGroup: boolean;
	/** Extracted param definitions */
	params: ParamDef[];
	/** Child route nodes */
	children: RouteNode[];
}

export interface MatchResult {
	/** Matched route node */
	route: RouteNode;
	/** Extracted URL params */
	params: Record<string, string>;
	/** Parsed query string */
	query: Record<string, string>;
	/** Full matched path */
	path: string;
}

export interface ScannedRoute {
	/** Relative path from pages dir: "blog/[slug].tsx" */
	relativePath: string;
	/** Absolute file path */
	absolutePath: string;
	/** URL segments: ["blog", "[slug]"] */
	segments: string[];
}
