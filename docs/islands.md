# Islands

Islands are interactive components that ship JavaScript to the client. Everything else stays as pure server-rendered HTML.

## Creating an Island

Place a `.tsx` file in `src/islands/` or add a directive at the top:

```tsx
// src/islands/Counter.tsx
"use client";  // or "use island" — both work

interface CounterProps {
  initial?: number;
  count?: number;
  _state?: Record<string, unknown>;
  _rerender?: () => void;
}

export default function Counter(props: CounterProps) {
  const count = props.count ?? props.initial ?? 0;

  // Bootstrap state on first hydration
  if (props._state && props._state.count === undefined) {
    props._state.count = count;
  }

  return (
    <div>
      <button onClick={() => {
        if (props._state && props._rerender) {
          props._state.count = count - 1;
          props._rerender();
        }
      }}>-</button>
      <span>{count}</span>
      <button onClick={() => {
        if (props._state && props._rerender) {
          props._state.count = count + 1;
          props._rerender();
        }
      }}>+</button>
    </div>
  );
}
```

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

## State Pattern

Islands use `_state` + `_rerender` for reactive state:

- `props._state` — mutable state object injected by mount()
- `props._rerender` — function to trigger DOM re-render
- Bootstrap defaults in the component body: `if (props._state && props._state.x === undefined)`

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

## Examples

The playground includes 10 islands:

| Island | State pattern |
|--------|---------------|
| Counter | `_state.count` number |
| Toggle | `_state.open` boolean |
| Tabs | `_state.activeIndex` number |
| ColorPicker | `_state.color` string |
| TodoList | `_state.items` array |
| Timer | `_state.elapsed` + interval |
| Accordion | `_state.openIndex` number |
| LikeButton | `_state.liked` + `_state.count` |
| SearchBox | `_state.query` + DOM input read |
| Modal | `_state.isOpen` boolean |
