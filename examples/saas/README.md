# VirexJS SaaS Starter

A production-ready SaaS template built with VirexJS.

## Features

- Landing page with hero, features, pricing
- Auth (login/register pages)
- Dashboard with sidebar layout
- Project management (list, create via API)
- Settings page (profile, plan)
- SQLite database with seed data
- Nested layouts (marketing vs dashboard)
- API routes with validation
- Zero client-side JavaScript

## Run

```bash
bun install
bun run dev
```

Open http://localhost:3000

## Structure

```
src/
  pages/
    index.tsx               Landing page (hero + pricing)
    settings.tsx            User settings
    auth/
      login.tsx             Login form
      register.tsx          Registration form
    dashboard/
      _layout.tsx           Dashboard sidebar layout
      index.tsx             Dashboard home (stats)
      projects.tsx          Project list
  api/
    projects.ts             REST API (GET/POST)
  db/
    schema.ts               Users + Projects tables
  layouts/
    Marketing.tsx           Public pages layout
```

## API

```bash
# List projects
curl http://localhost:3000/api/projects

# Create project
curl -X POST -H "Content-Type: application/json" \
  -d '{"name":"New Project","description":"My project"}' \
  http://localhost:3000/api/projects
```
