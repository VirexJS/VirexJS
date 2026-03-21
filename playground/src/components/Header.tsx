/** Server-only header with navigation */
export default function Header() {
	const linkStyle = { textDecoration: "none", color: "#555", fontSize: "14px" };

	return (
		<header
			style={{
				borderBottom: "2px solid #f0f0f0",
				padding: "12px 0",
				background: "#fafafa",
			}}
		>
			<nav
				style={{
					display: "flex",
					alignItems: "center",
					gap: "20px",
					maxWidth: "900px",
					margin: "0 auto",
					padding: "0 16px",
					flexWrap: "wrap",
				}}
			>
				<a
					href="/"
					style={{
						fontWeight: "bold",
						fontSize: "18px",
						textDecoration: "none",
						color: "#111",
						marginRight: "auto",
					}}
				>
					VirexJS
				</a>
				<a href="/" style={linkStyle}>
					Home
				</a>
				<a href="/about" style={linkStyle}>
					About
				</a>
				<a href="/blog" style={linkStyle}>
					Blog
				</a>
				<a href="/features" style={linkStyle}>
					Features
				</a>
				<a href="/contact" style={linkStyle}>
					Contact
				</a>
				<a href="/i18n-demo" style={linkStyle}>
					i18n
				</a>
				<a href="/api-demo" style={linkStyle}>
					API
				</a>
				<a href="/db-demo" style={linkStyle}>
					DB
				</a>
				<a href="/realtime" style={linkStyle}>
					Realtime
				</a>
			</nav>
		</header>
	);
}
