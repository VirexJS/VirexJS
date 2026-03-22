// "use island"
import { useIslandState } from "virexjs";

const FAQ = [
	{
		title: "What is an island?",
		content:
			"An island is a component that ships JavaScript to the client for interactivity. The rest of the page stays as pure HTML.",
	},
	{
		title: "How does hydration work?",
		content:
			"The server renders the island as static HTML with marker comments. The client-side runtime finds these markers, loads the island JS, and mounts interactive behavior.",
	},
	{
		title: "What hydration strategies are available?",
		content:
			'VirexJS supports 4 strategies: "visible" (IntersectionObserver), "interaction" (click/hover), "idle" (requestIdleCallback), and "immediate".',
	},
	{
		title: "Can I have multiple islands on one page?",
		content:
			"Yes! Each island is independently bundled and hydrated. This page itself has multiple islands running simultaneously.",
	},
];

export default function Accordion(props: { items?: typeof FAQ; openIndex?: number }) {
	const { get, set } = useIslandState(props, { openIndex: -1 });
	const items = props.items ?? FAQ;
	const openIdx = get("openIndex");

	return (
		<div style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
			{items.map((item, i) => (
				<div style={{ borderBottom: i < items.length - 1 ? "1px solid #eee" : "none" }}>
					<button
						type="button"
						onClick={() => set("openIndex", openIdx === i ? -1 : i)}
						style={{
							display: "flex",
							width: "100%",
							padding: "14px 16px",
							background: openIdx === i ? "#f8f9fa" : "#fff",
							border: "none",
							cursor: "pointer",
							fontSize: "14px",
							fontWeight: "500",
							color: "#333",
							textAlign: "left" as const,
							alignItems: "center",
							justifyContent: "space-between",
						}}
					>
						<span>{item.title}</span>
						<span style={{ color: "#999", fontSize: "18px" }}>
							{openIdx === i ? "\u2212" : "+"}
						</span>
					</button>
					{openIdx === i && (
						<div
							style={{ padding: "0 16px 14px", fontSize: "14px", color: "#666", lineHeight: "1.6" }}
						>
							{item.content}
						</div>
					)}
				</div>
			))}
		</div>
	);
}
