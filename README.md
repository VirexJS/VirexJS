# VirexJS

**Ship HTML, not JavaScript.**

A next-generation web framework built on [Bun](https://bun.sh) runtime. Zero client-side JavaScript by default, islands architecture for selective hydration, and file-based routing.

## Features

- **Zero JS by default** — Pages are pure server-rendered HTML
- **Islands architecture** — Only interactive components ship JavaScript
- **File-based routing** — Dynamic params `[slug]`, catch-all `[...rest]`, route groups `(auth)`
- **Streaming HTML** — Fast TTFB with streamed `<head>` before body renders
- **Server-side JSX** — Custom JSX runtime with XSS-safe `renderToString`
- **HMR** — WebSocket-based hot module replacement in dev mode
- **Built-in SQLite** — `defineTable()` for typed CRUD with `bun:sqlite`
- **Middleware** — Composable request pipeline with short-circuit support
- **Zero dependencies** — Everything built on Bun's native APIs

## Quick Start

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build

# Run tests
bun test
```

## Project Structure

```
packages/
  virexjs/          # Main package: CLI, server, JSX renderer, config
  router/           # @virexjs/router: file-based routing engine
  bundler/          # @virexjs/bundler: HMR, dev mode, production builds
  db/               # @virexjs/db: bun:sqlite typed query builder
playground/         # Demo app exercising all features
```

## Creating Pages

```tsx
// src/pages/blog/[slug].tsx
import type { PageProps, LoaderContext, MetaData } from "virexjs";

export async function loader(ctx: LoaderContext) {
  return { title: "Hello", content: "World" };
}

export function meta(ctx: { data: { title: string } }): MetaData {
  return { title: ctx.data.title };
}

export default function BlogPost(props: PageProps<{ title: string; content: string }>) {
  return (
    <article>
      <h1>{props.data.title}</h1>
      <p>{props.data.content}</p>
    </article>
  );
}
```

## API Routes

```ts
// src/api/hello.ts
export function GET() {
  return Response.json({ message: "Hello!" });
}

export function POST({ request }: { request: Request }) {
  return Response.json({ received: true }, { status: 201 });
}
```

## Islands

Components in `src/islands/` or with `// "use island"` directive are detected as islands and wrapped with hydration markers:

```tsx
// src/islands/Counter.tsx
export default function Counter(props: { initial: number }) {
  return <span>{props.initial}</span>;
}
```

Output HTML:
```html
<!--vrx-island:Counter:{"initial":0}:visible-->
<div data-vrx-island="Counter"><span>0</span></div>
<!--/vrx-island-->
```

## Configuration

```ts
// virex.config.ts
import { defineConfig } from "virexjs";

export default defineConfig({
  port: 3000,
  render: "server",
  build: { minify: true },
  dev: { hmr: true, hmrPort: 3001 },
});
```

## Tech Stack

- **Runtime:** Bun 1.2+
- **Language:** TypeScript 5.x (strict mode)
- **Database:** bun:sqlite
- **Linter:** Biome

## License

MIT — ECOSTACK TECHNOLOGY OÜ
