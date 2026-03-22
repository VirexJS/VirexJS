# Islands

Islands are interactive components that ship JavaScript to the client. Everything else stays as pure server-rendered HTML.

## Creating an Island

Place a `.tsx` file in `src/islands/` with a directive at the top:

```tsx
// src/islands/Counter.tsx
"use island";  // or "use client" — both work

import { useIslandState } from "virexjs";

export default function Counter(props: Record<string, unknown>) {
  const { get, set } = useIslandState(props, { count: 0 });

  return (
    <div>
      <button onClick={() => set("count", get("count") - 1)}>-</button>
      <span>{get("count")}</span>
      <button onClick={() => set("count", get("count") + 1)}>+</button>
    </div>
  );
}
```

## useIslandState Hook

The `useIslandState()` hook eliminates boilerplate in island components:

```tsx
const { get, set, update, hydrated } = useIslandState(props, defaults);
```

| Method | Description |
|--------|-------------|
| `get(key)` | Read current value of a state field |
| `set(key, value)` | Set a field and trigger rerender |
| `update(partial)` | Merge partial state and trigger rerender |
| `hydrated` | `true` when running on the client |

**Before (manual):**
```tsx
export default function Counter(props) {
  const count = props.count ?? 0;
  if (props._state && props._state.count === undefined) {
    props._state.count = count;
  }
  // onClick: props._state.count = ...; props._rerender();
}
```

**After (with hook):**
```tsx
export default function Counter(props) {
  const { get, set } = useIslandState(props, { count: 0 });
  // onClick: set("count", get("count") + 1)
}
```

~40% less code per island.

## How It Works

1. **Server**: Component renders as static HTML with marker comments
2. **Client**: Hydration runtime discovers markers, loads island JS
3. **Mount**: `mount()` function takes over the DOM with interactive behavior

```html
<!-- Server output -->
<!--vrx-island:Counter:{"initial":0}:visible-->
<div data-vrx-island="Counter">
  <button>-</button><span>0</span><button>+</button>
</div>
<!--/vrx-island-->
```

## Hydration Strategies

Set in `virex.config.ts`:

```ts
export default defineConfig({
  islands: {
    hydration: "visible",  // default
  },
});
```

| Strategy | When hydrated |
|----------|--------------|
| `visible` | Element enters viewport (IntersectionObserver) |
| `interaction` | First click/hover/focus on the element |
| `idle` | Browser idle time (requestIdleCallback) |
| `immediate` | As soon as JS loads |

## Using Islands in Pages

```tsx
// src/pages/index.tsx
import Counter from "../islands/Counter";
import Toggle from "../islands/Toggle";

export default function Home() {
  return (
    <div>
      <h1>Welcome</h1>
      <Counter initial={0} />
      <Toggle label="Show more" />
    </div>
  );
}
```

The server renders the initial HTML. Islands are hydrated lazily on the client.

## Multi-field State

For islands with multiple state fields, use `update()`:

```tsx
"use island";
import { useIslandState } from "virexjs";

export default function Form(props: Record<string, unknown>) {
  const { get, update } = useIslandState(props, {
    name: "",
    email: "",
    submitted: false,
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      update({ submitted: true });
    }}>
      <input value={get("name")} onInput={(e) => update({ name: e.target.value })} />
      <input value={get("email")} onInput={(e) => update({ email: e.target.value })} />
      <button type="submit">Submit</button>
      {get("submitted") && <p>Thanks, {get("name")}!</p>}
    </form>
  );
}
```

## Server vs Client Rendering

Islands render on both server and client:

```tsx
"use island";
import { useIslandState } from "virexjs";

export default function Greeting(props: Record<string, unknown>) {
  const { hydrated } = useIslandState(props, {});

  return (
    <div>
      {hydrated
        ? <p>Interactive! (client-side)</p>
        : <p>Static HTML (server-rendered)</p>
      }
    </div>
  );
}
```

## Examples

The playground includes 10 islands:

| Island | State | Description |
|--------|-------|-------------|
| Counter | `count: number` | Increment/decrement |
| Toggle | `open: boolean` | Show/hide content |
| Tabs | `activeIndex: number` | Tab switching |
| ColorPicker | `color: string` | Live color preview |
| TodoList | `items: string[]` | Add/remove items |
| Timer | `elapsed: number` | Stopwatch with interval |
| Accordion | `openIndex: number` | Expandable sections |
| LikeButton | `liked: boolean, count: number` | Like with animation |
| SearchBox | `query: string` | Live search filter |
| Modal | `isOpen: boolean` | Modal dialog |
