import { defineConfig, definePlugin } from "virexjs";

/** Example plugin: injects build timestamp into HTML responses */
const buildInfoPlugin = definePlugin({
	name: "build-info",
	transformHTML(html) {
		const timestamp = new Date().toISOString();
		return html.replace("</body>", `<!-- Built with VirexJS at ${timestamp} --></body>`);
	},
	serverCreated(info) {
		console.log(`  Plugins: build-info loaded (${info.routeCount} routes)`);
	},
});

export default defineConfig({
	port: 3000,
	render: "server",
	plugins: [buildInfoPlugin],
});
