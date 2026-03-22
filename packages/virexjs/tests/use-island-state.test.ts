import { describe, expect, test } from "bun:test";
import { useIslandState } from "../src/render/use-island-state";

describe("useIslandState", () => {
	test("returns defaults on server (no _state)", () => {
		const props = { initial: 5 };
		const { get, hydrated } = useIslandState(props, { count: 0 });
		expect(get("count")).toBe(0);
		expect(hydrated).toBe(false);
	});

	test("bootstraps defaults into _state", () => {
		const state: Record<string, unknown> = {};
		const props = { _state: state, _rerender: () => {} };
		useIslandState(props, { count: 0, open: true });
		expect(state.count).toBe(0);
		expect(state.open).toBe(true);
	});

	test("uses prop value over default", () => {
		const state: Record<string, unknown> = {};
		const props = { count: 5, _state: state, _rerender: () => {} };
		useIslandState(props, { count: 0 });
		expect(state.count).toBe(5);
	});

	test("get reads from state", () => {
		const state: Record<string, unknown> = { count: 42 };
		const props = { _state: state, _rerender: () => {} };
		const { get } = useIslandState(props, { count: 0 });
		expect(get("count")).toBe(42);
	});

	test("set updates state and calls rerender", () => {
		let rendered = 0;
		const state: Record<string, unknown> = {};
		const props = {
			_state: state,
			_rerender: () => {
				rendered++;
			},
		};
		const { set } = useIslandState(props, { count: 0 });
		set("count", 10);
		expect(state.count).toBe(10);
		expect(rendered).toBe(1);
	});

	test("update merges partial state", () => {
		let rendered = 0;
		const state: Record<string, unknown> = {};
		const props = {
			_state: state,
			_rerender: () => {
				rendered++;
			},
		};
		const { update } = useIslandState(props, { x: 0, y: 0 });
		update({ x: 5, y: 10 });
		expect(state.x).toBe(5);
		expect(state.y).toBe(10);
		expect(rendered).toBe(1);
	});

	test("hydrated is true when _state exists", () => {
		const props = { _state: {}, _rerender: () => {} };
		const { hydrated } = useIslandState(props, {});
		expect(hydrated).toBe(true);
	});

	test("set is no-op on server", () => {
		const props = {};
		const { set } = useIslandState(props, { count: 0 });
		set("count", 99); // should not throw
	});
});
