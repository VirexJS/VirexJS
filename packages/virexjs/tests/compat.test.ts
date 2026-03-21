import { beforeEach, describe, expect, test } from "bun:test";
import {
	Children,
	cloneElement,
	createContext,
	createElement,
	Fragment,
	forwardRef,
	isValidElement,
	memo,
	renderToString,
	resetIdCounter,
	useCallback,
	useContext,
	useEffect,
	useId,
	useLayoutEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from "../src/compat/react";
import type { VNode } from "../src/render/jsx";

beforeEach(() => {
	resetIdCounter();
});

// ─── createElement / Fragment ───────────────────────────────────────────────

describe("createElement", () => {
	test("creates a VElement for HTML tags", () => {
		const el = createElement("div", { className: "test" }, "hello");
		expect(el).toEqual({
			type: "div",
			props: { className: "test", children: ["hello"] },
		});
	});

	test("creates element with no props", () => {
		const el = createElement("span", null, "text");
		expect(el).toEqual({
			type: "span",
			props: { children: ["text"] },
		});
	});

	test("handles function components", () => {
		function Greeting(props: Record<string, unknown>): VNode {
			return createElement("h1", null, `Hello ${props.name}`);
		}
		const result = createElement(Greeting, { name: "World" });
		const html = renderToString(result);
		expect(html).toBe("<h1>Hello World</h1>");
	});

	test("Fragment returns children without wrapper", () => {
		const result = createElement(Fragment as unknown as string, null, "a", "b", "c");
		expect(Array.isArray(result)).toBe(true);
		expect(result).toEqual(["a", "b", "c"]);
	});
});

// ─── renderToString ─────────────────────────────────────────────────────────

describe("renderToString via compat", () => {
	test("renders nested elements", () => {
		const vnode = createElement(
			"div",
			{ className: "container" },
			createElement("h1", null, "Title"),
			createElement("p", null, "Body"),
		);
		const html = renderToString(vnode);
		expect(html).toBe('<div class="container"><h1>Title</h1><p>Body</p></div>');
	});

	test("escapes text content", () => {
		const vnode = createElement("p", null, "<script>alert('xss')</script>");
		const html = renderToString(vnode);
		expect(html).toContain("&lt;script&gt;");
		expect(html).not.toContain("<script>");
	});
});

// ─── isValidElement ─────────────────────────────────────────────────────────

describe("isValidElement", () => {
	test("returns true for VElements", () => {
		const el = createElement("div", null);
		expect(isValidElement(el)).toBe(true);
	});

	test("returns false for strings", () => {
		expect(isValidElement("hello")).toBe(false);
	});

	test("returns false for numbers", () => {
		expect(isValidElement(42)).toBe(false);
	});

	test("returns false for null", () => {
		expect(isValidElement(null)).toBe(false);
	});

	test("returns false for arrays", () => {
		expect(isValidElement([createElement("div", null)])).toBe(false);
	});
});

// ─── cloneElement ───────────────────────────────────────────────────────────

describe("cloneElement", () => {
	test("clones with merged props", () => {
		const original = { type: "div", props: { className: "a", id: "1" } };
		const cloned = cloneElement(original, { className: "b" });
		expect(cloned.props.className).toBe("b");
		expect(cloned.props.id).toBe("1");
		expect(cloned.type).toBe("div");
	});

	test("does not mutate original", () => {
		const original = { type: "span", props: { title: "test" } };
		cloneElement(original, { title: "changed" });
		expect(original.props.title).toBe("test");
	});

	test("replaces children when provided", () => {
		const original = { type: "p", props: { children: "old" } };
		const cloned = cloneElement(original, {}, "new");
		expect(cloned.props.children).toBe("new");
	});
});

// ─── Children ───────────────────────────────────────────────────────────────

describe("Children", () => {
	test("map iterates over children", () => {
		const result = Children.map(["a", "b", "c"], (child, i) => `${i}:${child}`);
		expect(result).toEqual(["0:a", "1:b", "2:c"]);
	});

	test("map handles single child", () => {
		const result = Children.map("only", (child) => child);
		expect(result).toEqual(["only"]);
	});

	test("map handles null", () => {
		const result = Children.map(null, (child) => child);
		expect(result).toEqual([]);
	});

	test("forEach iterates", () => {
		const collected: unknown[] = [];
		Children.forEach(["x", "y"], (child) => collected.push(child));
		expect(collected).toEqual(["x", "y"]);
	});

	test("count returns correct number", () => {
		expect(Children.count(["a", "b", "c"])).toBe(3);
		expect(Children.count("single")).toBe(1);
		expect(Children.count(null)).toBe(0);
	});

	test("toArray flattens children", () => {
		expect(Children.toArray(["a", "b"])).toEqual(["a", "b"]);
		expect(Children.toArray("single")).toEqual(["single"]);
	});

	test("only returns the single child", () => {
		expect(Children.only("alone")).toBe("alone");
	});

	test("only throws for multiple children", () => {
		expect(() => Children.only(["a", "b"])).toThrow("exactly one child");
	});
});

// ─── memo ───────────────────────────────────────────────────────────────────

describe("memo", () => {
	test("returns the same component", () => {
		function MyComponent(props: Record<string, unknown>): VNode {
			return createElement("div", null, props.text as string);
		}
		const memoized = memo(MyComponent);
		expect(memoized).toBe(MyComponent);
	});

	test("memoized component renders correctly", () => {
		function Card(props: Record<string, unknown>): VNode {
			return createElement("div", { className: "card" }, props.title as string);
		}
		const MemoCard = memo(Card);
		const html = renderToString(
			createElement(MemoCard as (props: Record<string, unknown>) => VNode, { title: "Hello" }),
		);
		expect(html).toBe('<div class="card">Hello</div>');
	});
});

// ─── forwardRef ─────────────────────────────────────────────────────────────

describe("forwardRef", () => {
	test("calls render with null ref", () => {
		let receivedRef: unknown = "not-set";
		const MyInput = forwardRef((props: Record<string, unknown>, ref) => {
			receivedRef = ref;
			return createElement("input", { type: props.type as string });
		});
		renderToString(
			createElement(MyInput as unknown as (props: Record<string, unknown>) => VNode, {
				type: "text",
			}),
		);
		expect(receivedRef).toBeNull();
	});
});

// ─── createContext / useContext ──────────────────────────────────────────────

describe("createContext / useContext", () => {
	test("returns default value without Provider", () => {
		const ThemeCtx = createContext("light");
		expect(useContext(ThemeCtx)).toBe("light");
	});

	test("Provider sets context value", () => {
		const ThemeCtx = createContext("light");
		let captured = "";

		function Inner(): VNode {
			captured = useContext(ThemeCtx);
			return createElement("span", null, captured);
		}

		const tree = createElement(
			ThemeCtx.Provider as unknown as (props: Record<string, unknown>) => VNode,
			{ value: "dark" },
			createElement(Inner, null),
		);
		renderToString(tree);
		expect(captured).toBe("dark");
	});

	test("nested Providers override correctly", () => {
		const Ctx = createContext(0);
		const values: number[] = [];

		function Reader(): VNode {
			values.push(useContext(Ctx));
			return createElement("span", null, String(useContext(Ctx)));
		}

		const tree = createElement(
			Ctx.Provider as unknown as (props: Record<string, unknown>) => VNode,
			{ value: 1 },
			createElement(Reader, null),
			createElement(
				Ctx.Provider as unknown as (props: Record<string, unknown>) => VNode,
				{ value: 2 },
				createElement(Reader, null),
			),
		);
		renderToString(tree);
		expect(values).toEqual([1, 2]);
	});
});

// ─── Hooks (SSR stubs) ─────────────────────────────────────────────────────

describe("SSR hooks", () => {
	test("useState returns initial value", () => {
		const [value, setter] = useState(42);
		expect(value).toBe(42);
		expect(typeof setter).toBe("function");
		// setter is a no-op
		setter(100);
	});

	test("useState with lazy initializer", () => {
		const [value] = useState(() => "lazy");
		expect(value).toBe("lazy");
	});

	test("useReducer returns initial state", () => {
		const reducer = (state: number, action: { type: string }) =>
			action.type === "inc" ? state + 1 : state;
		const [state, dispatch] = useReducer(reducer, 0);
		expect(state).toBe(0);
		expect(typeof dispatch).toBe("function");
		// dispatch is a no-op
		dispatch({ type: "inc" });
	});

	test("useEffect is a no-op", () => {
		// Should not throw
		useEffect(() => {
			throw new Error("should not execute");
		});
	});

	test("useLayoutEffect is a no-op", () => {
		useLayoutEffect(() => {
			throw new Error("should not execute");
		});
	});

	test("useRef returns ref object", () => {
		const ref = useRef<number>(0);
		expect(ref).toEqual({ current: 0 });
		ref.current = 5;
		expect(ref.current).toBe(5);
	});

	test("useRef with null", () => {
		const ref = useRef<HTMLElement | null>(null);
		expect(ref.current).toBeNull();
	});

	test("useMemo returns computed value", () => {
		const value = useMemo(() => 2 + 2);
		expect(value).toBe(4);
	});

	test("useCallback returns the callback", () => {
		const fn = () => "hello";
		const memoized = useCallback(fn);
		expect(memoized).toBe(fn);
	});

	test("useId returns unique IDs", () => {
		const id1 = useId();
		const id2 = useId();
		expect(id1).toBe(":vrx-0:");
		expect(id2).toBe(":vrx-1:");
		expect(id1).not.toBe(id2);
	});
});

// ─── Integration: component with hooks ──────────────────────────────────────

describe("integration", () => {
	test("component using hooks renders correctly", () => {
		function Counter(): VNode {
			const [count] = useState(0);
			const id = useId();
			const doubled = useMemo(() => count * 2);

			return createElement(
				"div",
				{ id },
				createElement("span", { className: "count" }, String(count)),
				createElement("span", { className: "doubled" }, String(doubled)),
			);
		}

		const html = renderToString(createElement(Counter, null));
		expect(html).toContain('id=":vrx-0:"');
		expect(html).toContain('<span class="count">0</span>');
		expect(html).toContain('<span class="doubled">0</span>');
	});
});
