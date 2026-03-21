# VirexJS Blog Example

A fully functional blog built with VirexJS.

## Features

- SQLite database with `defineTable()`
- Server-rendered pages (zero client JS)
- Dynamic routes (`/blog/[slug]`)
- Like button island (only interactive component)
- API routes (`/api/posts`)
- SEO meta tags via `useHead()`

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
    index.tsx          → Home (post list)
    about.tsx          → About page
    blog/[slug].tsx    → Blog post (dynamic)
  islands/
    LikeButton.tsx     → Interactive like button
  api/
    posts.ts           → REST API (GET/POST)
  db/
    schema.ts          → SQLite table + seed data
  layouts/
    Default.tsx        → Site layout
```

## API

```bash
# List posts
curl http://localhost:3000/api/posts

# Create post
curl -X POST -H "Content-Type: application/json" \
  -d '{"title":"New Post","content":"Hello!","published":true}' \
  http://localhost:3000/api/posts
```
