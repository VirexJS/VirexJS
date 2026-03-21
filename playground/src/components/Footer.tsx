/** Server-only footer */
export default function Footer() {
	const sep = { color: "#d1d5db", margin: "0 4px" };
	return (
		<footer
			style={{
				borderTop: "1px solid #e5e7eb",
				padding: "20px 16px",
				marginTop: "48px",
				textAlign: "center",
				color: "#9ca3af",
				fontSize: "13px",
				maxWidth: "900px",
				margin: "48px auto 0",
			}}
		>
			<p style={{ margin: "0 0 6px" }}>
				Built with <strong style={{ color: "#6b7280" }}>VirexJS</strong> — Ship HTML, not
				JavaScript.
			</p>
			<p style={{ margin: 0 }}>
				<a href="/api/hello">API</a>
				<span style={sep}>|</span>
				<a href="/api/health">Health</a>
				<span style={sep}>|</span>
				<a href="/api/notes">Notes</a>
				<span style={sep}>|</span>
				<a href="/api/events">SSE</a>
			</p>
		</footer>
	);
}
