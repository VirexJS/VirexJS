// "use island"

/**
 * Interactive counter island component.
 *
 * Server-side: renders static HTML with initial count (onClick stripped).
 * Client-side: mount() injects _state and _rerender into props.
 *   onClick handlers mutate state.count and call _rerender() to update DOM.
 */

interface CounterProps {
	initial?: number;
	count?: number;
	_state?: Record<string, unknown>;
	_rerender?: () => void;
}

export default function Counter(props: CounterProps) {
	const count = props.count ?? props.initial ?? 0;
	// Bootstrap state on first hydration call
	if (props._state && props._state.count === undefined) {
		props._state.count = count;
	}

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
					onClick={() => {
						if (props._state && props._rerender) {
							props._state.count = count - 1;
							props._rerender();
						}
					}}
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
					onClick={() => {
						if (props._state && props._rerender) {
							props._state.count = count + 1;
							props._rerender();
						}
					}}
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
