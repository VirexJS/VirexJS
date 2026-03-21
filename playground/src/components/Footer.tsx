/** Server-only footer */
export default function Footer() {
	return (
		<footer
			style={{
				borderTop: "2px solid #f0f0f0",
				padding: "24px 0",
				marginTop: "48px",
				textAlign: "center",
				color: "#999",
				fontSize: "13px",
			}}
		>
			<p style={{ margin: "0 0 4px 0" }}>
				Built with <strong>VirexJS</strong> — Ship HTML, not JavaScript.
			</p>
			<p style={{ margin: 0 }}>
				<a href="/api/hello" style={{ color: "#0066cc", textDecoration: "none" }}>
					API
				</a>
				{" | "}
				<a href="/api/health" style={{ color: "#0066cc", textDecoration: "none" }}>
					Health
				</a>
			</p>
		</footer>
	);
}
