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
| `_404.tsx` | Custom 404 page |
| `_error.tsx` | Custom error page |

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
