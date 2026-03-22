# Routing

VirexJS uses file-based routing. Files in `src/pages/` automatically become routes.

## Route Patterns

| File | URL | Description |
|------|-----|-------------|
| `index.tsx` | `/` | Home page |
| `about.tsx` | `/about` | Static route |
| `blog/index.tsx` | `/blog` | Directory index |
| `blog/[slug].tsx` | `/blog/:slug` | Dynamic param |
| `docs/[...rest].tsx` | `/docs/*` | Catch-all |
| `(auth)/login.tsx` | `/login` | Route group (no URL segment) |
| `users/[id]/posts/[postId].tsx` | `/users/:id/posts/:postId` | Nested params |

## Pages

Every page exports a default component. Optionally export `loader` and `meta`:

```tsx
import type { PageProps, LoaderContext } from "virexjs";
import { useHead } from "virexjs";

// Runs on the server before rendering
export async function loader(ctx: LoaderContext) {
  const post = await db.findOne({ slug: ctx.params.slug });
  return { post };
}

// Page component receives loader data
export default function BlogPost(props: PageProps<{ post: Post }>) {
  const head = useHead({
    title: props.data.post.title,
    og: { title: props.data.post.title, type: "article" },
  });

  return (
    <article>
      {head}
      <h1>{props.data.post.title}</h1>
      <p>{props.data.post.content}</p>
    </article>
  );
}
```

## Special Files

| File | Purpose |
|------|---------|
| `_layout.tsx` | Wraps all pages in the same directory |
| `_loading.tsx` | Loading shell for async streaming (v0.2) |
| `_error.tsx` | Custom error page |
| `_404.tsx` | Custom 404 page |
| `_middleware.ts` | Per-route middleware (v0.2) |

## Static Site Generation (SSG)

Dynamic routes can be pre-rendered at build time:

```tsx
// src/pages/blog/[slug].tsx
export function getStaticPaths() {
  return [
    { params: { slug: "hello-world" } },
    { params: { slug: "getting-started" } },
  ];
}
```

Build output:
```
dist/blog/hello-world/index.html
dist/blog/getting-started/index.html
```

Routes without `getStaticPaths` remain server-only.

## API Routes

Files in `src/api/` handle HTTP requests:

```ts
// src/api/users.ts
import { defineAPIRoute, json, notFound } from "virexjs";

export const GET = defineAPIRoute(({ params }) => {
  return json({ users: [] });
});

export const POST = defineAPIRoute(async ({ request }) => {
  const body = await request.json();
  return json({ created: true }, { status: 201 });
});
```

Supported methods: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`

## Form Actions

Handle form submissions with typed server actions:

```tsx
import { defineAction, parseFormData, actionRedirect } from "virexjs";
import { validate, string } from "virexjs";

export const action = defineAction(async ({ request }) => {
  const data = await parseFormData(request);
  const result = validate({
    name: string().required(),
    email: string().required().email(),
  }, data);

  if (!result.success) {
    return { errors: result.errors };
  }

  await saveContact(result.data);
  return actionRedirect("/thank-you");
});
```

## Parallel Data Loading (v0.2)

Dashboard pages often need data from multiple sources. Load them concurrently:

```tsx
import { defineParallelLoader } from "virexjs";
import type { PageProps } from "virexjs";

export const loader = defineParallelLoader({
  user:    (ctx) => db.select("users").where({ id: ctx.params.id }),
  posts:   (ctx) => db.select("posts").where({ authorId: ctx.params.id }),
  stats:   () => fetch("/api/stats").then(r => r.json()),
  notifications: () => getNotifications(),
});

export default function Dashboard(props: PageProps) {
  const { user, posts, stats, notifications } = props.data;
  // All 4 sources loaded in parallel — no sequential waterfall
}
```

For fault-tolerant loading (failed sources return `null`):

```tsx
export const loader = defineParallelLoader({
  user:  (ctx) => db.findOne({ id: ctx.params.id }),
  stats: () => fetch("/api/stats").then(r => r.json()),
}, { settled: true });
```

## Async Streaming (v0.2)

When a page has an async loader and a `_loading.tsx` file exists, VirexJS sends the loading shell instantly while data loads:

```tsx
// src/pages/_loading.tsx
export default function Loading() {
  return <div class="spinner">Loading...</div>;
}

// src/pages/dashboard.tsx
export async function loader(ctx) {
  // This might take 500ms+ — loading shell shows instantly
  const data = await slowDatabaseQuery();
  return data;
}
```

The browser sees the loading UI immediately (fast TTFB), then the real content swaps in when data is ready. No client JavaScript required.
