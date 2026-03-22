# Directives

VirexJS supports Next.js-compatible directives for controlling where code runs.

## "use client" / "use island"

Marks a component as a client-side island. The component ships JavaScript and hydrates interactively in the browser.

```tsx
"use island";  // or "use client" — both work
import { useIslandState } from "virexjs";

export default function Counter(props) {
  const { get, set } = useIslandState(props, { count: 0 });
  return (
    <button onClick={() => set("count", get("count") + 1)}>
      {get("count")}
    </button>
  );
}
```

### Cross-island communication

Islands can share state via `useSharedStore()`:

```tsx
"use island";
import { useSharedStore } from "virexjs";

export default function CartButton(props) {
  const store = useSharedStore(props);
  store.subscribe("cart.count");
  return (
    <button onClick={() =>
      store.set("cart.count", (store.get("cart.count") ?? 0) + 1)
    }>
      Add to Cart ({store.get("cart.count") ?? 0})
    </button>
  );
}
```

See [Islands Guide](./islands.md) for full details.

## "use server"

Marks a function as server-only. Can be called from client via the action API.

```ts
import { serverAction } from "virexjs";

const saveUser = serverAction(async (data: { name: string }) => {
  "use server";
  return await db.insert(data);
});

// Register for RPC calls
import { registerAction } from "virexjs";
registerAction("saveUser", saveUser);
```

## "use cache"

Enables ISR (Incremental Static Regeneration) for a page. Cached responses are served instantly while revalidating in the background.

```tsx
"use cache";

export const revalidate = 60;  // seconds

export async function loader() {
  return await fetchExpensiveData();
}

export default function Page(props) {
  return <div>{props.data.title}</div>;
}
```

### How ISR works

1. **First visit** — page renders fresh (`X-VirexJS-Cache: MISS`)
2. **Within TTL** — cached HTML served instantly (`HIT`)
3. **After TTL** — stale HTML served, background re-render triggered (`STALE`)
4. **After revalidation** — fresh cached content on next visit (`HIT`)

### Cache invalidation

```ts
import { invalidateISR } from "virexjs";

invalidateISR("/blog/post-1");       // specific path
invalidateISR(/^\/blog\//);          // pattern — all blog pages
```

### Programmatic caching

```ts
import { withCache } from "virexjs";

const data = await withCache("/api/stats", 300, async () => {
  return await computeExpensiveStats();
});
```

## Comparison with Next.js

| Directive | Next.js | VirexJS |
|-----------|---------|---------|
| `"use client"` | Ships React runtime (~85KB) | Ships only island JS (0 base) |
| `"use server"` | Server Actions | `serverAction()` + action registry |
| `"use cache"` | `unstable_cache` | Full ISR with SWR pattern |
| `revalidate` | ISR export | Same — `export const revalidate = 60` |
| Cross-island | React Context (requires React) | `useSharedStore()` (zero JS overhead) |
