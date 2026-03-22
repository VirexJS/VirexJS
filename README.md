# VirexJS

**Ship HTML, not JavaScript.**

[![Tests](https://img.shields.io/badge/tests-1025%20passing-brightgreen)](https://github.com/virexjs/virexjs)
[![TypeScript](https://img.shields.io/badge/typescript-strict-blue)](https://github.com/virexjs/virexjs)
[![Dependencies](https://img.shields.io/badge/dependencies-0-orange)](https://github.com/virexjs/virexjs)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A full-stack web framework built on [Bun](https://bun.sh). Zero client-side JS by default, islands architecture, file-based routing, and built-in everything — auth, database, validation, i18n, real-time — with zero external dependencies.

[Website](https://virexjs.com) | [Docs](./docs/getting-started.md) | [API Reference](./docs/api-reference.md) | [Examples](./examples)

---

## Quick Start

```bash
# Interactive wizard — choose template + features
bunx virexjs create my-app

# Or quick scaffold
bunx virexjs init my-app

cd my-app && bun install && bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Why VirexJS?

| | Next.js | VirexJS |
|---|---------|---------|
| **Client JS** | ~85 KB React runtime | **0 KB** by default |
| **Dependencies** | 400+ packages | **0** packages |
| **Runtime** | Node.js | **Bun** (3-5x faster) |
| **Database** | External package | **Built-in** SQLite ORM |
| **Auth** | External package | **Built-in** JWT + sessions |
| **Validation** | External package | **Built-in** chainable schema |
| **i18n** | Config-only | **Built-in** full system |
| **CORS/CSRF** | External package | **Built-in** middleware |
| **WebSocket** | Manual | **Built-in** defineWSRoute |
| **Startup** | ~2s | **~20ms** |

## Features

### Rendering
- **Zero JS by default** — Pages ship pure server-rendered HTML
- **Islands architecture** — Only interactive components ship JavaScript
- **Streaming HTML** — Head-first TTFB with `ReadableStream`
- **Async Streaming** — Suspense-like: loading shell + data swap (v0.2)
- **Nested layouts** — `_layout.tsx` per directory with cascade
- **Loading states** — `_loading.tsx` streaming shell
- **Error boundaries** — `_error.tsx` per route segment

### Routing
- **File-based** — `[slug]` params, `[...rest]` catch-all, `(group)` groups
- **SSG** — `getStaticPaths()` for static pre-rendering
- **ISR** — `"use cache"` + `export const revalidate = 60`
- **API routes** — `GET`, `POST`, `PUT`, `DELETE`, `PATCH` exports
- **Redirects & rewrites** — config-based URL management
- **Parallel loaders** — `defineParallelLoader()` for concurrent data fetching (v0.2)
- **ETag caching** — automatic 304 responses with `withETag()` (v0.2)

### Built-in
- **Auth** — JWT (HS256), cookie sessions, route guards, CSRF
- **Database** — SQLite ORM with typed CRUD and migrations
- **Validation** — `string().required().email()` chainable validators
- **i18n** — Interpolation, pluralization, locale routing
- **Real-time** — WebSocket routes + Server-Sent Events
- **Security** — CORS, rate limiting, CSP, HSTS, body size limiter

### Components
- `<Link>` with native browser prefetch
- `<Image>` with lazy loading + sharp resize/WebP/blur placeholder (v0.2)
- `<Head>` with tag deduplication
- `<Script>` with loading strategies
- `<Font>` with preload + font-display
- `<ErrorBoundary>` with fallback UI
- `<JsonLd>` for structured data
- `<Preload>` / `<Preconnect>` / `<DNSPrefetch>` resource hints (v0.2)
- `useHead()` for programmatic SEO

### DX
- **Directives** — `"use client"`, `"use server"`, `"use cache"`
- **HMR** — WebSocket hot reload with heartbeat, debounce, dev widget (v0.2)
- **CLI** — `create`, `init`, `dev`, `build`, `preview`, `generate`, `info`
- **Test utilities** — `renderComponent`, `assertHTML`
- **Auto API docs** — generated endpoint documentation
- **OG image generator** — dynamic SVG social previews
- **Benchmark suite** — 6.4M ops/sec JSX, 86K pages/sec render

## Example

```tsx
// src/pages/blog/[slug].tsx
import type { PageProps, LoaderContext } from "virexjs";
import { useHead, ErrorBoundary, Link } from "virexjs";

export async function loader(ctx: LoaderContext) {
  const post = await db.findOne({ slug: ctx.params.slug });
  return post;
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
        <Link href="/" prefetch>Back to home</Link>
      </article>
    </ErrorBoundary>
  );
}
```

## Project Structure

```
src/
  pages/           File-based routes
    _layout.tsx     Nested layout (wraps children)
    _loading.tsx    Loading state (streaming shell)
    _error.tsx      Error boundary (per-route)
    _404.tsx        Custom 404
    index.tsx       → /
    blog/
      [slug].tsx    → /blog/:slug
  islands/          Interactive client components
  api/              API routes
  middleware/       Auto-loaded middleware
  components/       Server-only components
  layouts/          Page layouts
```

## Packages

| Package | Description |
|---------|-------------|
| `virexjs` | Core — CLI, server, renderer, auth, validation, i18n, 60+ exports |
| `@virexjs/router` | File-based routing — trie matcher, dynamic params |
| `@virexjs/bundler` | Build pipeline — HMR, SSG, islands, CSS engine |
| `@virexjs/db` | SQLite ORM — typed CRUD, migrations |

## CLI

```
virex create              Interactive wizard (minimal/blog/dashboard/api templates)
virex init <name>         Quick project scaffold
virex dev                 Dev server with HMR + dev widget
virex build               Production SSG build
virex preview             Preview production build
virex generate <type>     Scaffold page, component, api, middleware, island
virex info                Show project stats
```

## Configuration

```ts
// virex.config.ts
import { defineConfig } from "virexjs";

export default defineConfig({
  port: 3000,
  redirects: [
    { source: "/old-page", destination: "/new-page", permanent: true },
  ],
  rewrites: [
    { source: "/api/v1/:path", destination: "/api/:path" },
  ],
  headers: [
    { source: "/(.*)", headers: [{ key: "X-Frame-Options", value: "DENY" }] },
  ],
  plugins: [myPlugin()],
});
```

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](./docs/getting-started.md) | Installation, project structure |
| [Routing](./docs/routing.md) | Pages, params, SSG, API routes, form actions |
| [Components](./docs/components.md) | Link, Image, Head, Script, Font, ErrorBoundary |
| [Islands](./docs/islands.md) | Interactive components, hydration strategies |
| [Middleware & Auth](./docs/middleware.md) | CORS, rate limit, JWT, sessions, guards |
| [Database](./docs/database.md) | SQLite ORM, CRUD, migrations |
| [Directives](./docs/directives.md) | "use client", "use server", "use cache" |
| [Testing](./docs/testing.md) | Test utilities, mock requests |
| [Configuration](./docs/configuration.md) | Config, .env, plugins, defineEnv |
| [Deployment](./docs/deployment.md) | Docker, Fly.io, Railway, VPS |
| [API Reference](./docs/api-reference.md) | Complete export list (60+ exports) |

## Performance

```
h() JSX factory:       6,400,000 ops/sec
renderToString:           86,000 pages/sec
Route matching:       13,500,000 ops/sec
Validation:            1,900,000 ops/sec
i18n translation:     15,300,000 ops/sec
Dev server startup:          20ms
Production build:            60ms (19 pages)
```

## Development

```bash
bun install              # Install workspace dependencies
bun test                 # Run 1025 tests (93 files)
bun run dev              # Start playground (port 3000)
bun run build            # Build for production
bunx tsc --noEmit        # TypeScript check (strict, 0 errors)
bun run lint             # Biome lint (0 errors)
bun benchmark.ts         # Performance benchmark
```

## Limitations (vs Next.js)

VirexJS is not a drop-in Next.js replacement. Be aware of these differences:

- **No React ecosystem** — Can't use React component libraries (MUI, shadcn, etc.)
- **Streaming is page-level** — Suspense-like async streaming but not per-component like React
- **Image optimization requires sharp** — Install `sharp` for resize/WebP/AVIF (optional peer dep)
- **Hot reload is page-level** — File changes reload the page, not individual components
- **ISR cache is local** — Disk + memory backed, not CDN-integrated like Vercel
- **Young project** — Not battle-tested at scale like Next.js (5+ years, millions of users)
- **Bun-only** — Requires Bun runtime, doesn't run on Node.js

**VirexJS is best for:** Server-centric apps, content sites, APIs, tools, and teams that value simplicity and zero dependencies over the React ecosystem.

**Next.js is better for:** Complex SPAs, React-dependent UIs, Vercel deployments, projects needing the React component ecosystem.

## Tech Stack

| | |
|---|---|
| **Runtime** | Bun 1.2+ |
| **Language** | TypeScript 5.x (strict) |
| **Server** | Bun.serve() |
| **Database** | bun:sqlite |
| **Tests** | bun:test — 1025 tests |
| **Linter** | Biome 2.x |
| **CI** | GitHub Actions |
| **Deploy** | Docker / Fly.io / Railway |

## License

MIT — Estonian company ECOSTACK TECHNOLOGY OÜ
