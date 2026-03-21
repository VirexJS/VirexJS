import type { PageProps } from "virexjs";
import { useHead } from "virexjs";
import Default from "../layouts/Default";

export default function APIDemo(_props: PageProps) {
	const head = useHead({
		title: "API Demo — VirexJS",
		description: "Interactive API endpoint explorer.",
	});

	const codeStyle = {
		background: "#1e1e1e",
		color: "#d4d4d4",
		padding: "16px",
		borderRadius: "8px",
		fontSize: "13px",
		overflow: "auto" as const,
		lineHeight: "1.5",
	};

	const endpoints = [
		{
			method: "GET",
			path: "/api/hello",
			desc: "Returns a greeting with timestamp",
			curl: "curl http://localhost:3000/api/hello",
			response: '{"message":"Hello from VirexJS!","timestamp":...}',
		},
		{
			method: "POST",
			path: "/api/hello",
			desc: "Echoes the request body back",
			curl: 'curl -X POST -H "Content-Type: application/json" -d \'{"name":"test"}\' http://localhost:3000/api/hello',
			response: '{"received":true,"echo":{"name":"test"}}',
		},
		{
			method: "POST",
			path: "/api/contact",
			desc: "Validates and processes contact form",
			curl: 'curl -X POST -H "Content-Type: application/json" -d \'{"name":"A","email":"bad","message":"hi"}\' http://localhost:3000/api/contact',
			response: '{"success":false,"errors":[...]}',
		},
		{
			method: "GET",
			path: "/api/health",
			desc: "Health check endpoint",
			curl: "curl http://localhost:3000/api/health",
			response: '{"status":"healthy","timestamp":"...","uptime":...}',
		},
		{
			method: "GET",
			path: "/api/notes",
			desc: "List all notes from SQLite database",
			curl: "curl http://localhost:3000/api/notes",
			response: '{"notes":[{"id":1,"title":"Welcome",...}],"total":3}',
		},
		{
			method: "POST",
			path: "/api/notes",
			desc: "Create a new note in SQLite",
			curl: 'curl -X POST -H "Content-Type: application/json" -d \'{"title":"Test","content":"Hello"}\' http://localhost:3000/api/notes',
			response: '{"note":{"id":4,"title":"Test",...}}',
		},
		{
			method: "GET",
			path: "/api/events",
			desc: "SSE stream — sends 10 ticks (1/sec)",
			curl: "curl http://localhost:3000/api/events",
			response: 'event: tick\\ndata: {"count":1,...}',
		},
	];

	return (
		<Default>
			{head}

			<h1 style={{ fontSize: "28px", margin: "0 0 8px" }}>API Endpoints</h1>
			<p style={{ color: "#666", margin: "0 0 24px" }}>
				All API routes are defined in <code>src/api/</code>. Try them with curl or your browser.
			</p>

			<div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
				{endpoints.map((ep) => (
					<div style={{ border: "1px solid #eee", borderRadius: "8px", overflow: "hidden" }}>
						<div
							style={{
								padding: "12px 16px",
								background: "#fafafa",
								borderBottom: "1px solid #eee",
								display: "flex",
								alignItems: "center",
								gap: "8px",
							}}
						>
							<span
								style={{
									padding: "2px 8px",
									borderRadius: "4px",
									fontSize: "12px",
									fontWeight: "bold",
									color: "#fff",
									background: ep.method === "GET" ? "#22c55e" : "#3b82f6",
								}}
							>
								{ep.method}
							</span>
							<code style={{ fontSize: "14px", color: "#333" }}>{ep.path}</code>
							<span style={{ color: "#999", fontSize: "13px", marginLeft: "auto" }}>{ep.desc}</span>
						</div>
						<pre style={codeStyle}>
							<span style={{ color: "#888" }}>{"$ "}</span>
							{ep.curl}
							{"\n\n"}
							<span style={{ color: "#6a9955" }}>{"// Response:"}</span>
							{"\n"}
							{ep.response}
						</pre>
					</div>
				))}
			</div>

			<section
				style={{ marginTop: "32px", padding: "20px", background: "#f0f7ff", borderRadius: "8px" }}
			>
				<h3 style={{ margin: "0 0 8px" }}>API Route Features</h3>
				<ul style={{ margin: 0, paddingLeft: "20px", color: "#555", lineHeight: "1.8" }}>
					<li>
						<strong>defineAPIRoute()</strong> — type-safe route handlers
					</li>
					<li>
						<strong>json()</strong>, <strong>redirect()</strong>, <strong>notFound()</strong> —
						response helpers
					</li>
					<li>
						<strong>validate()</strong> — request body validation
					</li>
					<li>
						<strong>cors()</strong> — CORS middleware
					</li>
					<li>
						<strong>rateLimit()</strong> — rate limiting per client
					</li>
					<li>
						<strong>bodyLimit()</strong> — request size protection
					</li>
					<li>
						<strong>createJWT()</strong> / <strong>verifyJWT()</strong> — authentication
					</li>
				</ul>
			</section>
		</Default>
	);
}
