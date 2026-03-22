"use island";
import { useIslandState, useSharedStore } from "virexjs";

/**
 * CartButton — adds items to a shared cart.
 * Demonstrates cross-island communication via useSharedStore.
 * When this button is clicked, CartBadge and CartSummary update automatically.
 */
export default function CartButton(props: { item?: string; price?: number }) {
	const { get } = useIslandState(props, { item: "Widget", price: 29 });
	const store = useSharedStore(props);
	store.subscribe("cart.items");

	const items = (store.get("cart.items") ?? []) as Array<{ name: string; price: number }>;
	const item = get("item") as string;
	const price = get("price") as number;

	return (
		<button
			type="button"
			onClick={() => {
				store.set("cart.items", [...items, { name: item, price }]);
			}}
			style={{
				padding: "10px 20px",
				background: "#2563eb",
				color: "#fff",
				border: "none",
				borderRadius: "8px",
				cursor: "pointer",
				fontSize: "14px",
				fontWeight: "600",
			}}
		>
			Add {item} (${price}) to Cart
		</button>
	);
}
