import { Link } from "virexjs";

/** Server-only header with grouped navigation using Link component */
export default function Header() {
	const mainNav = [
		{ href: "/features", label: "Features" },
		{ href: "/islands", label: "Islands" },
		{ href: "/blog", label: "Blog" },
		{ href: "/admin", label: "Admin" },
	];

	const secondaryNav = [
		{ href: "/about", label: "About" },
		{ href: "/contact", label: "Contact" },
		{ href: "/cached", label: "ISR" },
		{ href: "/api-demo", label: "API" },
		{ href: "/db-demo", label: "DB" },
		{ href: "/realtime", label: "RT" },
		{ href: "/i18n-demo", label: "i18n" },
		{ href: "/api/docs", label: "Docs" },
	];

	const linkStyle = {
		textDecoration: "none",
		color: "#4b5563",
		fontSize: "14px",
		padding: "6px 12px",
		borderRadius: "6px",
	};

	const mutedStyle = { ...linkStyle, fontSize: "13px", color: "#9ca3af" };

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
				<Link
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
				</Link>

				{mainNav.map((item) => (
					<Link
						href={item.href}
						prefetch
						style={
							item.label === "Admin"
								? { ...linkStyle, color: "#0066cc", fontWeight: "500" }
								: linkStyle
						}
					>
						{item.label}
					</Link>
				))}

				<span style={{ width: "1px", height: "20px", background: "#e5e7eb", margin: "0 4px" }} />

				{secondaryNav.map((item) => (
					<Link href={item.href} style={mutedStyle}>
						{item.label}
					</Link>
				))}
			</nav>
		</header>
	);
}
