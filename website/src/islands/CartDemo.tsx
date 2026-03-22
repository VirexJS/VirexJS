"use island";
import { useSharedStore } from "virexjs";

export default function CartDemo(props: { role?: string }) {
	const store = useSharedStore(props);
	store.subscribe("demo.cart");

	const items = (store.get("demo.cart") ?? []) as string[];
	const role = props.role ?? "button";

	if (role === "badge") {
		return (
			<span style={{
				display: "inline-flex",
				alignItems: "center",
				gap: "4px",
				padding: "6px 14px",
				background: items.length > 0 ? "rgba(34,197,94,0.15)" : "rgba(161,161,170,0.1)",
				color: items.length > 0 ? "#4ade80" : "#71717a",
				borderRadius: "16px",
				fontSize: "13px",
				fontWeight: "600",
				border: items.length > 0 ? "1px solid rgba(34,197,94,0.2)" : "1px solid #27272a",
			}}>
				{items.length} item{items.length !== 1 ? "s" : ""}
			</span>
		);
	}

	if (role === "list") {
		return (
			<div style={{
				padding: "12px 16px",
				background: "#111113",
				borderRadius: "8px",
				border: "1px solid #27272a",
				minHeight: "60px",
				fontSize: "13px",
				color: "#e4e4e7",
			}}>
				{items.length === 0
					? <span style={{ color: "#52525b" }}>Cart empty — click buttons above</span>
					: items.map((item, i) => (
						<div style={{ padding: "6px 0", borderBottom: "1px solid #1e1e23", display: "flex", justifyContent: "space-between" }}>
							<span>{item}</span>
							<span style={{ color: "#4ade80" }}>Added</span>
						</div>
					))
				}
			</div>
		);
	}

	const products = ["Widget ($29)", "Gadget ($49)", "Doohickey ($15)"];
	return (
		<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
			{products.map((p) => (
				<button
					type="button"
					onClick={() => {
						const current = (store.get("demo.cart") ?? []) as string[];
						store.set("demo.cart", [...current, p]);
					}}
					style={{
						padding: "8px 16px",
						background: "#3b82f6",
						color: "#fff",
						border: "none",
						borderRadius: "8px",
						cursor: "pointer",
						fontSize: "13px",
						fontWeight: "600",
					}}
				>
					+ {p}
				</button>
			))}
		</div>
	);
}
