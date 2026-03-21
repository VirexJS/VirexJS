# Deployment

## Docker

```bash
# Build
docker build -t virexjs-app .

# Run
docker run -p 3000:3000 virexjs-app
```

The included `Dockerfile` uses multi-stage builds:
1. **deps** — installs dependencies
2. **builder** — runs `virex build` for SSG
3. **runner** — serves the built output

## Manual Deployment

```bash
# 1. Build
cd your-project
bun run build

# 2. Preview locally
bun run preview

# 3. Deploy dist/ to any static host
# Or run the server:
NODE_ENV=production bun run dev
```

## Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=3000
DATABASE_URL=sqlite:./data/app.db
JWT_SECRET=your-secret-here
```

Use `defineEnv()` for type-safe validation:

```ts
import { defineEnv } from "virexjs";

const env = defineEnv({
  PORT: { type: "number", default: 3000 },
  DATABASE_URL: { type: "string", required: true },
  JWT_SECRET: { type: "string", required: true },
  DEBUG: { type: "boolean", default: false },
});
```

## Production Checklist

- [ ] Set `NODE_ENV=production` (hides error details)
- [ ] Set `JWT_SECRET` to a strong random value
- [ ] Enable `secure: true` on session cookies (default)
- [ ] Configure CORS origins for your domain
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Run behind a reverse proxy (nginx/Caddy) for TLS

## Platforms

### Fly.io

```toml
# fly.toml
app = "my-virexjs-app"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 3000
  force_https = true

[[vm]]
  size = "shared-cpu-1x"
  memory = "256mb"
```

```bash
fly launch
fly deploy
```

### Railway

Connect your Git repo. Railway auto-detects the Dockerfile.

### VPS (Ubuntu)

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Clone and build
git clone https://github.com/your/app.git
cd app
bun install
NODE_ENV=production bun run build

# Run with systemd
sudo tee /etc/systemd/system/virexjs.service << 'EOF'
[Unit]
Description=VirexJS App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDir=/opt/app
ExecStart=/home/user/.bun/bin/bun run preview
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable virexjs
sudo systemctl start virexjs
```
