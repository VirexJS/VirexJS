# Middleware & Auth

## Custom Middleware

Files in `src/middleware/` are auto-loaded:

```ts
// src/middleware/logger.ts
import { defineMiddleware } from "virexjs";

export default defineMiddleware(async (ctx, next) => {
  const start = performance.now();
  const response = await next();
  console.log(`${ctx.request.method} ${new URL(ctx.request.url).pathname} — ${(performance.now() - start).toFixed(1)}ms`);
  return response;
});
```

## Built-in Middleware

### CORS

```ts
import { cors } from "virexjs";

// Allow all origins
export default cors();

// Specific origins
export default cors({
  origin: ["https://myapp.com", "https://admin.myapp.com"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  maxAge: 86400,
});

// Dynamic origin check
export default cors({
  origin: (origin) => origin.endsWith(".myapp.com"),
});
```

### Rate Limiting

```ts
import { rateLimit } from "virexjs";

// 100 requests per minute
export default rateLimit({ max: 100, windowMs: 60_000 });

// API-key based limiting
export default rateLimit({
  max: 10,
  windowMs: 60_000,
  keyGenerator: (req) => req.headers.get("X-API-Key") ?? "anon",
});
```

Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After` (on 429).

### Security Headers

```ts
import { securityHeaders } from "virexjs";

// All defaults (CSP, HSTS, X-Frame-Options, etc.)
export default securityHeaders();

// Custom CSP
export default securityHeaders({
  contentSecurityPolicy: "default-src 'self'; img-src *; script-src 'self' 'unsafe-inline'",
  permissionsPolicy: "camera=(), microphone=()",
});
```

Default headers: Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, Referrer-Policy, X-XSS-Protection, Cross-Origin-Opener-Policy.

## Route Guards

Protect routes based on conditions:

```ts
import { guard } from "virexjs";

// Protect /admin/* routes
export default guard({
  match: "/admin",
  check: (ctx) => !!ctx.request.headers.get("Authorization"),
  onDenied: () => new Response(null, { status: 302, headers: { Location: "/login" } }),
});

// Multiple paths
export default guard({
  match: ["/dashboard", "/settings", "/profile"],
  check: (ctx) => ctx.locals.isAuthenticated === true,
});

// Regex pattern
export default guard({
  match: /^\/api\//,
  check: async (ctx) => {
    const token = ctx.request.headers.get("Authorization")?.replace("Bearer ", "");
    return token ? await verifyToken(token) : false;
  },
});
```

## JWT Authentication

```ts
import { createJWT, verifyJWT, JWTError } from "virexjs";

// Create a token
const token = await createJWT(
  { userId: "123", role: "admin" },
  process.env.JWT_SECRET!,
  { expiresIn: 3600, issuer: "myapp" },
);

// Verify a token
try {
  const payload = await verifyJWT(token, process.env.JWT_SECRET!);
  console.log(payload.userId); // "123"
} catch (err) {
  if (err instanceof JWTError) {
    // "Token expired", "Invalid signature", etc.
  }
}
```

Algorithm: HS256 (HMAC-SHA256) via Web Crypto API. Timing-safe signature comparison.

## Sessions

```ts
import { session } from "virexjs";

// src/middleware/session.ts
export default session({
  cookieName: "vrx.sid",
  maxAge: 86400,       // 24 hours
  httpOnly: true,
  secure: true,
  sameSite: "Lax",
});

// In loaders/API routes — access via ctx.locals.session
export async function loader(ctx) {
  const userId = ctx.locals.session.get("userId");
  ctx.locals.session.set("lastVisit", Date.now());
  // ctx.locals.session.destroy() to logout
}
```

## CSRF Protection

```ts
import { csrf } from "virexjs";

// src/middleware/csrf.ts
export default csrf();

// Skip CSRF for webhooks
export default csrf({ ignorePaths: ["/api/webhook"] });
```

The token is available at `ctx.locals.csrfToken`. Include it in forms:
```html
<input type="hidden" name="_csrf" value={ctx.locals.csrfToken} />
```

## Body Size Limiter

```ts
import { bodyLimit } from "virexjs";

// Limit to 1MB (default)
export default bodyLimit();

// Limit to 100KB
export default bodyLimit({ maxSize: 102_400, message: "Request too large" });
```

## Health Check

```ts
import { healthCheck } from "virexjs";

export default healthCheck({
  path: "/health",
  checks: {
    database: async () => { await db.query("SELECT 1"); return true; },
    cache: () => cache.size >= 0,
  },
});
```

Returns `200 { status: "healthy" }` or `503 { status: "unhealthy" }` with per-check timing.

## Request ID

```ts
import { requestId } from "virexjs";
export default requestId();
// Sets X-Request-ID header and ctx.locals.requestId
```

## Graceful Shutdown

```ts
import { gracefulShutdown } from "virexjs";

const { server } = createServer(config);
gracefulShutdown(server, {
  timeout: 10_000,
  onShutdown: async () => {
    await db.close();
    console.log("Cleanup complete");
  },
});
```
