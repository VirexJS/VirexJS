import { Link } from "virexjs";

/** Public marketing layout */
export default function Marketing(props: { children: unknown }) {
	return (
		<div style={{ fontFamily: "system-ui, sans-serif", color: "#111" }}>
			<header style={{ borderBottom: "1px solid #e5e7eb", padding: "12px 0" }}>
				<nav style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
					<Link href="/" style={{ fontSize: "18px", fontWeight: "700", textDecoration: "none", color: "#111" }}>
						SaaS Starter
					</Link>
					<div style={{ display: "flex", gap: "16px", alignItems: "center", fontSize: "14px" }}>
						<Link href="/#features" style={{ color: "#6b7280", textDecoration: "none" }}>Features</Link>
						<Link href="/#pricing" style={{ color: "#6b7280", textDecoration: "none" }}>Pricing</Link>
						<Link href="/auth/login" style={{ color: "#6b7280", textDecoration: "none" }}>Login</Link>
						<Link href="/auth/register" style={{ padding: "8px 16px", background: "#0066cc", color: "#fff", borderRadius: "6px" }}>
							Get Started
						</Link>
					</div>
				</nav>
			</header>
			<main>{props.children}</main>
			<footer style={{ borderTop: "1px solid #e5e7eb", padding: "24px 16px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>
				Built with <Link href="https://virexjs.com" target="_blank">VirexJS</Link> — Ship HTML, not JavaScript.
			</footer>
		</div>
	);
}
