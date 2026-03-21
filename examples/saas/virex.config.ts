import { defineConfig, definePlugin } from "virexjs";

const analyticsPlugin = definePlugin({
	name: "analytics",
	serverCreated(info) {
		console.log(`  Analytics: tracking ${info.routeCount} routes`);
	},
});

export default defineConfig({
	port: 3000,
	render: "server",
	plugins: [analyticsPlugin],
	redirects: [{ source: "/signup", destination: "/auth/register", permanent: false }],
});
