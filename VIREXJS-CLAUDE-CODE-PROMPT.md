# VirexJS — Claude Code Single-Shot Prompt (Phase 1: Foundation)

You are building **VirexJS**, a next-generation web framework built on Bun runtime. This is Phase 1 (Foundation MVP). Follow every instruction precisely. Do NOT skip any step. Do NOT add external npm dependencies — everything is built on Bun's built-in APIs.

---

## PROJECT IDENTITY

- **Name:** VirexJS
- **npm package:** `virexjs` (main), `@virexjs/*` (scoped packages)
- **GitHub org:** `virex-js`
- **Tagline:** "Ship HTML, not JavaScript."
- **License:** MIT
- **Author:** ECOSTACK TECHNOLOGY OÜ

---

## CORE PHILOSOPHY (NON-NEGOTIABLE)

1. **ZERO external npm dependencies** in all packages. Only Bun built-in APIs.
2. **ZERO JavaScript shipped to client by default.** Pages are pure HTML.
3. **Explicit > Implicit.** No hidden caching, no invisible boundaries.
4. **TypeScript strict mode** everywhere. No `any` types.
5. **Single responsibility** per file. Small, focused modules.

---

## TECH STACK

- **Runtime:** Bun 1.2+ (only runtime, no Node.js)
- **Language:** TypeScript 5.x (strict: true, no any)
- **HTTP Server:** Bun.serve()
- **Bundler:** Bun.build() (wrapped)
- **Database:** bun:sqlite
- **Test Runner:** bun:test
- **Linter:** Biome

---

## STEP 1: MONOREPO STRUCTURE

Create the following directory structure exactly:

```
virexjs/
├── packages/
│   ├── virexjs/                  # Main package (CLI + core runtime)
│   │   ├── src/
│   │   │   ├── cli/
│   │   │   │   ├── index.ts       # CLI entry: command dispatcher
│   │   │   │   ├── dev.ts         # virex dev command
│   │   │   │   ├── build.ts       # virex build command
│   │   │   │   └── preview.ts     # virex preview command
│   │   │   ├── server/
│   │   │   │   ├── index.ts       # createServer() — Bun.serve wrapper
│   │   │   │   ├── handler.ts     # Request → route match → render → Response
│   │   │   │   ├── middleware.ts   # Middleware chain runner
│   │   │   │   ├── static.ts      # Static file serving from /public
│   │   │   │   └── streaming.ts   # ReadableStream HTML response builder
│   │   │   ├── render/
│   │   │   │   ├── index.ts       # Render orchestrator (page → HTML Response)
│   │   │   │   ├── jsx.ts         # h() factory + renderToString()
│   │   │   │   ├── html.ts        # HTML document shell (<!DOCTYPE>, <head>, etc.)
│   │   │   │   ├── meta.ts        # <head> metadata injection from page meta()
│   │   │   │   └── island-marker.ts  # Detect islands, wrap with marker comments
│   │   │   ├── config/
│   │   │   │   ├── index.ts       # loadConfig() — loads virex.config.ts
│   │   │   │   ├── defaults.ts    # DEFAULT_CONFIG object
│   │   │   │   └── types.ts       # VirexConfig type
│   │   │   └── types/
│   │   │       └── index.ts       # All public types: PageProps, LoaderContext, etc.
│   │   ├── jsx-runtime.ts         # JSX automatic runtime entry
│   │   ├── jsx-dev-runtime.ts     # JSX dev runtime entry
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── router/                    # @virexjs/router
│   │   ├── src/
│   │   │   ├── index.ts           # Public API exports
│   │   │   ├── scanner.ts         # scanPages(dir) → RouteNode[]
│   │   │   ├── matcher.ts         # matchRoute(url, tree) → MatchResult | null
│   │   │   ├── params.ts          # parseSegment("[slug]") → ParamDef
│   │   │   ├── tree.ts            # buildTree(routes) → trie structure
│   │   │   └── types.ts           # RouteNode, MatchResult, ParamDef types
│   │   ├── tests/
│   │   │   ├── scanner.test.ts
│   │   │   ├── matcher.test.ts
│   │   │   └── params.test.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── bundler/                   # @virexjs/bundler
│   │   ├── src/
│   │   │   ├── index.ts           # Public API
│   │   │   ├── dev.ts             # Dev mode: watch + on-demand compile
│   │   │   ├── build.ts           # Production build pipeline
│   │   │   ├── hmr.ts             # HMR WebSocket server
│   │   │   ├── hmr-client.ts      # HMR client script (injected in dev)
│   │   │   ├── island-extract.ts  # Scan for "use island" → island registry
│   │   │   ├── css.ts             # CSS collection + minification
│   │   │   └── manifest.ts        # Build manifest generation
│   │   ├── tests/
│   │   │   └── island-extract.test.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── db/                        # @virexjs/db
│       ├── src/
│       │   ├── index.ts           # Public API: { db, defineTable }
│       │   ├── client.ts          # getDB() — bun:sqlite singleton
│       │   └── table.ts           # defineTable() → typed CRUD query builder
│       ├── tests/
│       │   └── table.test.ts
│       ├── package.json
│       └── tsconfig.json
│
├── playground/                    # Test/demo app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.tsx          # Home page with loader
│   │   │   ├── about.tsx          # Static about page
│   │   │   └── blog/
│   │   │       ├── index.tsx      # Blog list page
│   │   │       └── [slug].tsx     # Dynamic blog post page
│   │   ├── islands/
│   │   │   └── Counter.tsx        # Interactive counter (island)
│   │   ├── components/
│   │   │   ├── Header.tsx         # Server-only header
│   │   │   └── Footer.tsx         # Server-only footer
│   │   ├── layouts/
│   │   │   └── Default.tsx        # Default layout
│   │   ├── api/
│   │   │   └── hello.ts           # Sample API route
│   │   └── middleware/
│   │       └── logger.ts          # Sample logger middleware
│   ├── public/
│   │   └── robots.txt
│   ├── virex.config.ts
│   └── tsconfig.json
│
├── package.json                   # Workspace root
├── tsconfig.json                  # Base TS config
├── biome.json                     # Linting config
├── LICENSE                        # MIT
└── README.md
```

