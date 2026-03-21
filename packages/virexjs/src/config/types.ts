import type { VirexPlugin } from "../plugin/types";

/** URL redirect rule */
export interface RedirectRule {
	/** Source path pattern (supports :param) */
	source: string;
	/** Destination URL */
	destination: string;
	/** HTTP status code. Default: 308 */
	permanent?: boolean;
}

/** URL rewrite rule */
export interface RewriteRule {
	/** Source path pattern */
	source: string;
	/** Destination path (internal rewrite, URL stays the same) */
	destination: string;
}

/** Custom header rule */
export interface HeaderRule {
	/** Path pattern to match */
	source: string;
	/** Headers to set */
	headers: Array<{ key: string; value: string }>;
}

export interface VirexConfig {
	port: number;
	hostname: string;
	srcDir: string;
	outDir: string;
	publicDir: string;
	render: "static" | "server" | "hybrid";
	islands: {
		hydration: "visible" | "interaction" | "idle" | "immediate";
		reactCompat: "shim" | "react" | "none";
	};
	router: {
		trailingSlash: boolean;
		basePath: string;
	};
	css: {
		engine: "passthrough" | "tailwind" | "virex" | "both";
	};
	build: {
		target: "bun" | "static";
		minify: boolean;
		sourceMaps: boolean;
	};
	dev: {
		open: boolean;
		hmr: boolean;
		hmrPort: number;
	};
	/** Registered plugins */
	plugins: VirexPlugin[];
	/** URL redirects (like Next.js redirects) */
	redirects?: RedirectRule[];
	/** URL rewrites (like Next.js rewrites) */
	rewrites?: RewriteRule[];
	/** Custom response headers */
	headers?: HeaderRule[];
}
