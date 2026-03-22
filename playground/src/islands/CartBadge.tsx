"use island";
import { useSharedStore } from "virexjs";

/**
 * CartBadge — shows the cart item count.
 * Automatically updates when CartButton adds items.
 * This island has NO direct connection to CartButton — they
 * communicate through the shared store.
 */
export default function CartBadge(props: Record<string, unknown>) {
	const store = useSharedStore(props);
	store.subscribe("cart.items");

	const items = (store.get("cart.items") ?? []) as Array<unknown>;
	const count = items.length;

	return (
		<div
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: "6px",
				padding: "8px 16px",
				background: count > 0 ? "#dcfce7" : "#f3f4f6",
				color: count > 0 ? "#16a34a" : "#9ca3af",
				borderRadius: "20px",
				fontSize: "14px",
				fontWeight: "600",
			}}
		>
			<span style={{ fontSize: "16px" }}>{"\uD83D\uDED2"}</span>
			{count} item{count !== 1 ? "s" : ""}
		</div>
	);
}
