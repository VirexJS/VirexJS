import { Link } from "virexjs";

export default function Default(props: { children: unknown }) {
	return (
		<div style={{ maxWidth: "700px", margin: "0 auto", padding: "0 16px", fontFamily: "system-ui, sans-serif", color: "#111" }}>
			<header style={{ padding: "20px 0", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				<Link href="/" style={{ fontSize: "20px", fontWeight: "700", textDecoration: "none", color: "#111" }}>
					Blog
				</Link>
				<nav style={{ display: "flex", gap: "16px", fontSize: "14px" }}>
					<Link href="/" style={{ color: "#6b7280", textDecoration: "none" }}>Home</Link>
					<Link href="/about" style={{ color: "#6b7280", textDecoration: "none" }}>About</Link>
				</nav>
			</header>
			<main style={{ padding: "32px 0" }}>{props.children}</main>
			<footer style={{ padding: "20px 0", borderTop: "1px solid #e5e7eb", color: "#9ca3af", fontSize: "13px", textAlign: "center" }}>
				Built with <Link href="https://virexjs.com" target="_blank">VirexJS</Link>
			</footer>
		</div>
	);
}
