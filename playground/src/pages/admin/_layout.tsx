/** Admin layout — wraps all /admin/* pages. Nested inside root layout. */
export default function AdminLayout(props: { children: unknown }) {
	return (
		<div>
			<div
				style={{
					background: "#1e293b",
					color: "#fff",
					padding: "8px 16px",
					fontSize: "13px",
					display: "flex",
					gap: "16px",
					alignItems: "center",
				}}
			>
				<strong>Admin Panel</strong>
				<a href="/admin" style={{ color: "#93c5fd", textDecoration: "none" }}>
					Dashboard
				</a>
				<a href="/admin/users" style={{ color: "#93c5fd", textDecoration: "none" }}>
					Users
				</a>
				<a href="/admin/notes" style={{ color: "#93c5fd", textDecoration: "none" }}>
					Notes
				</a>
			</div>
			{props.children}
		</div>
	);
}
