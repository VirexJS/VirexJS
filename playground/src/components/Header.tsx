/** Server-only header component with navigation */
export default function Header() {
	return (
		<header style={{ borderBottom: "1px solid #eee", padding: "16px 0" }}>
			<nav style={{ display: "flex", gap: "16px", maxWidth: "800px", margin: "0 auto" }}>
				<a
					href="/"
					style={{ fontWeight: "bold", fontSize: "18px", textDecoration: "none", color: "#333" }}
				>
					⚡ VirexJS
				</a>
				<a href="/" style={{ textDecoration: "none", color: "#666" }}>
					Home
				</a>
				<a href="/about" style={{ textDecoration: "none", color: "#666" }}>
					About
				</a>
				<a href="/blog" style={{ textDecoration: "none", color: "#666" }}>
					Blog
				</a>
				<a href="/i18n-demo" style={{ textDecoration: "none", color: "#666" }}>
					i18n
				</a>
			</nav>
		</header>
	);
}
