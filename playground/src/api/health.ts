import { defineAPIRoute, json } from "virexjs";

export const GET = defineAPIRoute(() => {
	return json({
		status: "healthy",
		timestamp: new Date().toISOString(),
		uptime: Math.round(process.uptime()),
		version: "0.1.0",
		runtime: `Bun ${Bun.version}`,
	});
});
