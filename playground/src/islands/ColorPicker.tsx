// "use island"

/**
 * Color picker island — interactive color selection with preview.
 * Shows how islands handle multiple state properties.
 */

interface ColorPickerProps {
	color?: string;
	_state?: Record<string, unknown>;
	_rerender?: () => void;
}

const COLORS = [
	{ name: "Red", value: "#ef4444" },
	{ name: "Blue", value: "#3b82f6" },
	{ name: "Green", value: "#22c55e" },
	{ name: "Purple", value: "#a855f7" },
	{ name: "Orange", value: "#f97316" },
	{ name: "Pink", value: "#ec4899" },
];

export default function ColorPicker(props: ColorPickerProps) {
	const selected = props.color ?? "#3b82f6";

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
						onClick={() => {
							if (props._state && props._rerender) {
								props._state.color = c.value;
								props._rerender();
							}
						}}
						style={{
							width: "32px",
							height: "32px",
							borderRadius: "50%",
							background: c.value,
							border: selected === c.value ? "3px solid #111" : "2px solid #ddd",
							cursor: "pointer",
							padding: 0,
						}}
						title={c.name}
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
