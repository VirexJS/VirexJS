"use island";
import { useIslandState } from "virexjs";

export default function TabSwitcher(props: Record<string, unknown>) {
	const { get, set } = useIslandState(props, { tab: 0 });
	const tab = get("tab") as number;

	const tabs = [
		{ label: "Page", code: `// src/pages/index.tsx
import { useHead } from "virexjs";

export async function loader() {
  return { posts: await db.findMany() };
}

export default function Home(props) {
  const head = useHead({ title: "Home" });
  return (
    <>
      {head}
      <h1>Welcome</h1>
      {props.data.posts.map(p =>
        <a href={\`/blog/\${p.slug}\`}>{p.title}</a>
      )}
    </>
  );
}` },
		{ label: "Island", code: `// src/islands/Counter.tsx
"use island";
import { useIslandState } from "virexjs";

export default function Counter(props) {
  const { get, set } = useIslandState(props, {
    count: 0
  });

  return (
    <button onClick={() =>
      set("count", get("count") + 1)
    }>
      Count: {get("count")}
    </button>
  );
}` },
		{ label: "Shared", code: `// src/islands/CartButton.tsx
"use island";
import { useSharedStore } from "virexjs";

export default function CartButton(props) {
  const store = useSharedStore(props);
  store.subscribe("cart");

  return (
    <button onClick={() =>
      store.set("cart",
        (store.get("cart") ?? 0) + 1
      )
    }>
      Add to Cart ({store.get("cart") ?? 0})
    </button>
  );
}

// CartBadge — SEPARATE island, auto-synced!
// store.subscribe("cart") => re-renders` },
		{ label: "API", code: `// src/api/users.ts
import { json, validate, string } from "virexjs";

export async function GET() {
  const users = await db.select("users").all();
  return json(users);
}

export async function POST({ request }) {
  const body = await request.json();
  const result = validate({
    name: string().required(),
    email: string().email(),
  }, body);

  if (!result.success) return json(result.errors, { status: 400 });
  const user = await db.insert("users", result.data);
  return json(user, { status: 201 });
}` },
	];

	return (
		<div>
			<div style={{ display: "flex", gap: "2px", marginBottom: "0" }}>
				{tabs.map((t, i) => (
					<button
						type="button"
						onClick={() => set("tab", i)}
						style={{
							padding: "8px 18px",
							background: tab === i ? "#0f172a" : "#e2e8f0",
							color: tab === i ? "#e2e8f0" : "#64748b",
							border: "none",
							borderRadius: "8px 8px 0 0",
							cursor: "pointer",
							fontSize: "13px",
							fontWeight: "600",
						}}
					>
						{t.label}
					</button>
				))}
			</div>
			<pre style={{
				background: "#0f172a",
				color: "#e2e8f0",
				padding: "20px",
				borderRadius: "0 8px 8px 8px",
				fontSize: "13px",
				lineHeight: "1.6",
				overflow: "auto",
				margin: "0",
				minHeight: "280px",
			}}>
				<code>{tabs[tab]?.code ?? ""}</code>
			</pre>
		</div>
	);
}