---

## STEP 2: ROOT WORKSPACE FILES

### package.json (root)
```json
{
  "name": "virexjs-monorepo",
  "private": true,
  "workspaces": ["packages/*", "playground"],
  "scripts": {
    "dev": "cd playground && bun run ../packages/virexjs/src/cli/index.ts dev",
    "build": "cd playground && bun run ../packages/virexjs/src/cli/index.ts build",
    "test": "bun test --recursive packages/",
    "test:router": "bun test packages/router/",
    "test:bundler": "bun test packages/bundler/",
    "test:db": "bun test packages/db/",
    "lint": "bunx @biomejs/biome check .",
    "typecheck": "bunx tsc --noEmit"
  },
  "devDependencies": {
    "@biomejs/biome": "latest",
    "@types/bun": "latest",
    "typescript": "^5.7.0"
  }
}
```

### tsconfig.json (root base)
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "jsxImportSource": "virexjs",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "virexjs": ["./packages/virexjs/src/types/index.ts"],
      "virexjs/*": ["./packages/virexjs/src/*"],
      "@virexjs/router": ["./packages/router/src/index.ts"],
      "@virexjs/bundler": ["./packages/bundler/src/index.ts"],
      "@virexjs/db": ["./packages/db/src/index.ts"]
    }
  },
  "exclude": ["node_modules", "dist", "playground/dist"]
}
```

### biome.json
```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": { "noExcessiveCognitiveComplexity": "warn" },
      "suspicious": { "noExplicitAny": "error" }
    }
  },
  "formatter": {
    "indentStyle": "tab",
    "lineWidth": 100
  },
  "javascript": {
    "formatter": { "quoteStyle": "double", "semicolons": "always" }
  }
}
```

---

## STEP 3: IMPLEMENT @virexjs/router

### packages/router/package.json
```json
{
  "name": "@virexjs/router",
  "version": "0.1.0",
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "license": "MIT",
  "author": "ECOSTACK TECHNOLOGY OÜ"
}
```

### packages/router/src/types.ts
```typescript
export interface ParamDef {
	name: string;
	type: "single" | "catchAll";
}

