# VirexJS

**Ship HTML, not JavaScript.**

A full-stack web framework built on [Bun](https://bun.sh). Zero client-side JS by default, islands architecture for selective hydration, file-based routing, and built-in everything — no external dependencies.

## Quick Start

```bash
bunx virexjs init my-app
cd my-app
bun install
bun run dev
```

## Features

- **Zero JS by default** — Pages are pure server-rendered HTML
- **Islands architecture** — Only interactive components ship JavaScript
- **File-based routing** — `[slug]` params, `[...rest]` catch-all, `(group)` groups
- **Streaming HTML** — Head-first TTFB with `ReadableStream` responses
- **Built-in auth** — JWT (HS256), sessions, route guards
- **Form validation** — Chainable `string().required().email()` validators
- **i18n** — Interpolation, pluralization, locale detection
- **Plugin system** — 6 lifecycle hooks for extensibility
- **Real-time** — WebSocket routes and Server-Sent Events
- **Database** — SQLite ORM with typed CRUD and migrations
- **Security** — CORS, rate limiting, CSP, HSTS, CSRF, body size limiter
- **SEO** — `useHead()`, `<Head>`, JSON-LD structured data
- **DX** — HMR, error overlay, CLI scaffolding, test utilities
- **Zero dependencies** — Everything built on Bun native APIs

## Example

```tsx
// src/pages/blog/[slug].tsx
import type { PageProps, LoaderContext } from "virexjs";
import { useHead, ErrorBoundary } from "virexjs";

export async function loader(ctx: LoaderContext) {
  return await db.findOne({ slug: ctx.params.slug });
}

export default function BlogPost(props: PageProps<Post>) {
  const head = useHead({
    title: props.data.title,
    og: { title: props.data.title, type: "article" },
  });

  return (
    <ErrorBoundary fallback={(err) => <p>Error: {err.message}</p>}>
      {head}
      <article>
        <h1>{props.data.title}</h1>
        <p>{props.data.content}</p>
      </article>
    </ErrorBoundary>
  );
}
```

## Packages

| Package | Description |
|---------|-------------|
| `virexjs` | Core framework — CLI, server, renderer, config, middleware, auth, validation, i18n |
| `@virexjs/router` | File-based routing engine — scanner, trie matcher, params |
| `@virexjs/bundler` | Build pipeline — HMR, SSG, island bundling, CSS engine, HTML minifier |
| `@virexjs/db` | SQLite ORM — `defineTable()`, typed CRUD, migrations |

## CLI

```
virex init <name>              Create a new project
virex dev                      Development server with HMR
virex build                    Production build (SSG)
virex preview                  Preview production build
virex generate <type> <name>   Scaffold page, component, api, middleware, island
```

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](./docs/getting-started.md) | Installation, first page, project structure |
| [Routing](./docs/routing.md) | Pages, dynamic params, SSG, API routes, form actions |
| [Components](./docs/components.md) | Link, Image, Head, Script, Font, ErrorBoundary, JsonLd |
| [Islands](./docs/islands.md) | Interactive components, hydration, state pattern |
| [Middleware & Auth](./docs/middleware.md) | CORS, rate limit, JWT, sessions, route guards |
| [Database](./docs/database.md) | SQLite ORM, defineTable, CRUD, migrations |
| [Directives](./docs/directives.md) | "use client", "use server", "use cache", ISR |
| [Testing](./docs/testing.md) | renderComponent, createTestRequest, assertHTML |
| [Configuration](./docs/configuration.md) | Config, .env files, plugins, defineEnv |
| [Deployment](./docs/deployment.md) | Docker, Fly.io, Railway, VPS |
| [API Reference](./docs/api-reference.md) | Complete export list with types |

## Development

```bash
bun install              # Install workspace dependencies
bun test                 # Run all 864 tests
bun run dev              # Start playground (port 3000)
bun run build            # Build playground for production
bunx tsc --noEmit        # TypeScript check (strict, 0 errors)
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Bun 1.2+ |
| Language | TypeScript 5.x (strict) |
| Server | Bun.serve() |
| Database | bun:sqlite |
| Tests | bun:test (864 tests, 71 files) |
| Linter | Biome |

## License

MIT — ECOSTACK TECHNOLOGY OÜ
