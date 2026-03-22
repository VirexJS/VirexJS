# Getting Started

## Prerequisites

- [Bun](https://bun.sh) 1.2 or later

## Create a Project

### Interactive Wizard (recommended)

```bash
bunx virexjs create my-app
```

Choose from 4 templates (minimal, blog, dashboard, api) and optional features (auth, db, i18n).

### Quick Scaffold

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
    pages/              # File-based routes
      _layout.tsx       # Root layout (wraps all pages)
      _loading.tsx      # Loading shell (async streaming)
      _error.tsx        # Error boundary
      _404.tsx          # Custom 404
      _middleware.ts    # Per-route middleware
      index.tsx         # → /
      about.tsx         # → /about
      blog/
        index.tsx       # → /blog
        [slug].tsx      # → /blog/:slug
    islands/            # Interactive client components
    components/         # Server-only components
    layouts/            # Page layouts
    api/                # API routes
    middleware/         # Auto-loaded global middleware
  public/               # Static files (served at /)
  virex.config.ts       # Framework configuration
  tsconfig.json         # TypeScript (with @/ alias)
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

## Your First Island

```tsx
// src/islands/Counter.tsx
"use island";
import { useIslandState } from "virexjs";

export default function Counter(props: { initial?: number }) {
  const { get, set } = useIslandState(props, { count: props.initial ?? 0 });

  return (
    <button onClick={() => set("count", get("count") + 1)}>
      Count: {get("count")}
    </button>
  );
}
```

Use it in any page — only this component ships JS:

```tsx
import Counter from "../islands/Counter";

export default function Home() {
  return <Counter initial={0} />;
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

## TypeScript Path Aliases

VirexJS projects include `@/` path aliases out of the box:

```tsx
// Instead of ../../components/Header
import Header from "@/components/Header";
import { formatDate } from "@/utils/date";
```

## Tailwind CSS

```bash
bun add -d tailwindcss
```

```ts
// virex.config.ts
export default defineConfig({
  css: { engine: "tailwind" },
});
```

VirexJS auto-detects Tailwind and generates the config.

## CLI Commands

| Command | Description |
|---------|-------------|
| `virex create` | Interactive project wizard |
| `virex init <name>` | Quick scaffold |
| `virex dev` | Dev server with HMR |
| `virex build` | Production SSG build |
| `virex preview` | Preview production build |
| `virex generate <type> <name>` | Scaffold page, component, api, middleware, island |
| `virex check` | Validate project structure and TypeScript |
| `virex info` | Show project statistics |

## Next Steps

- [Routing](./routing.md) — pages, params, SSG, API routes, parallel loaders
- [Islands](./islands.md) — interactive components, shared store, event bus
- [Components](./components.md) — Link, Image, Head, Preload, ErrorBoundary
- [Middleware & Auth](./middleware.md) — CORS, JWT, compression, ETag
- [Database](./database.md) — SQLite ORM, migrations
- [Configuration](./configuration.md) — config, .env, plugins
- [API Reference](./api-reference.md) — 75+ exports
