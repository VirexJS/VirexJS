# Testing

VirexJS includes built-in test utilities. Import from `virexjs/testing`.

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
import { createTestRequest, createTestLoaderContext } from "virexjs/testing";

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

## HTML Assertions

```ts
import { assertHTML } from "virexjs/testing";

assertHTML(html).contains("h1", "Hello");
assertHTML(html).hasAttribute("a", "href", "/about");
assertHTML(html).notContains("script");
assertHTML(html).containsText("Welcome");
```

## Running Tests

```bash
bun test                        # All tests
bun test packages/router/       # Single package
bun test src/tests/my.test.ts   # Single file
```

VirexJS uses `bun:test` — standard `describe`, `test`, `expect` API.
