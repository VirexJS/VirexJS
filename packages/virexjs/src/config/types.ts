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
}