export interface RouteNode {
	/** URL segment: "blog", ":slug", "*rest" */
	segment: string;
	/** Absolute file path to .tsx/.ts file */
	filePath: string | null;
	/** Is this a dynamic param segment? */
	isDynamic: boolean;
	/** Is this a catch-all [...rest] segment? */
	isCatchAll: boolean;
	/** Is this a route group (parenthesized)? */
	isGroup: boolean;
	/** Extracted param definitions */
	params: ParamDef[];
	/** Child route nodes */
	children: RouteNode[];
}

export interface MatchResult {
	/** Matched route node */
	route: RouteNode;
	/** Extracted URL params */
	params: Record<string, string>;
	/** Parsed query string */
	query: Record<string, string>;
	/** Full matched path */
	path: string;
}

export interface ScannedRoute {
	/** Relative path from pages dir: "blog/[slug].tsx" */
	relativePath: string;
	/** Absolute file path */
	absolutePath: string;
	/** URL segments: ["blog", "[slug]"] */
	segments: string[];
}
```

### packages/router/src/params.ts

Implement these functions:

```typescript
/**
 * Parse a file/directory name into a param definition.
 * "[slug]" → { name: "slug", type: "single" }
 * "[...rest]" → { name: "rest", type: "catchAll" }
 * "blog" → null (not dynamic)
 */
export function parseSegment(segment: string): ParamDef | null

/**
 * Convert a file segment to a URL segment.
 * "[slug]" → ":slug"
 * "[...rest]" → "*rest"
 * "(auth)" → null (group, no URL segment)
 * "blog" → "blog"
 */
export function segmentToURL(segment: string): string | null

/**
 * Extract param values from a URL path given a route pattern.
 * Pattern: ["blog", ":slug"], Path: ["blog", "hello-world"]
 * → { slug: "hello-world" }
 */
export function extractParams(
	patternSegments: string[],
	pathSegments: string[]
): Record<string, string> | null
```

### packages/router/src/scanner.ts

```typescript
import { readdirSync, statSync } from "node:fs";
import { join, relative, extname, basename } from "node:path";
import type { ScannedRoute } from "./types";

/**
 * Recursively scan a pages directory and return all route files.
 * 
 * Rules:
 * - Only .tsx and .ts files (not .css, .test.ts, etc.)
 * - Files starting with _ are special: _404.tsx, _error.tsx, _layout.tsx
 * - Directories in parentheses are route groups: (auth)/login.tsx → /login
 * - index.tsx maps to the directory path: blog/index.tsx → /blog
 */
export function scanPages(pagesDir: string): ScannedRoute[]
```

Implement this fully. Use `readdirSync` and `statSync` from `node:fs`. Recursively traverse. For each `.tsx`/`.ts` file found, compute:
- `relativePath`: relative to pagesDir, e.g. `"blog/[slug].tsx"`
- `absolutePath`: full filesystem path
- `segments`: directory + filename parts, e.g. `["blog", "[slug]"]` (strip extension, strip "index")

### packages/router/src/tree.ts

```typescript
import type { RouteNode, ScannedRoute } from "./types";

/**
 * Build a route tree (trie) from scanned routes.
 * 
 * The tree root represents "/" and each child is a URL segment.
 * Children are sorted by priority: static > dynamic > catch-all.
 */
export function buildTree(routes: ScannedRoute[]): RouteNode
```

Implement this. Each scanned route is inserted into the trie. Static segments go before dynamic ones in the children array. Catch-all segments go last.

### packages/router/src/matcher.ts

```typescript
import type { RouteNode, MatchResult } from "./types";

/**
 * Match a URL path against the route tree.
 * 
 * Priority order:
 * 1. Exact static match
 * 2. Index file match (trailing / → index)
 * 3. Dynamic param match (:slug)
 * 4. Catch-all match (*rest)
 * 5. null (no match → 404)
 * 
 * Also parses query string from the URL.
 */
