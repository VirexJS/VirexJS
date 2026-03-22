// "use island"
import { useIslandState } from "virexjs";

export default function Toggle(props: { label?: string; open?: boolean }) {
	const { get, set } = useIslandState(props, { open: props.open ?? true });
	const isOpen = get("open");

	return (
		<div
			style={{
				border: "1px solid #ddd",
				borderRadius: "8px",
				overflow: "hidden",
				display: "inline-block",
				minWidth: "200px",
			}}
		>
			<button
				type="button"
				onClick={() => set("open", !isOpen)}
				style={{
					display: "block",
					width: "100%",
					padding: "10px 16px",
					background: "#f8f9fa",
					border: "none",
					borderBottom: isOpen ? "1px solid #ddd" : "none",
					cursor: "pointer",
					fontSize: "14px",
					fontWeight: "500",
					textAlign: "left",
					color: "#333",
				}}
			>
				{isOpen ? "\u25BC" : "\u25B6"} {props.label ?? "Toggle"}
			</button>
			{isOpen && (
				<div style={{ padding: "12px 16px", fontSize: "14px", color: "#666" }}>
					This content is toggled by the island hydration.
				</div>
			)}
		</div>
	);
}
