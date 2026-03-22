"use island";
import { useSharedStore } from "virexjs";

/**
 * CartSummary — shows cart contents and total.
 * Third island connected to the same shared store.
 * All three cart islands (Button, Badge, Summary) stay in sync.
 */
export default function CartSummary(props: Record<string, unknown>) {
	const store = useSharedStore(props);
	store.subscribe("cart.items");

	const items = (store.get("cart.items") ?? []) as Array<{ name: string; price: number }>;
	const total = items.reduce((sum, item) => sum + item.price, 0);

	return (
		<div
			style={{
				border: "1px solid #e5e7eb",
				borderRadius: "8px",
				padding: "16px",
				minHeight: "80px",
			}}
		>
			<h4 style={{ margin: "0 0 8px", fontSize: "14px", color: "#374151" }}>Cart Summary</h4>
			{items.length === 0 ? (
				<p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>Cart is empty</p>
			) : (
				<div>
					{items.map((item, i) => (
						<div
							key={i}
							style={{
								display: "flex",
								justifyContent: "space-between",
								fontSize: "13px",
								padding: "4px 0",
								borderBottom: "1px solid #f3f4f6",
							}}
						>
							<span>{item.name}</span>
							<span style={{ color: "#6b7280" }}>${item.price}</span>
						</div>
					))}
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							fontSize: "14px",
							fontWeight: "700",
							paddingTop: "8px",
							marginTop: "4px",
						}}
					>
						<span>Total</span>
						<span style={{ color: "#16a34a" }}>${total}</span>
					</div>
				</div>
			)}
		</div>
	);
}
