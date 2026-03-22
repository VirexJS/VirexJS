import { afterEach, describe, expect, test } from "bun:test";
import {
	emitIslandEvent,
	getShared,
	onIslandEvent,
	resetSharedStore,
	setShared,
	subscribeShared,
	useSharedStore,
} from "../src/render/island-store";

afterEach(() => {
	resetSharedStore();
});

describe("shared state", () => {
	test("get returns undefined for missing key", () => {
		expect(getShared("missing")).toBeUndefined();
	});

	test("set and get a value", () => {
		setShared("count", 42);
		expect(getShared("count")).toBe(42);
	});

	test("set overwrites previous value", () => {
		setShared("x", 1);
		setShared("x", 2);
		expect(getShared("x")).toBe(2);
	});

	test("supports complex values", () => {
		setShared("cart", { items: ["a", "b"], total: 100 });
		const cart = getShared("cart") as { items: string[]; total: number };
		expect(cart.items).toEqual(["a", "b"]);
		expect(cart.total).toBe(100);
	});
});

describe("subscribeShared", () => {
	test("subscriber is called on set", () => {
		let called = 0;
		subscribeShared("count", () => called++);
		setShared("count", 1);
		expect(called).toBe(1);
	});

	test("multiple subscribers all called", () => {
		let a = 0;
		let b = 0;
		subscribeShared("count", () => a++);
		subscribeShared("count", () => b++);
		setShared("count", 1);
		expect(a).toBe(1);
		expect(b).toBe(1);
	});

	test("subscriber not called for different key", () => {
		let called = 0;
		subscribeShared("x", () => called++);
		setShared("y", 1);
		expect(called).toBe(0);
	});

	test("unsubscribe stops notifications", () => {
		let called = 0;
		const unsub = subscribeShared("count", () => called++);
		setShared("count", 1);
		expect(called).toBe(1);

		unsub();
		setShared("count", 2);
		expect(called).toBe(1); // not called again
	});

	test("subscriber called on every set", () => {
		let called = 0;
		subscribeShared("count", () => called++);
		setShared("count", 1);
		setShared("count", 2);
		setShared("count", 3);
		expect(called).toBe(3);
	});
});

describe("island events", () => {
	test("emit triggers listener", () => {
		let received: unknown = null;
		onIslandEvent("cart:add", (data) => {
			received = data;
		});
		emitIslandEvent("cart:add", { itemId: "abc" });
		expect(received).toEqual({ itemId: "abc" });
	});

	test("multiple listeners all called", () => {
		const results: unknown[] = [];
		onIslandEvent("notify", (d) => results.push(`a:${d}`));
		onIslandEvent("notify", (d) => results.push(`b:${d}`));
		emitIslandEvent("notify", "hello");
		expect(results).toEqual(["a:hello", "b:hello"]);
	});

	test("unsubscribe stops events", () => {
		let called = 0;
		const unsub = onIslandEvent("tick", () => called++);
		emitIslandEvent("tick");
		expect(called).toBe(1);

		unsub();
		emitIslandEvent("tick");
		expect(called).toBe(1);
	});

	test("emit with no listeners does not throw", () => {
		expect(() => emitIslandEvent("no-listeners", {})).not.toThrow();
	});

	test("different events are independent", () => {
		let aCount = 0;
		let bCount = 0;
		onIslandEvent("a", () => aCount++);
		onIslandEvent("b", () => bCount++);
		emitIslandEvent("a");
		expect(aCount).toBe(1);
		expect(bCount).toBe(0);
	});
});

describe("useSharedStore", () => {
	test("get reads from shared state", () => {
		setShared("user.name", "Alice");
		const store = useSharedStore({});
		expect(store.get("user.name")).toBe("Alice");
	});

	test("set updates shared state", () => {
		const store = useSharedStore({});
		store.set("theme", "dark");
		expect(getShared("theme")).toBe("dark");
	});

	test("subscribe auto-rerenders island on change", () => {
		let renderCount = 0;
		const store = useSharedStore({ _rerender: () => renderCount++ });
		store.subscribe("cart.count");

		setShared("cart.count", 1);
		expect(renderCount).toBe(1);

		setShared("cart.count", 2);
		expect(renderCount).toBe(2);
	});

	test("emit sends event to other islands", () => {
		let received: unknown = null;
		onIslandEvent("add-to-cart", (d) => {
			received = d;
		});

		const store = useSharedStore({});
		store.emit("add-to-cart", { id: 1 });
		expect(received).toEqual({ id: 1 });
	});

	test("on listens for events", () => {
		let received: unknown = null;
		const store = useSharedStore({});
		store.on("notification", (d) => {
			received = d;
		});

		emitIslandEvent("notification", "New message");
		expect(received).toBe("New message");
	});

	test("works without _rerender (server-side)", () => {
		const store = useSharedStore({});
		// subscribe should not throw without _rerender
		expect(() => store.subscribe("key")).not.toThrow();
		store.set("key", "value");
		expect(store.get("key")).toBe("value");
	});
});

describe("cross-island communication scenario", () => {
	test("CartButton updates, CartBadge re-renders", () => {
		let badgeRenders = 0;
		let buttonRenders = 0;

		// CartBadge island
		const badgeStore = useSharedStore({ _rerender: () => badgeRenders++ });
		badgeStore.subscribe("cart.count");

		// CartButton island
		const buttonStore = useSharedStore({ _rerender: () => buttonRenders++ });
		buttonStore.subscribe("cart.count");

		// Initial state
		expect(badgeStore.get("cart.count")).toBeUndefined();

		// User clicks "Add to Cart" in CartButton
		buttonStore.set("cart.count", 1);

		// Both islands re-rendered
		expect(badgeRenders).toBe(1);
		expect(buttonRenders).toBe(1);
		expect(badgeStore.get("cart.count")).toBe(1);

		// Add another item
		buttonStore.set("cart.count", 2);
		expect(badgeRenders).toBe(2);
		expect(badgeStore.get("cart.count")).toBe(2);
	});

	test("event bus: sidebar toggle affects header", () => {
		let headerState = "closed";

		// Header island listens for sidebar toggle
		const headerStore = useSharedStore({});
		headerStore.on("sidebar:toggle", (data) => {
			headerState = (data as { open: boolean }).open ? "open" : "closed";
		});

		// Sidebar island emits toggle
		const sidebarStore = useSharedStore({});
		sidebarStore.emit("sidebar:toggle", { open: true });

		expect(headerState).toBe("open");

		sidebarStore.emit("sidebar:toggle", { open: false });
		expect(headerState).toBe("closed");
	});

	test("three islands sharing theme", () => {
		let r0 = 0;
		let r1 = 0;
		let r2 = 0;

		const store0 = useSharedStore({ _rerender: () => r0++ });
		const store1 = useSharedStore({ _rerender: () => r1++ });
		const store2 = useSharedStore({ _rerender: () => r2++ });

		// All subscribe to theme
		store0.subscribe("theme");
		store1.subscribe("theme");
		store2.subscribe("theme");

		// One island changes theme
		store0.set("theme", "dark");

		// All three re-render
		expect(r0).toBe(1);
		expect(r1).toBe(1);
		expect(r2).toBe(1);
		expect(store2.get("theme")).toBe("dark");
	});
});
