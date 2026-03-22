# API Reference

All exports available from the `"virexjs"` package.

## Core

| Export | Description |
|--------|-------------|
| `defineConfig(config)` | Define framework configuration with type safety |
| `defineLoader(fn)` | Define a typed data loader function |
| `defineAPIRoute(fn)` | Define a typed API route handler |
| `defineMiddleware(fn)` | Define a middleware function |
| `definePlugin(plugin)` | Define a plugin with lifecycle hooks |
| `defineAction(fn)` | Define a typed form action handler |

## Rendering

| Export | Description |
|--------|-------------|
| `Head` | Component for injecting tags into `<head>` |
| `useHead(options)` | Programmatic head management (title, OG, Twitter) |
| `ErrorBoundary` | Catches render errors, shows fallback UI |
| `JsonLd` | Renders JSON-LD structured data in `<head>` |
| `createBreadcrumbs(base, items)` | Create breadcrumb structured data |
| `createFAQ(items)` | Create FAQ structured data |

## Server & Middleware

| Export | Description |
|--------|-------------|
| `cors(options?)` | CORS middleware |
| `rateLimit(options?)` | Rate limiting middleware |
| `securityHeaders(options?)` | Security headers (CSP, HSTS, etc.) |
| `session(options?)` | Cookie-based session middleware |
| `guard(options)` | Route guard middleware |
| `csrf(options?)` | CSRF protection middleware |
| `bodyLimit(options?)` | Request body size limiter |
| `requestId(options?)` | Unique request ID header |
| `healthCheck(options?)` | Health check endpoint (/health) |
| `gracefulShutdown(server, opts?)` | Graceful server shutdown handler |
| `compress(request, response)` | Gzip compress a response (v0.2) |
| `compressionMiddleware()` | Auto-gzip all text responses (v0.2) |
| `withETag(request, response)` | Add ETag + 304 Not Modified (v0.2) |
| `etagMiddleware()` | Auto-ETag all GET responses (v0.2) |
| `defineParallelLoader(loaders)` | Run multiple data sources concurrently (v0.2) |

## Response Helpers

| Export | Description |
|--------|-------------|
| `redirect(url, status?)` | Redirect response (default 302) |
| `json(data, init?)` | JSON response |
| `html(body, init?)` | HTML response |
| `text(body, init?)` | Plain text response |
| `notFound(message?)` | 404 response |
| `setCookie(response, name, value, opts?)` | Set cookie on response |
| `parseCookies(request)` | Parse cookies from request |
| `actionRedirect(url, status?)` | Redirect from action (default 303) |
| `actionJson(data, init?)` | JSON response from action |
| `parseFormData(request)` | Parse form/JSON body to object |

## Authentication

| Export | Description |
|--------|-------------|
| `createJWT(payload, secret, opts?)` | Create signed JWT (HS256) |
| `verifyJWT(token, secret)` | Verify and decode JWT |
| `decodeJWT(token)` | Decode JWT without verification |
| `JWTError` | JWT error class |

## Validation

| Export | Description |
|--------|-------------|
| `validate(schema, data)` | Validate data against schema |
| `parseBody(request, schema)` | Parse + validate request body |
| `string()` | String field validator |
| `number()` | Number field validator (auto-coerce) |
| `boolean()` | Boolean field validator (auto-coerce) |

Validators are chainable: `.required()`, `.min(n)`, `.max(n)`, `.pattern(regex)`, `.email()`, `.url()`, `.trim()`, `.default(v)`, `.custom(fn)`.

## Internationalization

| Export | Description |
|--------|-------------|
| `createI18n(options)` | Create i18n instance |
| `defineTranslations(translations)` | Type-safe translation definitions |
| `detectLocale(header, locales, default)` | Detect locale from Accept-Language |

## Components

| Export | Description |
|--------|-------------|
| `Link` | `<a>` with optional native prefetch |
| `Image` | `<img>` with lazy loading, responsive |
| `Script` | Smart script loading (defer/async/lazy/idle) |
| `Font` | Google Fonts or custom font optimization |
| `Preload` | `<link rel="preload">` resource hint (v0.2) |
| `Preconnect` | `<link rel="preconnect">` origin hint (v0.2) |
| `DNSPrefetch` | `<link rel="dns-prefetch">` DNS hint (v0.2) |

## Rendering

| Export | Description |
|--------|-------------|
| `generateOGImage(options)` | Dynamic SVG social preview image |
| `renderPageAsync(options)` | Suspense-like async streaming render (v0.2) |
| `cachedRender(key, props, render)` | Memoized component render |
| `useIslandState(props, defaults)` | Island state management hook (v0.2) |
| `route(pattern, params)` | Type-safe URL builder |
| `defineRoute(pattern)` | Typed route builder factory |

## Directives

| Export | Description |
|--------|-------------|
| `serverAction(fn)` | Mark function as server-only |
| `registerAction(name, fn)` | Register RPC action |
| `hasDirective(file, directive)` | Check file directive |
| `isClientComponent(file)` | Check "use client"/"use island" |
| `isCachedPage(file)` | Check "use cache" |
| `withCache(path, ttl, render)` | ISR cache wrapper |

