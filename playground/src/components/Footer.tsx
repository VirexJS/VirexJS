import { Link } from "virexjs";

/** Server-only footer */
export default function Footer() {
	const sep = { color: "#d1d5db", margin: "0 4px" };
	return (
		<footer
			style={{
				borderTop: "1px solid #e5e7eb",
				padding: "20px 16px",
				textAlign: "center",
				color: "#9ca3af",
				fontSize: "13px",
				maxWidth: "900px",
				margin: "48px auto 0",
			}}
		>
			<p style={{ margin: "0 0 6px" }}>
				Built with <strong style={{ color: "#6b7280" }}>VirexJS</strong> — Ship HTML, not
				JavaScript. JavaScript.
			</p>
			<p style={{ margin: 0 }}>
				<Link href="/api/hello">API</Link>
				<span style={sep}>|</span>
				<Link href="/api/health">Health</Link>
				<span style={sep}>|</span>
				<Link href="/api/notes">Notes</Link>
				<span style={sep}>|</span>
				<Link href="/api/docs">Docs</Link>
			</p>
		</footer>
	);
}
