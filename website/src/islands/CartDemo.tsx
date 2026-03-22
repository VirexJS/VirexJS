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
				padding: "4px 12px",
				background: items.length > 0 ? "#dcfce7" : "#f1f5f9",
				color: items.length > 0 ? "#16a34a" : "#94a3b8",
				borderRadius: "16px",
				fontSize: "13px",
				fontWeight: "600",
			}}>
				{items.length} item{items.length !== 1 ? "s" : ""}
			</span>
		);
	}

	if (role === "list") {
		return (
			<div style={{
				padding: "12px 16px",
				background: "#f8fafc",
				borderRadius: "8px",
				border: "1px solid #e2e8f0",
				minHeight: "60px",
				fontSize: "13px",
			}}>
				{items.length === 0
					? <span style={{ color: "#94a3b8" }}>Cart empty — click buttons above</span>
					: items.map((item, i) => (
						<div key={i} style={{ padding: "4px 0", borderBottom: "1px solid #f1f5f9" }}>
							{item}
						</div>
					))
				}
			</div>
		);
	}

	// Default: add button
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
						background: "#2563eb",
						color: "#fff",
						border: "none",
						borderRadius: "6px",
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