export function matchRoute(url: string, tree: RouteNode): MatchResult | null
```

Implement this. Split URL by "/", walk the trie, try static children first, then dynamic, then catch-all. Parse query string with `URL` constructor or manual split on "?".

### packages/router/src/index.ts

```typescript
export { scanPages } from "./scanner";
export { buildTree } from "./tree";
export { matchRoute } from "./matcher";
export { parseSegment, segmentToURL, extractParams } from "./params";
export type { RouteNode, MatchResult, ScannedRoute, ParamDef } from "./types";
```

### packages/router/tests/ — Write comprehensive tests

Write at least 30 test cases covering:

**scanner.test.ts:**
- Empty directory → empty array
- Single index.tsx → one route at "/"
- Nested directories → correct segments
- Dynamic params → correct parsing
- Catch-all → correct parsing
- Route groups (parentheses) → stripped from segments
- Non-tsx files → ignored
- _404.tsx → scanned with special flag

**matcher.test.ts:**
- "/" → matches index
- "/about" → matches about.tsx
- "/blog" → matches blog/index.tsx
- "/blog/my-post" → matches blog/[slug].tsx with params.slug = "my-post"
- "/blog/my-post?page=2" → correct query parsing
- "/nonexistent" → null (no match)
- Priority: static wins over dynamic
- Catch-all: "/any/path/here" matches [...catch].tsx
- URL-encoded params: "/blog/hello%20world" → params.slug = "hello world"

**params.test.ts:**
- "[slug]" → single param
- "[...rest]" → catch-all param
- "blog" → null
- "(auth)" → group detection
- extractParams with various inputs

---

## STEP 4: IMPLEMENT JSX SERVER RENDERER

### packages/virexjs/jsx-runtime.ts
```typescript
export { h as jsx, h as jsxs, Fragment } from "./src/render/jsx";
```

### packages/virexjs/jsx-dev-runtime.ts
```typescript
export { h as jsxDEV, Fragment } from "./src/render/jsx";
```

### packages/virexjs/src/render/jsx.ts

Implement these fully:

```typescript
// Types
export type VNode = string | number | boolean | null | undefined | VElement | VNode[];

export interface VElement {
	type: string | ((props: Record<string, unknown>) => VNode);
	props: Record<string, unknown>;
}

export const Fragment = Symbol.for("vrx.fragment");

/**
 * JSX factory function. This replaces React.createElement.
 * - String type ("div", "span") → VElement for HTML rendering
 * - Function type (Component) → call it immediately, return its output
 * - Fragment → just return children
 */
export function h(
	type: string | symbol | ((props: Record<string, unknown>) => VNode),
	props: Record<string, unknown> | null,
	...children: unknown[]
): VNode

/**
 * Render a VNode tree to an HTML string.
 * 
 * CRITICAL RULES:
 * - Escape all text content (XSS prevention)
 * - Escape attribute values
 * - className → class
 * - htmlFor → for
 * - Strip event handlers (onClick, onChange, onSubmit, etc.)
 * - Strip "ref" prop
 * - Handle boolean attributes: <input disabled /> → <input disabled>
 * - Handle style objects: { color: "red", fontSize: "16px" } → 'color:red;font-size:16px'
 * - Handle void elements (img, br, hr, input, meta, link, etc.) — no closing tag
 * - Handle dangerouslySetInnerHTML: { __html: "<b>raw</b>" }
 * - Handle arrays (lists): render each item, join
 * - Handle null/undefined/boolean: render nothing
 * - Handle numbers: render as string
 */
export function renderToString(node: VNode): string

/** Escape HTML content to prevent XSS */
function escapeHtml(str: string): string

/** Escape attribute values */
function escapeAttr(str: string): string

/** Convert camelCase style prop to kebab-case CSS */
function styleToString(style: Record<string, string | number>): string

/** Set of void HTML elements that must not have closing tags */
const VOID_ELEMENTS: Set<string>
```

### packages/virexjs/src/render/html.ts

```typescript
/**
 * Build a complete HTML document shell.
 * 
 * Output structure:
 * <!DOCTYPE html>
 * <html lang="en">
 * <head>
 *   <meta charset="utf-8">
 *   <meta name="viewport" content="width=device-width, initial-scale=1">
 *   {metaTags}
 *   {cssLinks}
 * </head>
 * <body>
 *   {bodyContent}
 *   {devScripts — only in dev mode}
 * </body>
 * </html>
 */
