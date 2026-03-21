# Contributing to VirexJS

## Setup

```bash
git clone https://github.com/virex-js/virexjs.git
cd virexjs
bun install
```

## Development

```bash
bun test                # Run all tests (must pass)
bunx tsc --noEmit       # TypeScript check (must have 0 errors)
bun run lint            # Biome lint
bun run dev             # Start playground dev server
bun run check           # Run all checks (test + tsc + lint)
```

## Code Style

- TypeScript strict mode, no `any`
- Biome: tabs, double quotes, semicolons, 100 char line width
- JSDoc on all exported functions
- Use `node:path` for file path operations
- No `console.log` in library code (only CLI)

## Testing

Every source file must have a corresponding test file. Run `bun test` before submitting.

```bash
bun test                        # All tests
bun test packages/router/       # Single package
bun test packages/virexjs/tests/jwt.test.ts  # Single file
```

## Project Structure

```
packages/
  virexjs/     # Core framework
  router/      # File-based routing
  bundler/     # Build pipeline, HMR
  db/          # SQLite ORM
playground/    # Demo app
docs/          # Documentation
```

## Pull Requests

1. Fork and create a branch
2. Make changes with tests
3. Run `bun run check` (must pass)
4. Submit PR against `main`

## Zero Dependencies Policy

VirexJS has zero external npm dependencies. Everything is built on Bun's native APIs. Do not add external packages.
