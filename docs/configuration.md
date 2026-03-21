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
});
```

All options are optional — defaults are used for anything not specified.

## Environment Variables

```ts
import { loadEnv } from "virexjs";

// Loads in order (later overrides earlier):
// .env → .env.production → .env.local → .env.production.local
const env = loadEnv("production");

// Variables also set on process.env (won't override existing)
console.log(process.env.DATABASE_URL);
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

# Escape sequences in double quotes
MULTILINE="line1\nline2"
```

## Plugins

```ts
import { defineConfig, definePlugin } from "virexjs";

const analytics = definePlugin({
  name: "analytics",
  transformHTML(html, ctx) {
    return html.replace("</body>", `<script>track("${ctx.pathname}")</script></body>`);
  },
  serverCreated(info) {
    console.log(`Analytics loaded (${info.routeCount} routes)`);
  },
});

export default defineConfig({
  plugins: [analytics],
});
```