export function buildDocument(options: {
	lang?: string;
	head: string;
	body: string;
	cssLinks?: string[];
	devScript?: string;
}): string
```

### packages/virexjs/src/render/meta.ts

```typescript
export interface MetaData {
	title?: string;
	description?: string;
	canonical?: string;
	og?: {
		title?: string;
		description?: string;
		image?: string;
		type?: string;
	};
	twitter?: {
		card?: string;
		title?: string;
		description?: string;
		image?: string;
	};
}

/**
 * Render MetaData to HTML string of <title> and <meta> tags.
 */
export function renderMeta(meta: MetaData): string
```

### packages/virexjs/src/render/island-marker.ts

```typescript
/**
 * Check if a component file path is from the islands directory.
 */
export function isIsland(filePath: string, islandsDir: string): boolean

/**
 * Wrap island HTML with marker comments for Phase 2 hydration.
 * 
 * Input: rendered HTML string, island name, serialized props, hydration strategy
 * Output: 
 *   <!--vrx-island:Counter:{"initial":0}:visible-->
 *   <div data-vrx-island="Counter">{renderedHTML}</div>
 *   <!--/vrx-island-->
 */
export function wrapIslandMarker(
	html: string,
	name: string,
	props: Record<string, unknown>,
	hydration?: string
): string
```

### packages/virexjs/src/render/index.ts

```typescript
import { renderToString, h } from "./jsx";
import { buildDocument } from "./html";
import { renderMeta, type MetaData } from "./meta";

/**
 * Full page render pipeline:
 * 1. Call layout component (if any) with page as children
 * 2. Render to HTML string via renderToString
 * 3. Build head (meta tags + CSS links)
 * 4. Build complete document
 * 5. Return as streaming Response
 */
export function renderPage(options: {
	component: (props: Record<string, unknown>) => unknown;
	layout?: (props: { children: unknown }) => unknown;
	data?: Record<string, unknown>;
	meta?: MetaData;
	cssLinks?: string[];
	devScript?: string;
}): Response
```

This function should create a `ReadableStream` that:
1. Sends `<!DOCTYPE html><html><head>...</head><body>` immediately
2. Sends the rendered body content
3. Sends `</body></html>` and closes

Use `new Response(stream, { headers: { "Content-Type": "text/html; charset=utf-8" } })`.

---

## STEP 5: IMPLEMENT HTTP SERVER

### packages/virexjs/src/server/index.ts

```typescript
import type { VirexConfig } from "../config/types";

/**
 * Create and start the VirexJS HTTP server.
 * Uses Bun.serve() with the following request pipeline:
 * 
 * 1. Check /public static files → serve with correct MIME type
 * 2. Check /_virex/ built assets → serve with immutable cache headers  
 * 3. Match API routes (src/api/) → call handler
 * 4. Match page routes (src/pages/) → run middleware → run loader → render
 * 5. 404 fallback
 */
export function createServer(config: VirexConfig): { 
	server: ReturnType<typeof Bun.serve>;
	stop: () => void;
}
```

### packages/virexjs/src/server/handler.ts

```typescript
import type { RouteNode, MatchResult } from "@virexjs/router";

/**
 * Handle a matched page route:
 * 1. Import the page module dynamically
 * 2. Run middleware chain (if any)
 * 3. Call loader() export (if exists) with { params, request, headers }
 * 4. Call meta() export (if exists) with { data }
 * 5. Render page component with { data }
 * 6. Return streaming HTML Response
 */
export async function handlePageRequest(
	match: MatchResult,
	request: Request
): Promise<Response>

/**
 * Handle an API route:
 * 1. Import the API module dynamically
 * 2. Call the appropriate exported function (GET, POST, PUT, DELETE)
 * 3. Return the Response
 */
export async function handleAPIRequest(
	filePath: string,
	request: Request
): Promise<Response>
```

### packages/virexjs/src/server/middleware.ts

```typescript
export interface MiddlewareContext {
	request: Request;
	params: Record<string, string>;
	locals: Record<string, unknown>;
}

export type MiddlewareNext = () => Promise<Response>;
export type MiddlewareFn = (ctx: MiddlewareContext, next: MiddlewareNext) => Promise<Response | void>;

/**
 * Run a chain of middleware functions.
 * If any middleware returns a Response, short-circuit.
 * Otherwise, call next() to proceed to the next middleware or final handler.
 */
