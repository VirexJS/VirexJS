# Directives

VirexJS supports Next.js-compatible directives for controlling where code runs.

## "use client"

Marks a component as a client-side island. The component ships JavaScript and hydrates interactively in the browser.

```tsx
"use client";

export default function LikeButton() {
  // This component hydrates on the client
  return <button onClick={() => { /* interactive */ }}>Like</button>;
}
```

Equivalent to `"use island"` — both are supported.

## "use server"

Marks a function as server-only. Can be called from client via the action API.

```ts
import { serverAction } from "virexjs";

const saveUser = serverAction(async (data: { name: string }) => {
  "use server";
  return await db.insert(data);
});

// Call directly on the server
await saveUser({ name: "Alice" });
```

## "use cache"

Enables ISR (Incremental Static Regeneration) for a page. Cached responses are served instantly while revalidating in the background.

```tsx
"use cache";

// Revalidate every 60 seconds
export const revalidate = 60;

export async function loader() {
  // This result is cached
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

// Invalidate specific path
invalidateISR("/blog/post-1");

// Invalidate by pattern
invalidateISR(/^\/blog\//);  // all blog pages
```

## Comparison with Next.js

| Directive | Next.js | VirexJS |
|-----------|---------|---------|
| `"use client"` | Ships React runtime (~85KB) | Ships only island JS (0 base) |
| `"use server"` | Server Actions | `serverAction()` + action registry |
| `"use cache"` | `unstable_cache` | Full ISR with SWR pattern |
| `revalidate` | ISR export | Same — `export const revalidate = 60` |