## ISR

| Export | Description |
|--------|-------------|
| `getISRCache(path)` | Get cached response |
| `setISRCache(path, html, ttl)` | Store in cache |
| `invalidateISR(pathOrRegex)` | Invalidate cache entries |
| `getISRStats()` | Cache statistics |

## i18n

| Export | Description |
|--------|-------------|
| `createI18n(options)` | Create i18n instance |
| `defineTranslations(translations)` | Type-safe translation definitions |
| `detectLocale(header, locales, default)` | Detect locale from Accept-Language |
| `i18nRouting(options)` | Locale-based URL routing middleware |
| `setLocaleCookie(response, locale)` | Persist locale preference |

## Draft Mode

| Export | Description |
|--------|-------------|
| `isDraftMode(request)` | Check if preview mode active |
| `enableDraftMode(response)` | Enable CMS preview |
| `disableDraftMode(response)` | Disable preview |

## Utilities

| Export | Description |
|--------|-------------|
| `createCache(options?)` | In-memory TTL cache |
| `createLogger(options?)` | Structured leveled logger |
| `createScheduler()` | Cron-like task scheduler |
| `createInstrumentation()` | Request metrics tracking |
| `loadEnv(mode?, cwd?)` | Load .env files |
| `defineEnv(schema)` | Type-safe env validation |
| `parseEnvFile(content)` | Parse .env file content |
| `parseUpload(request, opts?)` | Multipart file upload parsing |
| `generateAPIDocs(apiDir)` | Auto-generate API docs |
| `renderAPIDocsHTML(docs)` | Render docs as HTML |

## Real-time

| Export | Description |
|--------|-------------|
| `defineWSRoute(route)` | Define WebSocket route handler |
| `createWSServer(options)` | Create WebSocket server |
| `createSSEStream(request?, opts?)` | Create Server-Sent Events stream |

## Testing (`virexjs/testing`)

| Export | Description |
|--------|-------------|
| `renderComponent(component, props)` | Render component to `{ html, head }` |
| `createTestRequest(path, opts?)` | Create mock Request |
| `createTestLoaderContext(params?, opts?)` | Create mock loader context |
| `createTestMiddlewareContext(path?, opts?)` | Create mock middleware context |
| `assertHTML(html)` | Chainable HTML assertion helper |

## Database (`@virexjs/db`)

| Export | Description |
|--------|-------------|
| `getDB(path?)` | Get SQLite database singleton |
| `closeDB()` | Close database connection |
| `defineTable(name, schema)` | Define table with typed CRUD |
| `defineMigration(migration)` | Define database migration |
| `migrate(migrations, path?)` | Apply pending migrations |
| `rollback(migrations, count?, path?)` | Rollback migrations |
| `getMigrationStatus(migrations, path?)` | Get migration status |

## Plugin Hooks

| Hook | When | Return |
|------|------|--------|
| `configResolved(config)` | After config merged | Mutate config |
| `serverCreated(info)` | Server is ready | — |
| `buildStart(config)` | Before production build | — |
| `buildEnd(result)` | After production build | — |
| `transformHTML(html, ctx)` | Before HTML response sent | Modified HTML |
| `middleware()` | Server setup | Middleware function(s) |

## Types

```ts
import type {
  // Core
  PageProps, LoaderContext, MetaContext, APIContext,
  VirexConfig, MetaData, StaticPath,
  // Server
  MiddlewareFn, MiddlewareContext, MiddlewareNext,
  CORSOptions, RateLimitOptions, SecurityOptions, GuardOptions,
  SessionOptions, SessionStore, ShutdownOptions, ShutdownHandle,
  // Plugin
  VirexPlugin, TransformHTMLContext, BuildResult, ServerInfo,
  // Auth
  JWTPayload, JWTOptions,
  // Validation
  ValidationResult, ValidationError, FieldValidator, Schema,
  // i18n
  I18n, Translations, LocaleMap,
  // Real-time
  WSRoute, WSConnection, SSEController,
  // Components
  LinkProps, ImageProps, ScriptProps, FontProps,
  ErrorBoundaryProps, UseHeadOptions, OGImageOptions,
  // Utilities
  Logger, LogLevel, Cache, ActionContext, ActionHandler,
  Scheduler, ScheduledTask, Instrumentation, MetricsStats,
  UploadedFile, UploadResult, UploadOptions,
  APIDocs, APIEndpoint,
  // SEO
  StructuredData, ArticleLD, BreadcrumbLD, FAQLD,
} from "virexjs";
```

## CLI Commands

```
virex create              Interactive project wizard (4 templates)
virex init <name>         Quick project scaffold
virex dev                 Dev server with HMR + widget
virex build               Production SSG build
virex preview             Preview production build
virex generate <type>     Scaffold page/component/api/middleware/island
virex check               Validate project structure and TypeScript (v0.2)
virex info                Show project statistics
```