export async function runMiddleware(
	middlewares: MiddlewareFn[],
	ctx: MiddlewareContext,
	finalHandler: () => Promise<Response>
): Promise<Response>
```

### packages/virexjs/src/server/static.ts

```typescript
/**
 * Try to serve a static file from the public directory.
 * Returns null if file doesn't exist.
 * Sets correct Content-Type based on file extension.
 */
export async function serveStatic(
	path: string,
	publicDir: string
): Promise<Response | null>
```

Use `Bun.file()` to check existence and serve. Map extensions to MIME types manually (at least: html, css, js, json, png, jpg, gif, svg, ico, woff2, txt, xml).

---

## STEP 6: IMPLEMENT @virexjs/bundler

### packages/bundler/src/dev.ts

```typescript
import { watch } from "node:fs";

/**
 * Start dev mode:
 * 1. Initial scan of all source files
 * 2. Start file watcher on src/ directory (recursive)
 * 3. On file change: determine what changed, notify HMR
 * 4. Track dependency graph: which pages use which components
 */
export function startDevMode(options: {
	srcDir: string;
	onFileChange: (filePath: string, event: string) => void;
}): { stop: () => void }
```

### packages/bundler/src/hmr.ts

```typescript
/**
 * HMR WebSocket server.
 * Runs alongside the HTTP server.
 * Sends messages to connected browsers on file changes.
 * 
 * Message types:
 * - { type: "page-update", path: string, html: string }
 * - { type: "css-update", href: string }
 * - { type: "full-reload" }
 * - { type: "error", message: string, file: string, line?: number }
 * - { type: "connected" }
 */
export function createHMRServer(port: number): {
	broadcast: (message: Record<string, unknown>) => void;
	stop: () => void;
}
```

Implement using Bun.serve() with WebSocket upgrade.

### packages/bundler/src/hmr-client.ts

```typescript
/**
 * Generate the HMR client script that's injected into HTML during dev mode.
 * This is a plain JavaScript string (not TypeScript).
 * 
 * Features:
 * - WebSocket connection to HMR server
 * - Auto-reconnect on disconnect (with exponential backoff)
 * - Handle message types: page-update, css-update, full-reload, error
 * - Error overlay: create a div with stack trace display
 * - CSS hot swap: update <link> href without page reload
 */
export function generateHMRClientScript(hmrPort: number): string
```

Return a string of JavaScript code (~60-80 lines). This will be injected as `<script>` before `</body>`.

### packages/bundler/src/island-extract.ts

```typescript
/**
 * Scan source files to find island components.
 * An island is any .tsx file in the islands/ directory,
 * OR any file that starts with "use island"; directive.
 * 
 * Returns a registry mapping island names to file paths.
 */
export function extractIslands(srcDir: string): Map<string, {
	filePath: string;
	name: string;
}>
```

### packages/bundler/src/build.ts

```typescript
/**
 * Production build pipeline:
 * 1. Scan all pages (via router scanner)
 * 2. For each page: import → call loader (if static/hybrid) → render → write HTML
 * 3. Collect all CSS imports → concatenate → minify → write to dist/
 * 4. Copy public/ → dist/
 * 5. Generate build manifest
 * 6. Return build stats
 */
export async function buildProduction(options: {
	srcDir: string;
	outDir: string;
	publicDir: string;
	minify: boolean;
}): Promise<{
	pages: number;
	assets: number;
	totalSize: number;
	time: number;
}>
```

### packages/bundler/src/css.ts

```typescript
/**
 * Collect all CSS files imported in the project.
 * Concatenate them, optionally minify, write to output.
 * Return the output filename (with hash for cache busting).
 */
export function processCSS(options: {
	srcDir: string;
	outDir: string;
	minify: boolean;
}): Promise<{ filename: string; size: number } | null>
```

Basic CSS minification: strip comments, collapse whitespace, remove empty rules. Do NOT add PostCSS or any external CSS tool.

---

## STEP 7: IMPLEMENT @virexjs/db

### packages/db/src/client.ts

```typescript
import { Database } from "bun:sqlite";

let _db: Database | null = null;

/**
 * Get or create the SQLite database singleton.
 * Enables WAL mode and foreign keys by default.
 */
