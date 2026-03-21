import { createSSEStream, defineAPIRoute } from "virexjs";

/** SSE endpoint — streams server events to the client */
export const GET = defineAPIRoute(() => {
	const { response, send, close } = createSSEStream();

	// Send initial data
	send("connected", { message: "SSE stream started", time: new Date().toISOString() });

	// Send periodic updates
	let count = 0;
	const interval = setInterval(() => {
		count++;
		send("tick", { count, time: new Date().toISOString() });

		if (count >= 10) {
			send("done", { message: "Stream complete" });
			clearInterval(interval);
			close();
		}
	}, 1000);

	return response;
});
