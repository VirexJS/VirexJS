# VirexJS

**Ship HTML, not JavaScript.**

[![Tests](https://img.shields.io/badge/tests-1098%20passing-brightgreen)](https://github.com/VirexJS/VirexJS)
[![TypeScript](https://img.shields.io/badge/typescript-strict-blue)](https://github.com/VirexJS/VirexJS)
[![Dependencies](https://img.shields.io/badge/dependencies-0-orange)](https://github.com/VirexJS/VirexJS)
[![npm](https://img.shields.io/npm/v/virexjs)](https://www.npmjs.com/package/virexjs)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A full-stack web framework built on [Bun](https://bun.sh). Zero client-side JS by default, islands architecture with cross-island communication, file-based routing, and built-in everything — auth, database, validation, i18n, real-time — with zero external dependencies.

[Website](https://virexjs.com) | [Docs](./docs/getting-started.md) | [API Reference](./docs/api-reference.md) | [npm](https://www.npmjs.com/package/virexjs) | [Examples](./examples)

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
| **Island Communication** | React Context (85KB) | **Built-in** shared store (0KB) |
| **CSS** | Config required | **Tailwind** auto-config |
| **Startup** | ~2s | **~27ms** |

## Features

### Rendering
- **Zero JS by default** — Pages ship pure server-rendered HTML
- **Islands architecture** — Only interactive components ship JavaScript
- **Cross-island communication** — Shared store + event bus between islands
- **Async streaming** — Suspense-like: loading shell + data swap, no client JS
- **Nested layouts** — `_layout.tsx` per directory with cascade
- **Loading states** — `_loading.tsx` streaming shell
- **Error boundaries** — `_error.tsx` per route segment

### Routing
- **File-based** — `[slug]` params, `[...rest]` catch-all, `(group)` groups
- **SSG** — `getStaticPaths()` for static pre-rendering
- **ISR** — `"use cache"` + `export const revalidate = 60`
- **API routes** — `GET`, `POST`, `PUT`, `DELETE`, `PATCH` exports
- **Parallel loaders** — `defineParallelLoader()` for concurrent data fetching
- **Per-route middleware** — `_middleware.ts` auto-discovery
- **Redirects & rewrites** — config-based URL management

### Built-in
- **Auth** — JWT (HS256), cookie sessions, route guards, CSRF
- **Database** — SQLite ORM with typed CRUD and migrations
- **Validation** — `string().required().email()` chainable validators
- **i18n** — Interpolation, pluralization, locale routing
- **Real-time** — WebSocket routes + Server-Sent Events
- **Security** — CORS, rate limiting, CSP, HSTS, body size limiter
- **Compression** — gzip middleware with smart content-type detection
- **ETag caching** — automatic 304 Not Modified responses

### Components
- `<Link>` with native browser prefetch
- `<Image>` with lazy loading + sharp resize/WebP/blur placeholder
- `<Head>` with tag deduplication
- `<Script>` with loading strategies (defer/lazy/idle/eager)
- `<Font>` with preload + font-display
- `<Preload>` / `<Preconnect>` / `<DNSPrefetch>` resource hints
- `<ErrorBoundary>` with fallback UI
- `<JsonLd>` for structured data (FAQ, breadcrumbs, articles)
- `useHead()` for programmatic SEO

### DX
- **Tailwind CSS** — first-class integration, auto-config
- **TypeScript** — strict mode, `@/` path aliases
- **Directives** — `"use client"`, `"use server"`, `"use cache"`
- **HMR** — WebSocket hot reload with heartbeat, debounce, dev widget
- **CLI** — `create`, `init`, `dev`, `build`, `preview`, `generate`, `check`, `info`
- **Test utilities** — `renderComponent`, `assertHTML`, 1098 tests
- **Critical CSS** — extract + inline above-the-fold styles
- **Auto sitemap + robots.txt** — generated in production builds

## Example

```tsx
// src/pages/blog/[slug].tsx
import type { PageProps, LoaderContext } from "virexjs";
import { useHead, Link } from "virexjs";

export async function loader(ctx: LoaderContext) {
  return await db.findOne({ slug: ctx.params.slug });
}

export default function BlogPost(props: PageProps) {
  const head = useHead({
    title: props.data.title,
    og: { title: props.data.title, type: "article" },
  });

  return (
    <>
      {head}
      <article>
        <h1>{props.data.title}</h1>
        <p>{props.data.content}</p>
        <Link href="/" prefetch>Back to home</Link>
      </article>
    </>
  );
}
```

### Island with Shared State

```tsx
// src/islands/CartButton.tsx
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

// src/islands/CartBadge.tsx — SEPARATE island, auto-synced!
"use island";
import { useSharedStore } from "virexjs";

export default function CartBadge(props) {
  const store = useSharedStore(props);
  store.subscribe("cart.count");
  return <span>Cart: {store.get("cart.count") ?? 0}</span>;
}
```

## Project Structure

```
src/
  pages/              File-based routes
    _layout.tsx        Nested layout (wraps children)
    _loading.tsx       Loading state (async streaming)
    _error.tsx         Error boundary (per-route)
    _404.tsx           Custom 404
    _middleware.ts     Per-route middleware
    index.tsx          /
    blog/[slug].tsx    /blog/:slug
  islands/             Interactive client components
  api/                 API routes
  middleware/          Auto-loaded global middleware
  components/          Server-only components
```

## Packages

| Package | Description |
|---------|-------------|
| [`virexjs`](https://www.npmjs.com/package/virexjs) | Core — CLI, server, renderer, auth, validation, i18n, 75+ exports |
| [`@virexjs/router`](https://www.npmjs.com/package/@virexjs/router) | File-based routing — trie matcher, dynamic params |
| [`@virexjs/bundler`](https://www.npmjs.com/package/@virexjs/bundler) | Build pipeline — HMR, SSG, islands, CSS, Tailwind |
| [`@virexjs/db`](https://www.npmjs.com/package/@virexjs/db) | SQLite ORM — typed CRUD, migrations |

## CLI

```
virex create              Interactive wizard (4 templates + optional features)
virex init <name>         Quick project scaffold (with @/ aliases)
virex dev                 Dev server with HMR + dev widget
virex build               Production SSG build (sitemap + robots.txt)
virex preview             Preview production build
virex generate <type>     Scaffold page, component, api, middleware, island
virex check               Validate project structure and TypeScript
virex info                Show project statistics
```

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](./docs/getting-started.md) | Installation, first page, first island |
| [Routing](./docs/routing.md) | Pages, params, SSG, parallel loaders, async streaming |
| [Components](./docs/components.md) | Link, Image, Head, Preload, Script, Font |
| [Islands](./docs/islands.md) | useIslandState, useSharedStore, event bus |
| [Middleware & Auth](./docs/middleware.md) | CORS, JWT, compression, ETag, per-route |
| [Database](./docs/database.md) | SQLite ORM, CRUD, migrations |
| [Directives](./docs/directives.md) | "use client", "use server", "use cache" |
| [Testing](./docs/testing.md) | Test utilities, virex check, 1098 tests |
| [Configuration](./docs/configuration.md) | Config, .env, Tailwind, plugins, @/ aliases |
| [Deployment](./docs/deployment.md) | GitHub Pages, Docker, Fly.io, VPS |
| [API Reference](./docs/api-reference.md) | Complete export list (75+ exports) |

## Performance

```
h() JSX factory:       6,400,000 ops/sec
renderToString:           86,000 pages/sec
Route matching:       13,500,000 ops/sec
Validation:            1,900,000 ops/sec
i18n translation:     15,300,000 ops/sec
Dev server startup:          27ms
Production build:            12ms (4 pages)
```

## Development

```bash
bun install              # Install workspace dependencies
bun test                 # Run 1098 tests (100 files)
bun run dev              # Start playground (port 3000)
bun run build            # Build for production
bunx tsc --noEmit        # TypeScript check (strict, 0 errors)
virex check              # Validate project
```

## Limitations (vs Next.js)

VirexJS is not a drop-in Next.js replacement:

- **No React ecosystem** — Can't use React component libraries (MUI, shadcn, etc.)
- **Streaming is page-level** — Async streaming but not per-component like React Suspense
- **Image optimization requires sharp** — Install `sharp` for resize/WebP/AVIF
- **Hot reload is page-level** — File changes reload the page, not individual components
- **ISR cache is local** — Disk + memory backed, not CDN-integrated
- **Bun-only** — Requires Bun runtime, doesn't run on Node.js

**VirexJS is best for:** Server-centric apps, content sites, APIs, tools, and teams that value simplicity and zero dependencies.

**Next.js is better for:** Complex SPAs, React-dependent UIs, projects needing the React component ecosystem.

## Tech Stack

| | |
|---|---|
| **Runtime** | Bun 1.2+ |
| **Language** | TypeScript 5.x (strict) |
| **Server** | Bun.serve() |
| **Database** | bun:sqlite |
| **Tests** | bun:test — 1098 tests |
| **Linter** | Biome 2.x |
| **CI** | GitHub Actions |
| **Website** | [virexjs.com](https://virexjs.com) (built with VirexJS) |
| **Deploy** | GitHub Pages / Docker / Fly.io |

## License

MIT — [ECOSTACK TECHNOLOGY OU](https://github.com/VirexJS)
