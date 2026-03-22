# Deployment

## GitHub Pages (Static)

VirexJS can build static sites and deploy to GitHub Pages:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
```

## Docker

```bash
docker build -t virexjs-app .
docker run -p 3000:3000 virexjs-app
```

### Dockerfile

```dockerfile
FROM oven/bun:latest AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM oven/bun:latest AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN NODE_ENV=production bun run build

FROM oven/bun:latest
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/virex.config.ts ./
EXPOSE 3000
CMD ["bun", "run", "preview"]
```

### Docker Compose

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

## Manual / VPS

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Clone and build
git clone https://github.com/your/app.git
cd app && bun install
NODE_ENV=production bun run build

# Run with systemd
sudo tee /etc/systemd/system/virexjs.service << 'EOF'
[Unit]
Description=VirexJS App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/app
ExecStart=/home/user/.bun/bin/bun run preview
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable virexjs && sudo systemctl start virexjs
```

## Fly.io

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
fly launch && fly deploy
```

## Railway

Connect your Git repo — Railway auto-detects the Dockerfile.

## Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=3000
DATABASE_URL=sqlite:./data/app.db
JWT_SECRET=your-secret-here
```

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `JWT_SECRET` to a strong random value
- [ ] Enable `secure: true` on session cookies
- [ ] Configure CORS origins for your domain
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Enable compression middleware
- [ ] Run behind a reverse proxy (nginx/Caddy) for TLS
- [ ] Run `virex check` to validate project
