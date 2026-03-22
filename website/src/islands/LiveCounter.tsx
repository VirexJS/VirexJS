"use island";
import { useIslandState } from "virexjs";

export default function LiveCounter(props: { label?: string }) {
	const { get, set } = useIslandState(props, { count: 0 });
	const count = get("count") as number;

	return (
		<div style={{
			display: "inline-flex",
			alignItems: "center",
			gap: "12px",
			padding: "12px 20px",
			background: "#1e1e23",
			borderRadius: "10px",
			border: "1px solid #27272a",
		}}>
			<span style={{ fontSize: "13px", color: "#a1a1aa", fontWeight: "500" }}>
				{props.label ?? "Counter"}
			</span>
			<button
				type="button"
				onClick={() => set("count", count - 1)}
				style={{
					width: "32px", height: "32px", borderRadius: "6px",
					border: "1px solid #3f3f46", background: "#27272a", color: "#fafafa",
					cursor: "pointer", fontSize: "16px", fontWeight: "600",
				}}
			>-</button>
			<span style={{ fontSize: "20px", fontWeight: "700", minWidth: "32px", textAlign: "center", color: "#fafafa" }}>
				{count}
			</span>
			<button
				type="button"
				onClick={() => set("count", count + 1)}
				style={{
					width: "32px", height: "32px", borderRadius: "6px",
					border: "none", background: "#3b82f6", color: "#fff",
					cursor: "pointer", fontSize: "16px", fontWeight: "600",
				}}
			>+</button>
		</div>
	);
}
