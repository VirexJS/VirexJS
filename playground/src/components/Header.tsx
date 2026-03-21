/** Server-only header with navigation */
export default function Header() {
	const link = { textDecoration: "none", color: "#4b5563", fontSize: "14px" };

	const navItems = [
		{ href: "/", label: "Home" },
		{ href: "/about", label: "About" },
		{ href: "/features", label: "Features" },
		{ href: "/islands", label: "Islands" },
		{ href: "/blog", label: "Blog" },
		{ href: "/contact", label: "Contact" },
		{ href: "/api-demo", label: "API" },
		{ href: "/db-demo", label: "Database" },
		{ href: "/realtime", label: "Realtime" },
		{ href: "/i18n-demo", label: "i18n" },
	];

	return (
		<header style={{ borderBottom: "1px solid #e5e7eb", background: "#fff" }}>
			<nav
				style={{
					display: "flex",
					alignItems: "center",
					gap: "6px",
					maxWidth: "900px",
					margin: "0 auto",
					padding: "10px 16px",
					flexWrap: "wrap",
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
				{navItems.map((item) => (
					<a
						href={item.href}
						style={{
							...link,
							padding: "4px 10px",
							borderRadius: "6px",
						}}
					>
						{item.label}
					</a>
				))}
			</nav>
		</header>
	);
}
