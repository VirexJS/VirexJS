import { Link } from "virexjs";

/** Dashboard layout with sidebar */
export default function DashLayout(props: { children: unknown }) {
	const navLink = { display: "block", padding: "8px 16px", color: "#d1d5db", textDecoration: "none", fontSize: "14px", borderRadius: "6px" };

	return (
		<div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui" }}>
			<aside style={{ width: "220px", background: "#111827", padding: "16px", color: "#fff" }}>
				<Link href="/" style={{ fontSize: "16px", fontWeight: "700", color: "#fff", textDecoration: "none", display: "block", marginBottom: "24px" }}>
					SaaS Starter
				</Link>
				<nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
					<Link href="/dashboard" style={navLink}>Dashboard</Link>
					<Link href="/dashboard/projects" style={navLink}>Projects</Link>
					<Link href="/settings" style={navLink}>Settings</Link>
				</nav>
				<div style={{ marginTop: "auto", paddingTop: "24px", borderTop: "1px solid #374151", fontSize: "12px", color: "#6b7280" }}>
					demo@example.com
				</div>
			</aside>
			<main style={{ flex: 1, padding: "24px 32px", background: "#f9fafb" }}>
				{props.children}
			</main>
		</div>
	);
}
