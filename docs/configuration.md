# Configuration

Create `virex.config.ts` in your project root:

```ts
import { defineConfig } from "virexjs";

export default defineConfig({
  port: 3000,
  hostname: "localhost",
  srcDir: "src",
  outDir: "dist",
  publicDir: "public",
  render: "server",          // "server" | "static" | "hybrid"
  router: {
    trailingSlash: false,
    basePath: "",             // e.g. "/app"
  },
  islands: {
    hydration: "visible",    // "visible" | "interaction" | "idle" | "immediate"
  },
  css: {
    engine: "passthrough",   // "passthrough" | "tailwind" | "virex" | "both"
  },
  build: {
    target: "bun",           // "bun" | "static"
    minify: true,
    sourceMaps: false,
  },
  dev: {
    open: false,
    hmr: true,
    hmrPort: 3001,
  },
  plugins: [],
  // URL management (like Next.js)
  redirects: [
    { source: "/old-page", destination: "/new-page", permanent: true },
  ],
  rewrites: [
    { source: "/api/v1/:path", destination: "/api/:path" },
  ],
  headers: [
    { source: "/(.*)", headers: [{ key: "X-Frame-Options", value: "DENY" }] },
  ],
});
```

All options are optional — defaults are used for anything not specified.

## Tailwind CSS

Enable Tailwind with one config change:

```ts
export default defineConfig({
  css: { engine: "tailwind" },
});
```

```bash
bun add -d tailwindcss
```

VirexJS will:
- Auto-generate `tailwind.config.js` if missing
- Auto-generate `src/globals.css` with `@tailwind` directives if missing
- Build CSS via Tailwind CLI
- Hot-swap CSS in dev mode via HMR

## TypeScript Path Aliases

`virex init` automatically configures `@/` aliases in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

Works in both runtime (Bun resolves it) and island bundling.

## Environment Variables

```ts
import { loadEnv } from "virexjs";

// Loads in order (later overrides earlier):
// .env → .env.production → .env.local → .env.production.local
const env = loadEnv("production");
```

### .env file format

```bash
# Comments
DATABASE_URL=sqlite:./data.db
PORT=3000
SECRET="my secret value"

# Variable expansion
BASE_URL=https://example.com
API_URL=${BASE_URL}/api
```

### Type-safe env validation

```ts
import { defineEnv } from "virexjs";

const env = defineEnv({
  PORT: { type: "number", default: 3000 },
  DATABASE_URL: { type: "string", required: true },
  JWT_SECRET: { type: "string", required: true },
  DEBUG: { type: "boolean", default: false },
});
```

## Plugins

```ts
import { defineConfig, definePlugin } from "virexjs";

const analytics = definePlugin({
  name: "analytics",
  configResolved(config) {
    console.log(`Analytics on port ${config.port}`);
  },
  serverCreated(info) {
    console.log(`Tracking ${info.routeCount} routes`);
  },
  transformHTML(html, ctx) {
    return html.replace("</body>", `<script>track("${ctx.pathname}")</script></body>`);
  },
  middleware: () => async (ctx, next) => {
    console.log(`${ctx.request.method} ${new URL(ctx.request.url).pathname}`);
    return next();
  },
});

export default defineConfig({
  plugins: [analytics],
});
```

### Plugin hooks

| Hook | When | Return |
|------|------|--------|
| `configResolved(config)` | After config merged | Mutate config |
| `serverCreated(info)` | Server is ready | — |
| `buildStart(config)` | Before production build | — |
| `buildEnd(result)` | After production build | — |
| `transformHTML(html, ctx)` | Before HTML response sent | Modified HTML |
| `middleware()` | Server setup | Middleware function(s) |
