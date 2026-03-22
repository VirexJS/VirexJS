# VirexJS — Claude Code Instructions

## Project Overview
VirexJS is a full-stack web framework built on Bun runtime. Ships HTML, not JavaScript. Zero external npm dependencies. 1034 tests across 94 files, TypeScript strict with 0 errors, Biome lint 0 errors.

## Architecture
- **Monorepo** with Bun workspaces: `packages/*` and `playground`
- **virexjs** — Core: CLI, server, JSX renderer, config, middleware, auth, validation, i18n, plugins
- **@virexjs/router** — File-based routing: scanner, trie, matcher, params
- **@virexjs/bundler** — Dev mode, HMR, island bundling, SSG, CSS engine, HTML minifier
- **@virexjs/db** — bun:sqlite typed CRUD query builder + migrations

## Commands
```bash
bun install             # Install workspace dependencies
bun test                # Run all 886 tests
bun run dev             # Start playground dev server (port 3000)
bun run build           # Build playground for production
bunx tsc --noEmit       # TypeScript check (must pass with 0 errors)
bun test packages/router/   # Test specific package
```

## CLI Commands
- `virex init <name>` — Scaffold new project
- `virex dev` — Dev server with HMR
- `virex build` — Production build (SSG)
- `virex preview` — Preview production build
- `virex generate <type> <name>` — Scaffold page, component, api, middleware, island
- `virex check` — Validate project structure, TypeScript, and config

## Code Conventions
- TypeScript strict mode, no `any`
- Biome: tabs, double quotes, semicolons, 100 char line width
- bun:test for testing
- No console.log in library code, only CLI
- JSDoc on exported functions
- node:path for all file path operations

## File Conventions
- `src/pages/` — File-based routing
- `[slug]` — Dynamic param, `[...rest]` — Catch-all
- `(group)` — Route group (no URL segment)
- `_404.tsx` — Custom 404, `_error.tsx` — Custom error, `_layout.tsx` — Layout
- `src/islands/` — Island components (`"use island"` or `"use client"` directive)
- `src/api/` — API routes (`GET`, `POST`, `PUT`, `DELETE` exports)
- `src/middleware/` — Auto-loaded middleware functions
- `_middleware.ts` — Per-route middleware (auto-discovered)

## Directives
- `"use client"` — Client-side island (alias for `"use island"`)
- `"use server"` — Server-only function (RPC-callable)
- `"use cache"` — ISR cached page + `export const revalidate = 60`

## Exports (from "virexjs")
```ts
// Core
defineConfig, defineLoader, defineAPIRoute, defineMiddleware, definePlugin, defineAction
// Rendering
Head, useHead, ErrorBoundary, JsonLd, createBreadcrumbs, createFAQ, Link, Image, Script
// OG Image
generateOGImage
// Server & Middleware
cors, rateLimit, securityHeaders, session, guard, createCache, createLogger, csrf, bodyLimit, requestId, healthCheck, gracefulShutdown
// Response
redirect, json, html, notFound, text, setCookie, parseCookies, actionRedirect, actionJson, parseFormData
// ISR
getISRCache, setISRCache, invalidateISR, withCache
// Routes
route, defineRoute, loadRouteMiddleware
// Directives
serverAction, registerAction, hasDirective, isClientComponent, isCachedPage
// Auth
createJWT, verifyJWT, decodeJWT, JWTError
// Validation
validate, parseBody, string, number, boolean
// i18n
createI18n, defineTranslations, detectLocale
// Config
loadEnv, parseEnvFile, defineEnv
// Real-time
defineWSRoute, createWSServer, createSSEStream
// Async Streaming (v0.2)
renderPageAsync, defineParallelLoader, withETag, etagMiddleware, useIslandState
// Resource Hints (v0.2)
Preload, Preconnect, DNSPrefetch
// Compression (v0.2)
compress, compressionMiddleware
// Testing (from "virexjs/testing")
renderComponent, createTestRequest, createTestLoaderContext, createTestMiddlewareContext, assertHTML
```

## Key Files
- JSX runtime: `packages/virexjs/src/render/jsx.ts`
- Head component: `packages/virexjs/src/render/head.ts`
- Server entry: `packages/virexjs/src/server/index.ts`
- Router matcher: `packages/router/src/matcher.ts`
- Plugin system: `packages/virexjs/src/plugin/`
- Auth (JWT/guards): `packages/virexjs/src/auth/`
- Validation: `packages/virexjs/src/validation/index.ts`
- i18n: `packages/virexjs/src/i18n/index.ts`
- Config types: `packages/virexjs/src/config/types.ts`
- Public types: `packages/virexjs/src/types/index.ts`
- CLI entry: `packages/virexjs/src/cli/index.ts`
- Test utilities: `packages/virexjs/src/testing/index.ts`
- DB migrations: `packages/db/src/migrate.ts`
- Directives: `packages/virexjs/src/directives/index.ts`
- Link/Image/Script: `packages/virexjs/src/render/link.ts`, `image.ts`, `script.ts`
- ISR cache: `packages/virexjs/src/server/isr.ts`
- OG image: `packages/virexjs/src/render/og-image.ts`
- API docs: `packages/virexjs/src/server/api-docs.ts`
- Benchmark: `benchmark.ts`
- Async streaming: `packages/virexjs/src/render/index.ts` (renderPageAsync)
- Parallel loader: `packages/virexjs/src/server/parallel-loader.ts`
- ETag caching: `packages/virexjs/src/server/etag.ts`
- Image optimizer: `packages/virexjs/src/server/image-optimizer.ts`
- Island state hook: `packages/virexjs/src/render/use-island-state.ts`
- CSS engine: `packages/bundler/src/css-engine.ts`
- Critical CSS: `packages/bundler/src/critical-css.ts`
- Sitemap generator: `packages/bundler/src/sitemap.ts`
- Robots.txt generator: `packages/bundler/src/robots.ts`
- Preload components: `packages/virexjs/src/render/preload.ts`
- Route middleware: `packages/virexjs/src/server/route-middleware.ts`

## Documentation
See `docs/` directory for detailed guides:
- `docs/getting-started.md` — Quick start
- `docs/routing.md` — Pages, API routes, SSG, form actions
- `docs/middleware.md` — CORS, rate limit, JWT, sessions, guards
- `docs/directives.md` — "use client", "use server", "use cache"
- `docs/configuration.md` — Config, .env, plugins
- `docs/api-reference.md` — Complete export reference
