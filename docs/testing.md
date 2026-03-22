# Testing

VirexJS includes built-in test utilities and uses `bun:test` — 1098 tests across 100 files.

## Render Components

```ts
import { renderComponent } from "virexjs/testing";

const { html, head } = renderComponent(MyPage, {
  data: { title: "Test" },
  params: {},
  url: new URL("http://localhost/"),
});

expect(html).toContain("Test");
expect(head).toContain("<title>");
```

## Mock Requests

```ts
import { createTestRequest } from "virexjs/testing";

// GET request
const req = createTestRequest("/api/users");

// POST with JSON body
const req = createTestRequest("/api/users", {
  method: "POST",
  body: { name: "Alice" },
  headers: { Authorization: "Bearer token" },
});

// With query params
const req = createTestRequest("/search", {
  query: { q: "test", page: "2" },
});
```

## Mock Loader Context

```ts
import { createTestLoaderContext } from "virexjs/testing";

const ctx = createTestLoaderContext(
  { slug: "hello-world" },  // params
  { path: "/blog/hello-world" },
);

const data = await loader(ctx);
expect(data.title).toBe("Hello World");
```

## Mock Middleware Context

```ts
import { createTestMiddlewareContext } from "virexjs/testing";

const ctx = createTestMiddlewareContext("/admin", {
  headers: { Authorization: "Bearer valid-token" },
});

const response = await authMiddleware(ctx, () =>
  Promise.resolve(new Response("OK"))
);
expect(response.status).toBe(200);
```

## HTML Assertions

```ts
import { assertHTML } from "virexjs/testing";

assertHTML(html).contains("h1", "Hello");
assertHTML(html).hasAttribute("a", "href", "/about");
assertHTML(html).notContains("script");
assertHTML(html).containsText("Welcome");
```

## Testing Islands

```ts
import { describe, expect, test } from "bun:test";
import { useIslandState } from "virexjs";

describe("Counter island", () => {
  test("initializes with defaults", () => {
    const props = {};
    const { get } = useIslandState(props, { count: 0 });
    expect(get("count")).toBe(0);
  });

  test("set updates state and triggers rerender", () => {
    let rendered = 0;
    const state: Record<string, unknown> = {};
    const props = { _state: state, _rerender: () => rendered++ };
    const { set } = useIslandState(props, { count: 0 });
    set("count", 5);
    expect(state.count).toBe(5);
    expect(rendered).toBe(1);
  });
});
```

## Testing Shared Store

```ts
import { getShared, resetSharedStore, setShared, subscribeShared } from "virexjs";

afterEach(() => resetSharedStore());

test("subscribers notified on set", () => {
  let called = 0;
  subscribeShared("key", () => called++);
  setShared("key", "value");
  expect(called).toBe(1);
});
```

## Testing Middleware

```ts
import { cors } from "virexjs";

test("CORS adds headers", async () => {
  const middleware = cors({ origin: "https://example.com" });
  const ctx = { request: new Request("http://localhost/") };
  const response = await middleware(ctx, () =>
    Promise.resolve(new Response("OK"))
  );
  expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://example.com");
});
```

## Running Tests

```bash
bun test                        # All tests (1098)
bun test packages/router/       # Single package
bun test packages/virexjs/tests/jwt.test.ts  # Single file
```

## Validate Project

```bash
virex check    # Validates structure, pages, islands, API routes, TypeScript
```

Output:
```
  Checking VirexJS project...

  ✓ virex.config.ts loaded successfully
  ✓ Required directory exists: src/pages
  ✓ Found 12 page(s)
  ✓ Index page exists
  ✓ Found 3 island(s) (3 with directive)
  ✓ Found 4 API route(s) (4 valid)
  ✓ TypeScript: no errors

  8 checks in 450ms — 8 passed, 0 warnings, 0 errors
```
