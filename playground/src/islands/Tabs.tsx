// "use island"
import { useIslandState } from "virexjs";

const DEFAULT_TABS = [
	{
		label: "HTML",
		content: "VirexJS renders pure HTML on the server. Zero JS shipped by default.",
	},
	{
		label: "Islands",
		content: "Only interactive components ship JavaScript. Each island is independently hydrated.",
	},
	{
		label: "Bun",
		content: "Built on Bun runtime — the fastest JavaScript runtime. No Node.js required.",
	},
];

export default function Tabs(props: { tabs?: typeof DEFAULT_TABS; activeIndex?: number }) {
	const { get, set } = useIslandState(props, { activeIndex: 0 });
	const tabs = props.tabs ?? DEFAULT_TABS;
	const idx = get("activeIndex");
	const activeTab = tabs[idx] ?? tabs[0]!;

	return (
		<div style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
			<div style={{ display: "flex", borderBottom: "1px solid #ddd" }}>
				{tabs.map((tab, i) => (
					<button
						type="button"
						onClick={() => set("activeIndex", i)}
						style={{
							flex: 1,
							padding: "10px 16px",
							border: "none",
							borderBottom: i === idx ? "2px solid #0066cc" : "2px solid transparent",
							background: i === idx ? "#f0f7ff" : "#fafafa",
							color: i === idx ? "#0066cc" : "#666",
							cursor: "pointer",
							fontSize: "14px",
							fontWeight: i === idx ? "600" : "400",
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
