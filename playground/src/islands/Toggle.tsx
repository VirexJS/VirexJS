// "use island"

/**
 * Toggle island — shows/hides content on click.
 * Server-side: renders with content visible.
 * Client-side: hydrates with interactive toggle.
 */

interface ToggleProps {
	label?: string;
	open?: boolean;
	_state?: Record<string, unknown>;
	_rerender?: () => void;
}

export default function Toggle(props: ToggleProps) {
	const isOpen = props.open ?? true;
	const label = props.label ?? "Toggle";

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
				onClick={() => {
					if (props._state && props._rerender) {
						props._state.open = !isOpen;
						props._rerender();
					}
				}}
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
				{isOpen ? "▼" : "▶"} {label}
			</button>
			{isOpen && (
				<div style={{ padding: "12px 16px", fontSize: "14px", color: "#666" }}>
					This content is toggled by the island hydration. Server-rendered as visible, then
					interactive on the client.
				</div>
			)}
		</div>
	);
}
