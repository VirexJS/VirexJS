/** Server-only header with grouped navigation */
export default function Header() {
	const link = {
		textDecoration: "none",
		color: "#4b5563",
		fontSize: "14px",
		padding: "6px 12px",
		borderRadius: "6px",
	};

	return (
		<header style={{ borderBottom: "1px solid #e5e7eb", background: "#fff" }}>
			<nav
				style={{
					display: "flex",
					alignItems: "center",
					gap: "4px",
					maxWidth: "900px",
					margin: "0 auto",
					padding: "10px 16px",
				}}
			>
				<a
					href="/"
					style={{
						fontWeight: "700",
						fontSize: "17px",
						textDecoration: "none",
						color: "#111",
						marginRight: "auto",
						display: "flex",
						alignItems: "center",
						gap: "6px",
					}}
				>
					<span
						style={{
							background: "#0066cc",
							color: "#fff",
							width: "24px",
							height: "24px",
							borderRadius: "6px",
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: "13px",
							fontWeight: "800",
						}}
					>
						V
					</span>
					VirexJS
				</a>

				{/* Main nav */}
				<a href="/features" style={link}>
					Features
				</a>
				<a href="/islands" style={link}>
					Islands
				</a>
				<a href="/blog" style={link}>
					Blog
				</a>
				<a href="/admin" style={{ ...link, color: "#0066cc", fontWeight: "500" }}>
					Admin
				</a>

				{/* Separator */}
				<span style={{ width: "1px", height: "20px", background: "#e5e7eb", margin: "0 4px" }} />

				{/* Secondary nav — smaller */}
				<a href="/about" style={{ ...link, fontSize: "13px", color: "#9ca3af" }}>
					About
				</a>
				<a href="/contact" style={{ ...link, fontSize: "13px", color: "#9ca3af" }}>
					Contact
				</a>
				<a href="/api-demo" style={{ ...link, fontSize: "13px", color: "#9ca3af" }}>
					API
				</a>
				<a href="/db-demo" style={{ ...link, fontSize: "13px", color: "#9ca3af" }}>
					DB
				</a>
				<a href="/realtime" style={{ ...link, fontSize: "13px", color: "#9ca3af" }}>
					RT
				</a>
				<a href="/i18n-demo" style={{ ...link, fontSize: "13px", color: "#9ca3af" }}>
					i18n
				</a>
			</nav>
		</header>
	);
}
