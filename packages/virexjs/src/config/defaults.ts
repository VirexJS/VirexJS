import type { VirexConfig } from "./types";

export const DEFAULT_CONFIG: VirexConfig = {
	port: 3000,
	hostname: "localhost",
	srcDir: "src",
	outDir: "dist",
	publicDir: "public",
	render: "server",
	islands: {
		hydration: "visible",
		reactCompat: "none",
	},
	router: {
		trailingSlash: false,
		basePath: "",
	},
	css: {
		engine: "passthrough",
	},
	build: {
		target: "bun",
		minify: true,
		sourceMaps: false,
	},
	dev: {
		open: false,
		hmr: true,
		hmrPort: 3001,
	},
	plugins: [],
};
