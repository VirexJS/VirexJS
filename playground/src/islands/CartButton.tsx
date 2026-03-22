"use island";
import { useSharedStore } from "virexjs";

/**
 * CartButton — adds items to a shared cart.
 * Demonstrates cross-island communication via useSharedStore.
 */
export default function CartButton(props: { item?: string; price?: number }) {
	const item = props.item ?? "Widget";
	const price = props.price ?? 29;
	const store = useSharedStore(props);
	store.subscribe("cart.items");

	const items = (store.get("cart.items") ?? []) as Array<{ name: string; price: number }>;

	return (
		<button
			type="button"
			onClick={() => {
				// Read CURRENT items from store at click time
				const current = (store.get("cart.items") ?? []) as Array<{ name: string; price: number }>;
				store.set("cart.items", [...current, { name: item, price }]);
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
