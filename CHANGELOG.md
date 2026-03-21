# Changelog

## 0.1.0 (2026-03-21)

### Core Framework
- Custom JSX runtime with `renderToString()`, XSS-safe escaping
- Streaming HTML responses with head-first TTFB
- `<Head>` component with tag deduplication
- `useHead()` for programmatic SEO (title, OG, Twitter Card)
- `ErrorBoundary` component with fallback UI and `onError`
- `JsonLd` component for structured data (Article, FAQ, Breadcrumbs)
- Plugin system with 6 lifecycle hooks (`definePlugin`)

### Server
- Bun.serve() HTTP server with middleware chain
- CORS middleware with wildcard/array/function origins
- Rate limiting with sliding window and custom keys
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- Cookie-based sessions with in-memory store
- Gzip compression, ETag + 304, X-Response-Time
- Trailing slash redirect, basePath support

### Routing
- File-based routing with trie matcher
- Dynamic params `[slug]`, catch-all `[...rest]`, route groups `(group)`
- API routes with `GET`/`POST`/`PUT`/`DELETE`/`PATCH`
- Static site generation with `getStaticPaths()`
- Form actions with `defineAction()` and `parseFormData()`

### Authentication
- JWT (HS256) via Web Crypto API with timing-safe comparison
- Route guards with string/array/regex/function matchers
- Session middleware with get/set/destroy API

### Validation
- Chainable validators: `string()`, `number()`, `boolean()`
- Rules: `required`, `min`, `max`, `pattern`, `email`, `url`, `trim`, `default`, `custom`
- `parseBody()` for JSON and FormData request parsing

### Internationalization
- `createI18n()` with dot-notation keys
- String interpolation `{name}` and pluralization (one/other/zero)
- `detectLocale()` from Accept-Language header

### Real-time
- WebSocket routes with `defineWSRoute()` and `createWSServer()`
- Server-Sent Events with `createSSEStream()`
- HMR WebSocket server with error overlay

### Database
- `defineTable()` with typed CRUD (findOne, findMany, insert, update, delete, count)
- Migration system: `migrate()`, `rollback()`, `getMigrationStatus()`
- bun:sqlite with WAL mode and foreign keys

### Build Pipeline
- Production SSG build with `virex build`
- Island extraction and bundling for client hydration
- Utility CSS engine (Tailwind-compatible)
- HTML minifier (comments, whitespace, attributes)
- Sitemap generation
- Build manifest

### CLI
- `virex init` — project scaffolding
- `virex dev` — dev server with HMR
- `virex build` — production build
- `virex preview` — preview production build
- `virex generate` — scaffold page, component, api, middleware, island

### Developer Experience
- React compatibility shim (createElement, hooks, createContext)
- Response helpers (redirect, json, html, notFound, setCookie, parseCookies)
- Structured logger with levels and child loggers
- In-memory TTL cache with maxSize eviction
- `.env` file loader with mode support and variable expansion
- Test utilities (renderComponent, createTestRequest, assertHTML)
- 671 tests, TypeScript strict mode, 0 errors
