import type { PageProps } from "virexjs";
import { useHead } from "virexjs";
import Toggle from "../islands/Toggle";
import Default from "../layouts/Default";

export default function Realtime(_props: PageProps) {
	const head = useHead({
		title: "Real-time — VirexJS",
		description: "WebSocket routes and Server-Sent Events.",
	});

	const codeStyle = {
		background: "#1e1e1e",
		color: "#d4d4d4",
		padding: "16px",
		borderRadius: "8px",
		fontSize: "13px",
		overflow: "auto" as const,
		lineHeight: "1.6",
	};

	return (
		<Default>
			{head}

			<h1 style={{ fontSize: "28px", margin: "0 0 8px" }}>Real-time</h1>
			<p style={{ color: "#666", margin: "0 0 24px" }}>
				WebSocket routes and Server-Sent Events — built on Bun native APIs.
			</p>

			<section>
				<h2 style={{ fontSize: "20px", margin: "0 0 12px" }}>Server-Sent Events (SSE)</h2>
				<p style={{ color: "#666", margin: "0 0 12px" }}>
					Try the live SSE stream:{" "}
					<a href="/api/events" style={{ color: "#0066cc" }}>
						/api/events
					</a>{" "}
					(opens a streaming connection, sends 10 ticks)
				</p>
				<pre style={codeStyle}>
					{`// src/api/events.ts
import { defineAPIRoute, createSSEStream } from "virexjs";

export const GET = defineAPIRoute(() => {
  const { response, send, close } = createSSEStream();

  send("connected", { message: "Stream started" });

  let count = 0;
  const interval = setInterval(() => {
    count++;
    send("tick", { count, time: new Date().toISOString() });
    if (count >= 10) { clearInterval(interval); close(); }
  }, 1000);

  return response;
});`}
				</pre>
			</section>

			<section style={{ marginTop: "32px" }}>
				<h2 style={{ fontSize: "20px", margin: "0 0 12px" }}>WebSocket Routes</h2>
				<pre style={codeStyle}>
					{`import { defineWSRoute, createWSServer } from "virexjs";

const chat = defineWSRoute({
  path: "/ws/chat",
  open(ws) { ws.send("Welcome!"); },
  message(ws, msg) { ws.send(\`Echo: \${msg}\`); },
  close() { console.log("Client left"); },
  upgrade(req) {
    // Optional: validate before upgrade
    return req.headers.get("Authorization") !== null;
  },
});

const wss = createWSServer({ port: 3002, routes: [chat] });`}
				</pre>
			</section>

			<section
				style={{
					marginTop: "32px",
					padding: "24px",
					background: "#f8f9fa",
					borderRadius: "8px",
				}}
			>
				<h2 style={{ fontSize: "20px", margin: "0 0 12px" }}>Toggle Island</h2>
				<p style={{ color: "#666", margin: "0 0 16px" }}>
					A second island component — click to show/hide content:
				</p>
				<Toggle label="Show Details" open={true} />
			</section>
		</Default>
	);
}
