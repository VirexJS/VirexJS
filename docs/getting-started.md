# Getting Started

## Prerequisites

- [Bun](https://bun.sh) 1.2 or later

## Create a Project

```bash
bunx virexjs init my-app
cd my-app
bun install
bun run dev
```

Open http://localhost:3000 — your app is running.

## Project Structure

```
my-app/
  src/
    pages/          # File-based routes
      index.tsx     # → /
      about.tsx     # → /about
      blog/
        index.tsx   # → /blog
        [slug].tsx  # → /blog/:slug
    components/     # Server-only components
    islands/        # Interactive client components
    layouts/        # Page layouts
    api/            # API routes
    middleware/     # Request middleware
  public/           # Static files (served at /)
  virex.config.ts   # Framework configuration
  tsconfig.json
```

## Your First Page

```tsx
// src/pages/index.tsx
import type { PageProps } from "virexjs";
import { useHead } from "virexjs";

export async function loader() {
  return { message: "Hello from VirexJS!" };
}

export default function Home(props: PageProps<{ message: string }>) {
  const head = useHead({ title: "Home" });
  return (
    <div>
      {head}
      <h1>{props.data.message}</h1>
    </div>
  );
}
```

## Adding an API Route

```ts
// src/api/hello.ts
import { defineAPIRoute, json } from "virexjs";

export const GET = defineAPIRoute(() => {
  return json({ message: "Hello!" });
});
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `virex dev` | Start dev server with HMR |
| `virex build` | Production build |
| `virex preview` | Preview production build |
| `virex init <name>` | Scaffold new project |
| `virex generate <type> <name>` | Generate page, component, api, middleware, island |

## Next Steps

- [Routing Guide](./routing.md)
- [API Reference](./api-reference.md)
- [Middleware & Auth](./middleware.md)
- [Configuration](./configuration.md)