export function getDB(path?: string): Database
```

### packages/db/src/table.ts

```typescript
import { getDB } from "./client";

type ColumnDef = string; // e.g. "text not null", "integer primary key autoincrement"

interface TableOperations<T extends Record<string, ColumnDef>> {
	findOne(where: Partial<Record<keyof T, unknown>>): Record<string, unknown> | null;
	findMany(opts?: {
		where?: Partial<Record<keyof T, unknown>>;
		orderBy?: string;
		limit?: number;
		offset?: number;
	}): Record<string, unknown>[];
	insert(data: Partial<Record<keyof T, unknown>>): Record<string, unknown>;
	update(
		where: Partial<Record<keyof T, unknown>>,
		data: Partial<Record<keyof T, unknown>>
	): Record<string, unknown> | null;
	delete(where: Partial<Record<keyof T, unknown>>): void;
	count(where?: Partial<Record<keyof T, unknown>>): number;
}

/**
 * Define a table with auto-creation and return typed CRUD operations.
 * Uses prepared statements for SQL injection prevention.
 */
export function defineTable<T extends Record<string, ColumnDef>>(
	name: string,
	schema: T
): TableOperations<T>
```

Write tests: CRUD operations, empty results, count, orderBy, limit/offset.

---

## STEP 8: IMPLEMENT CLI

### packages/virexjs/src/cli/index.ts

```typescript
#!/usr/bin/env bun

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
	case "dev":
		await import("./dev").then((m) => m.dev(args.slice(1)));
		break;
	case "build":
		await import("./build").then((m) => m.build(args.slice(1)));
		break;
	case "preview":
		await import("./preview").then((m) => m.preview(args.slice(1)));
		break;
	case "--version":
	case "-v":
		console.log("virexjs 0.1.0");
		break;
	case "--help":
	case "-h":
	default:
		printHelp();
}

function printHelp(): void {
	console.log(`
  ⚡ VirexJS v0.1.0 — Ship HTML, not JavaScript.

  Usage: virex <command>

  Commands:
    dev       Start development server with HMR
    build     Build for production
    preview   Preview production build locally

  Options:
    --help    Show this help message
    --version Show version number
`);
}
```

### packages/virexjs/src/cli/dev.ts

```typescript
/**
 * `virex dev` command:
 * 1. Print startup banner
 * 2. Load config from virex.config.ts (or defaults)
 * 3. Scan routes
 * 4. Start HTTP server (Bun.serve)
 * 5. Start HMR WebSocket server
 * 6. Start file watcher
 * 7. Print ready message with URL and timing
 */
export async function dev(args: string[]): Promise<void>
```

Print a startup banner like:
```
  ⚡ VirexJS v0.1.0

  → Local:   http://localhost:3000
  → Network: http://192.168.1.x:3000
  → HMR:     ws://localhost:3001

  Ready in 47ms · 4 routes found
```

### packages/virexjs/src/cli/build.ts

```typescript
/**
 * `virex build` command:
 * 1. Load config
 * 2. Run production build pipeline
 * 3. Print build stats
 */
export async function build(args: string[]): Promise<void>
```

---

## STEP 9: CONFIG SYSTEM

### packages/virexjs/src/config/types.ts

Define the full VirexConfig type:

```typescript
export interface VirexConfig {
	port: number;
	hostname: string;
	srcDir: string;
	outDir: string;
	publicDir: string;
	render: "static" | "server" | "hybrid";
	islands: {
		hydration: "visible" | "interaction" | "idle" | "immediate";
		reactCompat: "shim" | "react" | "none";
	};
	router: {
		trailingSlash: boolean;
		basePath: string;
	};
	css: {
		engine: "passthrough" | "tailwind" | "virex" | "both";
	};
	build: {
		target: "bun" | "static";
		minify: boolean;
		sourceMaps: boolean;
	};
	dev: {
		open: boolean;
		hmr: boolean;
		hmrPort: number;
	};
}
```

### packages/virexjs/src/config/defaults.ts

Provide sensible defaults for all config values.

### packages/virexjs/src/config/index.ts

```typescript
/**
 * Load config from virex.config.ts in the current working directory.
 * Deep-merge with defaults.
 * If no config file found, use defaults.
 */
