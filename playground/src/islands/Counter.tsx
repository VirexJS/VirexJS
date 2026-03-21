// "use island"

/**
 * Interactive counter island component.
 * Server-side: renders static HTML with current count.
 * Client-side: after hydration, buttons become interactive.
 *
 * The `onClick` handlers are stripped during server rendering
 * and re-attached by the hydration runtime on the client.
 */
export default function Counter(props: { initial?: number }) {
	const count = props.initial ?? 0;

	return (
		<div
			style={{
				border: "1px solid #ddd",
				borderRadius: "8px",
				padding: "16px",
				display: "inline-block",
			}}
		>
			<p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#666" }}>Island Component</p>
			<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
				<button
					type="button"
					onClick={() => {}}
					style={{
						padding: "4px 12px",
						fontSize: "16px",
						cursor: "pointer",
						border: "1px solid #ccc",
						borderRadius: "4px",
						background: "#f9f9f9",
					}}
				>
					-
				</button>
				<span
					style={{ fontSize: "24px", fontWeight: "bold", minWidth: "40px", textAlign: "center" }}
				>
					{count}
				</span>
				<button
					type="button"
					onClick={() => {}}
					style={{
						padding: "4px 12px",
						fontSize: "16px",
						cursor: "pointer",
						border: "1px solid #ccc",
						borderRadius: "4px",
						background: "#f9f9f9",
					}}
				>
					+
				</button>
			</div>
		</div>
	);
}
