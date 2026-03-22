// "use island"

import { useIslandState } from "virexjs";

/**
 * Counter island — uses useIslandState() for clean state management.
 * No more manual _state/_rerender boilerplate.
 */
export default function Counter(props: { initial?: number }) {
	const { get, set } = useIslandState(props, { count: props.initial ?? 0 });
	const count = get("count");

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
					onClick={() => set("count", count - 1)}
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
					style={{
						fontSize: "24px",
						fontWeight: "bold",
						minWidth: "40px",
						textAlign: "center",
					}}
				>
					{count}
				</span>
				<button
					type="button"
					onClick={() => set("count", count + 1)}
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