export async function loadConfig(): Promise<VirexConfig>
```

Use dynamic `import()` to load the config file. Use a manual deep merge function (no lodash).

---

## STEP 10: PLAYGROUND APP

Create a complete demo app in `playground/` that exercises all features.

### playground/virex.config.ts
```typescript
import { defineConfig } from "virexjs";

export default defineConfig({
	port: 3000,
	render: "server",
});
```

### playground/src/pages/index.tsx
A homepage with:
- A server-rendered header and footer (from components/)
- A list of "blog posts" loaded via a loader function
- A Counter island component
- Meta tags for SEO

### playground/src/pages/about.tsx
A simple static about page with hardcoded content. No loader needed.

### playground/src/pages/blog/[slug].tsx
A dynamic blog post page. The loader reads the slug param and returns mock blog data.

### playground/src/islands/Counter.tsx
An interactive counter. Mark with comment `// "use island"` at top.
Render server-side as static HTML (just show initial count).
In Phase 1, this won't hydrate on client — just demonstrates the island detection.

### playground/src/components/Header.tsx, Footer.tsx
Simple server-only components that render navigation HTML.

### playground/src/layouts/Default.tsx
Layout with `<html>`, `<head>`, `<body>` structure wrapping `{children}`.

### playground/src/api/hello.ts
```typescript
export function GET() {
	return Response.json({ message: "Hello from VirexJS!", timestamp: Date.now() });
}
export function POST({ request }) {
	return Response.json({ received: true }, { status: 201 });
}
```

---

## STEP 11: TYPES EXPORTS

### packages/virexjs/src/types/index.ts

Export all public types that framework users need:

```typescript
// Page types
export interface PageProps<T = Record<string, unknown>> {
	data: T;
	params: Record<string, string>;
	url: URL;
}

export interface LoaderContext {
	params: Record<string, string>;
	request: Request;
	headers: Headers;
}

export interface MetaContext<T = Record<string, unknown>> {
	data: T;
	params: Record<string, string>;
}

// API types
export interface APIContext {
	request: Request;
	params: Record<string, string>;
}

// Config helper
export function defineConfig(config: Partial<VirexConfig>): VirexConfig;

// Re-exports
export type { VirexConfig } from "../config/types";
export type { MetaData } from "../render/meta";
```

---

## CRITICAL IMPLEMENTATION RULES

1. **NO external dependencies.** Do not run `bun add` for anything. Use only Bun built-ins and Node.js standard library.
2. **Every function must have JSDoc.** Document params, return types, and behavior.
3. **Error handling everywhere.** Try-catch around file I/O, dynamic imports, and rendering. Never crash the server on a single bad page.
4. **XSS prevention in renderToString.** Always escape user content. Never trust props values.
5. **Use `Bun.file()` for static serving** — it's the fastest way to serve files in Bun.
6. **Use `ReadableStream` for HTML responses** — enables streaming TTFB.
7. **All file paths use `node:path` join/resolve** — never concatenate paths with `/`.
8. **Tests use `bun:test`** — `describe`, `test`/`it`, `expect` from "bun:test".
9. **No console.log in library code** — only in CLI commands. Use proper error types.
10. **Handle Windows paths** — use path.sep aware logic, normalize slashes in route matching.

---

## VERIFICATION CHECKLIST

After implementation, verify:

- [ ] `bun install` succeeds with zero external deps
- [ ] `bun test --recursive packages/` — all tests pass
- [ ] `bun run dev` from root — playground dev server starts
- [ ] Visit http://localhost:3000 — homepage renders with loader data
- [ ] Visit http://localhost:3000/about — about page renders
- [ ] Visit http://localhost:3000/blog/test-post — dynamic route works
- [ ] Visit http://localhost:3000/api/hello — returns JSON
- [ ] Visit http://localhost:3000/nonexistent — 404 page
- [ ] Edit playground/src/pages/index.tsx — HMR updates browser
- [ ] Counter island has `<!--vrx-island:Counter:...-->` markers in HTML
- [ ] `bun run build` from root — dist/ directory created with HTML files
- [ ] No TypeScript errors: `bunx tsc --noEmit`
- [ ] Performance: dev server starts in <200ms
