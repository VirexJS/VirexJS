// "use island"

/**
 * Interactive counter island component.
 * In Phase 1, this renders as static HTML server-side.
 * Phase 2 will add client-side hydration.
 */
export default function Counter(props: { initial?: number }) {
	const count = props.initial ?? 0;

	return (
		<div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "16px", display: "inline-block" }}>
			<p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#666" }}>Island Component</p>
			<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
				<button disabled style={{ padding: "4px 12px", cursor: "not-allowed" }}>-</button>
				<span style={{ fontSize: "24px", fontWeight: "bold" }}>{count}</span>
				<button disabled style={{ padding: "4px 12px", cursor: "not-allowed" }}>+</button>
			</div>
			<p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#999" }}>
				(Interactive in Phase 2)
			</p>
		</div>
	);
}
