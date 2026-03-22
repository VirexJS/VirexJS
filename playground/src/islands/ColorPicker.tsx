// "use island"
import { useIslandState } from "virexjs";

const COLORS = [
	{ name: "Red", value: "#ef4444" },
	{ name: "Blue", value: "#3b82f6" },
	{ name: "Green", value: "#22c55e" },
	{ name: "Purple", value: "#a855f7" },
	{ name: "Orange", value: "#f97316" },
	{ name: "Pink", value: "#ec4899" },
];

export default function ColorPicker(props: { color?: string }) {
	const { get, set } = useIslandState(props, { color: "#3b82f6" });
	const selected = get("color");

	return (
		<div
			style={{
				border: "1px solid #ddd",
				borderRadius: "8px",
				padding: "16px",
				display: "inline-block",
			}}
		>
			<p style={{ margin: "0 0 12px", fontSize: "14px", color: "#666" }}>Pick a color:</p>
			<div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
				{COLORS.map((c) => (
					<button
						type="button"
						onClick={() => set("color", c.value)}
						title={c.name}
						style={{
							width: "32px",
							height: "32px",
							borderRadius: "50%",
							background: c.value,
							border: selected === c.value ? "3px solid #111" : "2px solid #ddd",
							cursor: "pointer",
							padding: 0,
						}}
					/>
				))}
			</div>
			<div
				style={{
					padding: "12px 16px",
					borderRadius: "6px",
					background: selected,
					color: "#fff",
					fontSize: "14px",
					fontWeight: "500",
					textAlign: "center",
				}}
			>
				Selected: {selected}
			</div>
		</div>
	);
}
