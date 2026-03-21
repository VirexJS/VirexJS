// "use island"

/**
 * Tabs island — switch between content panels.
 * Shows how islands handle dynamic content switching.
 */

interface TabsProps {
	tabs?: { label: string; content: string }[];
	activeIndex?: number;
	_state?: Record<string, unknown>;
	_rerender?: () => void;
}

export default function Tabs(props: TabsProps) {
	const tabs = props.tabs ?? [
		{
			label: "HTML",
			content: "VirexJS renders pure HTML on the server. Zero JS shipped by default.",
		},
		{
			label: "Islands",
			content:
				"Only interactive components ship JavaScript. Each island is independently hydrated.",
		},
		{
			label: "Bun",
			content: "Built on Bun runtime — the fastest JavaScript runtime. No Node.js required.",
		},
	];
	const activeIndex = props.activeIndex ?? 0;
	const activeTab = tabs[activeIndex] ?? tabs[0]!;

	return (
		<div style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
			<div style={{ display: "flex", borderBottom: "1px solid #ddd" }}>
				{tabs.map((tab, i) => (
					<button
						type="button"
						onClick={() => {
							if (props._state && props._rerender) {
								props._state.activeIndex = i;
								props._rerender();
							}
						}}
						style={{
							flex: 1,
							padding: "10px 16px",
							border: "none",
							borderBottom: i === activeIndex ? "2px solid #0066cc" : "2px solid transparent",
							background: i === activeIndex ? "#f0f7ff" : "#fafafa",
							color: i === activeIndex ? "#0066cc" : "#666",
							cursor: "pointer",
							fontSize: "14px",
							fontWeight: i === activeIndex ? "600" : "400",
						}}
					>
						{tab.label}
					</button>
				))}
			</div>
			<div style={{ padding: "16px", fontSize: "14px", color: "#444", lineHeight: "1.6" }}>
				{activeTab.content}
			</div>
		</div>
	);
}
