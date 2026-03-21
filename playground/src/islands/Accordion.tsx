// "use island"

/**
 * Accordion island — expandable FAQ-style sections.
 * Shows how islands handle indexed open/close state.
 */

interface AccordionProps {
	items?: { title: string; content: string }[];
	openIndex?: number;
	_state?: Record<string, unknown>;
	_rerender?: () => void;
}

export default function Accordion(props: AccordionProps) {
	const items = props.items ?? [
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
	const openIndex = (props.openIndex as number) ?? -1;

	return (
		<div style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
			{items.map((item, i) => (
				<div style={{ borderBottom: i < items.length - 1 ? "1px solid #eee" : "none" }}>
					<button
						type="button"
						onClick={() => {
							if (props._state && props._rerender) {
								props._state.openIndex = openIndex === i ? -1 : i;
								props._rerender();
							}
						}}
						style={{
							display: "flex",
							width: "100%",
							padding: "14px 16px",
							background: openIndex === i ? "#f8f9fa" : "#fff",
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
						<span style={{ color: "#999", fontSize: "18px" }}>{openIndex === i ? "−" : "+"}</span>
					</button>
					{openIndex === i && (
						<div
							style={{
								padding: "0 16px 14px",
								fontSize: "14px",
								color: "#666",
								lineHeight: "1.6",
							}}
						>
							{item.content}
						</div>
					)}
				</div>
			))}
		</div>
	);
}
