/** Per-route error boundary for /admin/* — like Next.js error.tsx */
export default function AdminError(props: { error?: string; stack?: string }) {
	return (
		<div style={{ padding: "32px", maxWidth: "600px", margin: "0 auto" }}>
			<div
				style={{
					padding: "20px",
					background: "#fef2f2",
					border: "1px solid #fecaca",
					borderRadius: "12px",
				}}
			>
				<h2 style={{ color: "#dc2626", margin: "0 0 8px", fontSize: "18px" }}>Admin Error</h2>
				<p style={{ color: "#991b1b", margin: "0 0 12px", fontSize: "14px" }}>
					{props.error ?? "Something went wrong in the admin panel."}
				</p>
				<a
					href="/admin"
					style={{
						display: "inline-block",
						padding: "8px 16px",
						background: "#dc2626",
						color: "#fff",
						borderRadius: "6px",
						textDecoration: "none",
						fontSize: "13px",
					}}
				>
					Back to Dashboard
				</a>
			</div>
		</div>
	);
}
