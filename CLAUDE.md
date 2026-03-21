# VirexJS — Claude Code Instructions

## Project Overview
VirexJS is a next-generation web framework built on Bun runtime. Ships HTML, not JavaScript. Zero external npm dependencies.

## Architecture
- **Monorepo** with Bun workspaces: `packages/*` and `playground`
- **virexjs** — Core: CLI, server, JSX renderer, config system
- **@virexjs/router** — File-based routing: scanner, trie, matcher, params
- **@virexjs/bundler** — Dev mode, HMR WebSocket, island extraction, production build, CSS
- **@virexjs/db** — bun:sqlite typed CRUD query builder

## Commands
```bash
bun install             # Install workspace dependencies
bun test                # Run all 553 tests
bun run dev             # Start playground dev server (port 3000)
bun run build           # Build playground for production
bunx tsc --noEmit       # TypeScript check (must pass with 0 errors)
bun test packages/router/   # Test specific package
```

## CLI Commands
- `virex init <name>` — Scaffold new project
- `virex dev` — Dev server with HMR
- `virex build` — Production build (static pages only, dynamic routes skipped)
- `virex preview` — Preview production build

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
- `_404.tsx` — Custom 404 page
- `_error.tsx` — Custom error page
- `_layout.tsx` — Auto-wrap layout (per-directory)
- `src/islands/` — Island components (or `// "use island"` directive)
- `src/api/` — API routes (`GET`, `POST`, `PUT`, `DELETE` exports)
- `src/middleware/` — Auto-loaded middleware functions

## Type Helpers
```ts
import { defineConfig, defineLoader, defineAPIRoute, defineMiddleware, definePlugin } from "virexjs";
import { Head, useHead, ErrorBoundary } from "virexjs";
import { cors, rateLimit, securityHeaders, createLogger, createCache } from "virexjs";
import { redirect, json, html, notFound, setCookie, parseCookies } from "virexjs";
import { createI18n, defineTranslations, detectLocale } from "virexjs";
import { loadEnv } from "virexjs";
import { renderComponent, createTestRequest, assertHTML } from "virexjs/testing";
```

## Server Features
- Streaming HTML (head-first TTFB)
- Gzip compression (auto for Accept-Encoding: gzip)
- ETag + 304 Not Modified for static files
- X-Response-Time header
- Trailing slash redirect (301)
- basePath support
- Middleware chain with short-circuit
- Island markers in HTML output
- Plugin system with lifecycle hooks
- CORS, rate limiting, security headers middleware
- In-memory cache with TTL

## Key Files
- JSX runtime: `packages/virexjs/src/render/jsx.ts`
- Head component: `packages/virexjs/src/render/head.ts`
- Error boundary: `packages/virexjs/src/render/error-boundary.ts`
- Server entry: `packages/virexjs/src/server/index.ts`
- Router matcher: `packages/router/src/matcher.ts`
- Plugin system: `packages/virexjs/src/plugin/`
- i18n: `packages/virexjs/src/i18n/index.ts`
- Config types: `packages/virexjs/src/config/types.ts`
- Public types: `packages/virexjs/src/types/index.ts`
- CLI entry: `packages/virexjs/src/cli/index.ts`
- Test utilities: `packages/virexjs/src/testing/index.ts`
