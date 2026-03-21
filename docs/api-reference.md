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

## Utilities

| Export | Description |
|--------|-------------|
| `createCache(options?)` | In-memory TTL cache |
| `createLogger(options?)` | Structured leveled logger |
| `loadEnv(mode?, cwd?)` | Load .env files |
| `parseEnvFile(content)` | Parse .env file content |

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
  PageProps, LoaderContext, MetaContext, APIContext,
  VirexConfig, MetaData, StaticPath,
  MiddlewareFn, MiddlewareContext, MiddlewareNext,
  VirexPlugin, TransformHTMLContext, BuildResult, ServerInfo,
  WSRoute, WSConnection, SSEController,
  JWTPayload, JWTOptions, SessionOptions, SessionStore,
  CORSOptions, RateLimitOptions, SecurityOptions, GuardOptions,
  ValidationResult, ValidationError, FieldValidator, Schema,
  I18n, Translations, LocaleMap,
  Logger, LogLevel, Cache,
  ActionContext, ActionHandler,
  UseHeadOptions, ErrorBoundaryProps,
  StructuredData, ArticleLD, BreadcrumbLD, FAQLD,
} from "virexjs";
```
