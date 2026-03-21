# VirexJS

**Ship HTML, not JavaScript.**

A next-generation web framework built on [Bun](https://bun.sh) runtime. Zero client-side JavaScript by default, islands architecture for selective hydration, and file-based routing.

---

## Project Status

> **Phase 1: Foundation MVP** — Complete
> **Phase 2: Island Hydration + SSG** — Complete
> **Phase 3: React Compat + Plugin System** — Complete

| Component | Status | Details |
|-----------|--------|---------|
| **@virexjs/router** | Done | File-based routing, trie matcher, dynamic params, catch-all, route groups |
| **virexjs/render** | Done | Custom JSX runtime, `renderToString`, XSS-safe, streaming HTML, meta tags |
| **virexjs/server** | Done | Bun.serve wrapper, middleware chain, ETag, gzip, trailing slash, basePath, plugin hooks |
| **@virexjs/bundler** | Done | Dev watcher, HMR, island bundling, SSG, utility CSS engine, production build |
| **@virexjs/db** | Done | bun:sqlite typed CRUD query builder with prepared statements |
| **CLI** | Done | `init`, `dev` (--port, --host), `build`, `preview` |
| **Island Hydration** | Done | Hydration runtime, Bun.build() bundling, 4 strategies, safe DOM |
| **SSG** | Done | `getStaticPaths()` for pre-rendering dynamic routes at build time |
| **CSS Engine** | Done | Built-in utility-first CSS generator (Tailwind-compatible classes) |
| **React Compat** | Done | `createElement`, hooks (SSR stubs), `createContext`/`useContext`, `memo`, `forwardRef`, `Children` |
| **Plugin System** | Done | `definePlugin()`, lifecycle hooks, `transformHTML`, middleware injection |
| **Response Helpers** | Done | `redirect()`, `json()`, `html()`, `notFound()`, `setCookie()`, `parseCookies()` |
| **Head Component** | Done | Declarative `<Head>` for `<title>`, `<meta>`, `<link>` with deduplication |
| **Error Boundaries** | Done | `ErrorBoundary` component with fallback UI, `onError` callback |
| **useHead()** | Done | Programmatic head management with SEO, OG, Twitter Card support |
| **i18n** | Done | `createI18n()`, interpolation, pluralization, `detectLocale()` from Accept-Language |
| **CORS** | Done | Built-in CORS middleware with wildcard, array, function origins |
| **Rate Limiter** | Done | In-memory rate limiter with sliding window, custom keys |
| **Env Loader** | Done | `.env` file loading with mode, interpolation, variable expansion |
| **Logger** | Done | Structured logger with levels, prefix, context, child loggers |
| **Security Headers** | Done | Helmet-like middleware: CSP, HSTS, X-Frame-Options, Referrer-Policy |
| **Cache** | Done | In-memory TTL cache with maxSize eviction, typed API |
| **HTML Minifier** | Done | Comment removal, whitespace collapse, attribute optimization |
| **Tests** | Done | 528 tests across 37 files, 0 failures |
| **TypeScript** | Done | Strict mode, 0 errors |

### Roadmap
- [x] Client-side hydration runtime (discoverIslands, scheduleHydration)
- [x] Island bundling with Bun.build() for browser
- [x] 4 hydration strategies: `visible`, `interaction`, `idle`, `immediate`
- [x] Safe DOM APIs (createElement, textContent — no innerHTML)
- [x] Auto-inject hydration script on pages with islands
- [x] Static site generation with `getStaticPaths()`
- [x] Built-in utility CSS engine (virex engine)
- [x] CLI flags: `--port`, `--host`, `--no-hmr`
- [x] React compatibility shim (`virexjs/compat/react`)
- [x] Plugin system (`definePlugin`, lifecycle hooks)
- [x] Response helpers (`redirect`, `json`, `html`, `setCookie`, `parseCookies`)
- [x] Head component (declarative `<Head>` with deduplication)
- [x] Error boundaries (`ErrorBoundary` with fallback + `onError`)
- [x] `useHead()` hook for programmatic SEO/OG/Twitter head management
- [x] i18n: `createI18n()`, interpolation, pluralization, `detectLocale()`

---

## Features

- **Zero JS by default** — Pages are pure server-rendered HTML
- **Islands architecture** — Only interactive components ship JavaScript (Phase 2 hydration)
- **File-based routing** — Dynamic params `[slug]`, catch-all `[...rest]`, route groups `(auth)`
- **Streaming HTML** — Fast TTFB with streamed `<head>` before body renders
- **Server-side JSX** — Custom JSX runtime with XSS-safe `renderToString`
- **HMR** — WebSocket-based hot module replacement in dev mode
- **Built-in SQLite** — `defineTable()` for typed CRUD with `bun:sqlite`
- **Middleware** — Composable request pipeline with short-circuit support
- **Gzip compression** — Automatic for HTML, CSS, JS, JSON, SVG responses
- **ETag + 304** — Conditional requests for static file caching
- **Zero dependencies** — Everything built on Bun's native APIs

## Quick Start

```bash
# Create a new project
bunx virexjs init my-app
cd my-app
bun install
bun run dev
```

### Monorepo Development

```bash
bun install              # Install workspace dependencies
bun run dev              # Start playground dev server (port 3000)
bun run build            # Build playground for production
bun test                 # Run all 177 tests
bunx tsc --noEmit        # TypeScript type check
```

## Project Structure

```
packages/
  virexjs/               # Main package: CLI, server, JSX renderer, config
    src/cli/             #   CLI commands (init, dev, build, preview)
    src/server/          #   HTTP server, middleware, static file serving
    src/render/          #   JSX factory, renderToString, meta tags, islands
    src/config/          #   Config loader, defaults, types
    src/types/           #   Public type exports, JSX declarations
  router/                # @virexjs/router — file-based routing engine
  bundler/               # @virexjs/bundler — HMR, dev mode, production builds
  db/                    # @virexjs/db — bun:sqlite typed query builder
playground/              # Demo app exercising all features
```

## Creating Pages

```tsx
// src/pages/blog/[slug].tsx
import { defineLoader } from "virexjs";
import type { PageProps, MetaData } from "virexjs";

export const loader = defineLoader(async (ctx) => {
  const post = await getPost(ctx.params.slug);
  return { title: post.title, content: post.content };
});

export function meta(ctx: { data: { title: string } }): MetaData {
  return {
    title: ctx.data.title,
    og: { title: ctx.data.title, type: "article" },
  };
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

### Special Files

| File | Purpose |
|------|---------|
| `_layout.tsx` | Auto-wraps pages in the same directory |
| `_404.tsx` | Custom 404 error page |
| `_error.tsx` | Custom 500 error page |
| `index.tsx` | Maps to directory path (`/blog/index.tsx` → `/blog`) |

### Routing Patterns

| Pattern | Example | URL |
|---------|---------|-----|
| Static | `about.tsx` | `/about` |
| Dynamic | `blog/[slug].tsx` | `/blog/hello-world` |
| Catch-all | `docs/[...rest].tsx` | `/docs/a/b/c` |
| Route group | `(auth)/login.tsx` | `/login` |
| Nested | `users/[id]/posts/[postId].tsx` | `/users/42/posts/99` |

## API Routes

```ts
// src/api/users.ts
import { defineAPIRoute } from "virexjs";

export const GET = defineAPIRoute(({ params }) => {
  return Response.json({ users: [] });
});

export const POST = defineAPIRoute(async ({ request }) => {
  const body = await request.json();
  return Response.json({ created: true }, { status: 201 });
});
```

Supported methods: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`

## Static Site Generation (SSG)

Dynamic routes can be pre-rendered at build time by exporting `getStaticPaths`:

```tsx
// src/pages/blog/[slug].tsx
import type { StaticPath } from "virexjs";

export function getStaticPaths(): StaticPath[] {
  return [
    { params: { slug: "hello-world" } },
    { params: { slug: "getting-started" } },
  ];
}

export async function loader(ctx) {
  return getPost(ctx.params.slug);
}

export default function BlogPost(props) {
  return <article><h1>{props.data.title}</h1></article>;
}
```

Build output:
```
dist/blog/hello-world/index.html
dist/blog/getting-started/index.html
```

Routes without `getStaticPaths` remain server-only (SSR).

## Middleware

```ts
// src/middleware/auth.ts
import { defineMiddleware } from "virexjs";

export default defineMiddleware(async (ctx, next) => {
  const token = ctx.request.headers.get("Authorization");
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }
  ctx.locals.userId = validateToken(token);
  return next();
});
```

Middleware in `src/middleware/` is auto-loaded. Supports:
- Request/response interception
- Short-circuit responses
- Shared context via `ctx.locals`
- Chain ordering

### Built-in Middleware

```ts
// src/middleware/cors.ts
import { cors } from "virexjs";
export default cors({ origin: ["https://myapp.com"], credentials: true });

// src/middleware/rate-limit.ts
import { rateLimit } from "virexjs";
export default rateLimit({ max: 100, windowMs: 60_000 });
```

### Environment Variables

```ts
import { loadEnv } from "virexjs";

// Loads .env, .env.local, .env.production, .env.production.local
const env = loadEnv("production");
// Variables also set on process.env
```

## Islands

Components in `src/islands/` or with `// "use island"` directive are detected as islands:

```tsx
// src/islands/Counter.tsx
// "use island"
export default function Counter(props: { initial: number }) {
  return <span>{props.initial}</span>;
}
```

Output HTML includes hydration markers:
```html
<!--vrx-island:Counter:{"initial":0}:visible-->
<div data-vrx-island="Counter"><span>0</span></div>
<!--/vrx-island-->
```

> Client-side hydration is Phase 2. In Phase 1, islands render as static HTML with markers.

## Head Component

Inject `<head>` tags from anywhere in your component tree:

```tsx
import { Head } from "virexjs";

export default function BlogPost(props: PageProps<{ title: string }>) {
  return (
    <>
      <Head>
        <title>{props.data.title}</title>
        <meta name="description" content="Blog post" />
        <link rel="stylesheet" href="/blog.css" />
      </Head>
      <article>...</article>
    </>
  );
}
```

Tags are automatically deduplicated — later `<title>` overrides earlier, `<meta>` deduped by `name`/`property`.

## Error Boundaries

Catch rendering errors with fallback UI:

```tsx
import { ErrorBoundary } from "virexjs";

export default function App() {
  return (
    <ErrorBoundary
      fallback={(err) => <p>Something went wrong: {err.message}</p>}
      onError={(err) => console.error("Render error:", err)}
    >
      <RiskyComponent />
    </ErrorBoundary>
  );
}
```

## Configuration

```ts
// virex.config.ts
import { defineConfig } from "virexjs";

export default defineConfig({
  port: 3000,
  render: "server",           // "server" | "static" | "hybrid"
  router: {
    trailingSlash: false,
    basePath: "",              // e.g. "/app"
  },
  islands: {
    hydration: "visible",      // "visible" | "interaction" | "idle" | "immediate"
  },
  build: {
    minify: true,
    target: "bun",
  },
  dev: {
    hmr: true,
    hmrPort: 3001,
  },
});
```

## Plugins

Extend VirexJS with the plugin API:

```ts
// plugins/analytics.ts
import { definePlugin } from "virexjs";

export default function analytics(trackingId: string) {
  return definePlugin({
    name: "virex-analytics",
    transformHTML(html, ctx) {
      const script = `<script>track("${trackingId}", "${ctx.pathname}")</script>`;
      return html.replace("</body>", `${script}</body>`);
    },
  });
}
```

Register plugins in your config:

```ts
// virex.config.ts
import { defineConfig } from "virexjs";
import analytics from "./plugins/analytics";

export default defineConfig({
  plugins: [analytics("UA-12345")],
});
```

### Plugin Hooks

| Hook | When | Can Return |
|------|------|------------|
| `configResolved(config)` | After config is merged | Mutate config |
| `serverCreated(info)` | Server is ready | — |
| `buildStart(config)` | Before production build | — |
| `buildEnd(result)` | After production build | — |
| `transformHTML(html, ctx)` | Before sending HTML response | Modified HTML |
| `middleware()` | Server setup | Middleware function(s) |

## i18n

Built-in internationalization with zero dependencies:

```ts
import { createI18n, detectLocale, defineTranslations } from "virexjs";

const en = defineTranslations({
  greeting: "Hello {name}",
  items: { one: "1 item", other: "{count} items", zero: "No items" },
  nav: { home: "Home", about: "About" },
});

const tr = defineTranslations({
  greeting: "Merhaba {name}",
  items: { one: "1 öğe", other: "{count} öğe", zero: "Öğe yok" },
  nav: { home: "Ana Sayfa", about: "Hakkımızda" },
});

const i18n = createI18n({ defaultLocale: "en", locales: { en, tr } });

// In middleware: detect locale from request
const locale = detectLocale(request.headers.get("Accept-Language"), i18n.locales, "en");
const t = i18n.withLocale(locale).t;

t("greeting", { name: "World" });  // "Hello World" or "Merhaba World"
t("items", { count: 3 });          // "3 items" or "3 öğe"
t("nav.home");                     // "Home" or "Ana Sayfa"
```

## Database

```ts
import { defineTable, getDB } from "@virexjs/db";

const posts = defineTable("posts", {
  id: "integer primary key autoincrement",
  title: "text not null",
  slug: "text not null",
  content: "text not null",
  published: "integer not null default 0",
});

// CRUD operations
const post = posts.insert({ title: "Hello", slug: "hello", content: "World", published: 1 });
const found = posts.findOne({ slug: "hello" });
const all = posts.findMany({ where: { published: 1 }, orderBy: "id DESC", limit: 10 });
posts.update({ id: 1 }, { title: "Updated" });
posts.delete({ id: 1 });
const total = posts.count({ published: 1 });
```

## Server Features

| Feature | Description |
|---------|-------------|
| Streaming HTML | `<head>` sent immediately, body follows for fast TTFB |
| Gzip | Auto-compresses HTML/CSS/JS/JSON/SVG (>256 bytes) |
| ETag + 304 | Conditional requests for static files |
| X-Response-Time | Response timing header on every request |
| Trailing slash | Configurable 301 redirect (`/about/` → `/about`) |
| basePath | Route prefix support (`/app/about` → `/about`) |
| HMR | WebSocket-based hot reload in dev mode |
| Error overlay | Dev-mode error display in browser |

## CLI Commands

```
virex init <name>     Create a new VirexJS project
virex dev             Start development server with HMR
virex build           Build for production (static pages only)
virex preview         Preview production build locally
virex --help          Show help
virex --version       Show version
```

## Tech Stack

- **Runtime:** Bun 1.2+ (only runtime, no Node.js)
- **Language:** TypeScript 5.x (strict: true, no any)
- **HTTP Server:** Bun.serve()
- **Database:** bun:sqlite
- **Test Runner:** bun:test
- **Linter:** Biome

## License

MIT — ECOSTACK TECHNOLOGY OÜ
