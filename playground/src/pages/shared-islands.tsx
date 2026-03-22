import { useHead } from "virexjs";
import CartBadge from "../islands/CartBadge";
import CartButton from "../islands/CartButton";
import CartSummary from "../islands/CartSummary";
import Counter from "../islands/Counter";
import Default from "../layouts/Default";

export function meta() {
	return {
		title: "Shared Islands — VirexJS",
		description: "Cross-island communication with shared store and event bus",
	};
}

export default function SharedIslands() {
	const head = useHead({
		title: "Shared Islands — VirexJS",
		description: "Cross-island communication demo",
	});

	return (
		<Default>
			{head}
			<h1 style={{ margin: "0 0 4px" }}>Cross-Island Communication</h1>
			<p style={{ color: "#6b7280", margin: "0 0 24px", fontSize: "14px" }}>
				Islands are independent by default. With{" "}
				<code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px" }}>
					useSharedStore()
				</code>
				, they can share state and react to each other's changes.
			</p>

			{/* Shared Cart Demo */}
			<section
				style={{
					background: "#f9fafb",
					borderRadius: "12px",
					border: "1px solid #e5e7eb",
					padding: "24px",
					marginBottom: "24px",
				}}
			>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
					<div>
						<h2 style={{ margin: "0 0 4px", fontSize: "18px" }}>Shared Cart</h2>
						<p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
							3 independent islands sharing "cart.items" state
						</p>
					</div>
					<CartBadge />
				</div>

				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
					<div>
						<h3 style={{ margin: "0 0 12px", fontSize: "14px", color: "#374151" }}>Add Items</h3>
						<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
							<CartButton item="Widget" price={29} />
							<CartButton item="Gadget" price={49} />
							<CartButton item="Doohickey" price={15} />
						</div>
					</div>
					<CartSummary />
				</div>
			</section>

			{/* How it works */}
			<section
				style={{
					background: "#eff6ff",
					borderRadius: "12px",
					border: "1px solid #bfdbfe",
					padding: "24px",
					marginBottom: "24px",
				}}
			>
				<h3 style={{ margin: "0 0 12px", fontSize: "16px", color: "#1e40af" }}>How it works</h3>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
					<div style={{ background: "#fff", padding: "12px", borderRadius: "8px" }}>
						<strong style={{ fontSize: "13px" }}>CartButton</strong>
						<p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0 0" }}>
							Calls <code>store.set("cart.items", [...])</code>
						</p>
					</div>
					<div style={{ background: "#fff", padding: "12px", borderRadius: "8px" }}>
						<strong style={{ fontSize: "13px" }}>CartBadge</strong>
						<p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0 0" }}>
							Subscribes to "cart.items", shows count
						</p>
					</div>
					<div style={{ background: "#fff", padding: "12px", borderRadius: "8px" }}>
						<strong style={{ fontSize: "13px" }}>CartSummary</strong>
						<p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0 0" }}>
							Subscribes to "cart.items", shows list + total
						</p>
					</div>
				</div>
			</section>

			{/* Code Example */}
			<section style={{ marginBottom: "24px" }}>
				<h3 style={{ margin: "0 0 12px", fontSize: "16px" }}>Code</h3>
				<pre
					style={{
						background: "#1e1e1e",
						color: "#d4d4d4",
						padding: "16px",
						borderRadius: "8px",
						fontSize: "12px",
						overflow: "auto",
						lineHeight: "1.6",
					}}
				>
					{`// CartButton.tsx — PRODUCER
"use island";
import { useSharedStore } from "virexjs";

export default function CartButton(props) {
  const store = useSharedStore(props);
  store.subscribe("cart.items");
  const items = store.get("cart.items") ?? [];

  return (
    <button onClick={() => store.set("cart.items",
      [...items, { name: "Widget", price: 29 }]
    )}>
      Add to Cart
    </button>
  );
}

// CartBadge.tsx — CONSUMER (separate island!)
"use island";
import { useSharedStore } from "virexjs";

export default function CartBadge(props) {
  const store = useSharedStore(props);
  store.subscribe("cart.items"); // re-renders when cart changes
  const count = (store.get("cart.items") ?? []).length;

  return <span>Cart: {count}</span>;
}`}
				</pre>
			</section>

			{/* Independent vs Shared */}
			<section>
				<h3 style={{ margin: "0 0 12px", fontSize: "16px" }}>Independent vs Shared</h3>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
					<div
						style={{
							padding: "16px",
							border: "1px solid #e5e7eb",
							borderRadius: "8px",
						}}
					>
						<h4 style={{ margin: "0 0 8px", fontSize: "14px" }}>Independent (useIslandState)</h4>
						<p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 12px" }}>
							Each Counter has its own state — clicking one doesn't affect the other.
						</p>
						<div style={{ display: "flex", gap: "12px" }}>
							<Counter initial={0} />
							<Counter initial={100} />
						</div>
					</div>
					<div
						style={{
							padding: "16px",
							border: "1px solid #2563eb",
							borderRadius: "8px",
							background: "#eff6ff",
						}}
					>
						<h4 style={{ margin: "0 0 8px", fontSize: "14px", color: "#1e40af" }}>
							Shared (useSharedStore)
						</h4>
						<p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 12px" }}>
							CartButton and CartBadge share state — click button, badge updates.
						</p>
						<div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
							<CartButton item="Test" price={10} />
							<CartBadge />
						</div>
					</div>
				</div>
			</section>
		</Default>
	);
}
