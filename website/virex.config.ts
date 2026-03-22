import { defineConfig } from "virexjs";

export default defineConfig({
	port: 3100,
	render: "static",
	build: {
		target: "static",
		minify: true,
		sourceMaps: false,
	},
});
