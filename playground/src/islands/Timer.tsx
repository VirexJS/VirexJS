// "use island"

/**
 * Timer island — stopwatch with start/stop/reset.
 * Shows how islands handle intervals and time-based state.
 */

interface TimerProps {
	elapsed?: number;
	running?: boolean;
	_state?: Record<string, unknown>;
	_rerender?: () => void;
}

export default function Timer(props: TimerProps) {
	const elapsed = (props.elapsed as number) ?? 0;
	const running = (props.running as boolean) ?? false;

	const mins = Math.floor(elapsed / 60);
	const secs = elapsed % 60;
	const display = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

	const btnStyle = {
		padding: "8px 16px",
		border: "1px solid #ddd",
		borderRadius: "6px",
		cursor: "pointer",
		fontSize: "14px",
		fontWeight: "500" as const,
	};

	return (
		<div
			style={{
				border: "1px solid #ddd",
				borderRadius: "8px",
				padding: "20px",
				display: "inline-block",
				textAlign: "center" as const,
				minWidth: "220px",
			}}
		>
			<p style={{ margin: "0 0 4px", fontSize: "13px", color: "#999" }}>Stopwatch</p>
			<div
				style={{
					fontSize: "48px",
					fontWeight: "bold",
					fontFamily: "monospace",
					margin: "8px 0 16px",
					color: running ? "#0066cc" : "#333",
				}}
			>
				{display}
			</div>
			<div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
				<button
					type="button"
					onClick={() => {
						if (props._state && props._rerender) {
							if (running) {
								props._state.running = false;
								props._rerender();
							} else {
								props._state.running = true;
								props._rerender();
								// Start ticking
								const tick = () => {
									if (props._state!.running) {
										props._state!.elapsed = ((props._state!.elapsed as number) ?? 0) + 1;
										props._rerender!();
										setTimeout(tick, 1000);
									}
								};
								setTimeout(tick, 1000);
							}
						}
					}}
					style={{
						...btnStyle,
						background: running ? "#fee2e2" : "#dcfce7",
						color: running ? "#dc2626" : "#16a34a",
					}}
				>
					{running ? "Stop" : "Start"}
				</button>
				<button
					type="button"
					onClick={() => {
						if (props._state && props._rerender) {
							props._state.elapsed = 0;
							props._state.running = false;
							props._rerender();
						}
					}}
					style={{ ...btnStyle, background: "#f5f5f5" }}
				>
					Reset
				</button>
			</div>
		</div>
	);
}
