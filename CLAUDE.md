# VirexJS — Claude Code Instructions

## Project Overview
VirexJS is a full-stack web framework built on Bun runtime. Ships HTML, not JavaScript. Zero external npm dependencies. 804 tests (100% coverage), TypeScript strict with 0 errors.

## Architecture
- **Monorepo** with Bun workspaces: `packages/*` and `playground`
- **virexjs** — Core: CLI, server, JSX renderer, config, middleware, auth, validation, i18n, plugins
- **@virexjs/router** — File-based routing: scanner, trie, matcher, params
- **@virexjs/bundler** — Dev mode, HMR, island bundling, SSG, CSS engine, HTML minifier
- **@virexjs/db** — bun:sqlite typed CRUD query builder + migrations

## Commands
```bash
bun install             # Install workspace dependencies
bun test                # Run all 804 tests
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
- `src/islands/` — Island components (or `// "use island"` directive)
- `src/api/` — API routes (`GET`, `POST`, `PUT`, `DELETE` exports)
- `src/middleware/` — Auto-loaded middleware functions

## Exports (from "virexjs")
```ts
// Core
defineConfig, defineLoader, defineAPIRoute, defineMiddleware, definePlugin, defineAction
// Rendering
Head, useHead, ErrorBoundary, JsonLd, createBreadcrumbs, createFAQ
// Server & Middleware
cors, rateLimit, securityHeaders, session, guard, createCache, createLogger
// Response
redirect, json, html, notFound, text, setCookie, parseCookies, actionRedirect, actionJson, parseFormData
// Auth
createJWT, verifyJWT, decodeJWT, JWTError
// Validation
validate, parseBody, string, number, boolean
// i18n
createI18n, defineTranslations, detectLocale
// Config
loadEnv, parseEnvFile
// Real-time
defineWSRoute, createWSServer, createSSEStream
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

## Documentation
See `docs/` directory for detailed guides:
- `docs/getting-started.md` — Quick start
- `docs/routing.md` — Pages, API routes, SSG, form actions
- `docs/middleware.md` — CORS, rate limit, JWT, sessions, guards
- `docs/configuration.md` — Config, .env, plugins
- `docs/api-reference.md` — Complete export reference
