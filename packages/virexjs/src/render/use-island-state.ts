/**
 * useIslandState() — eliminates boilerplate in island components.
 *
 * Before (manual):
 *   const count = props.count ?? 0;
 *   if (props._state && props._state.count === undefined) {
 *     props._state.count = 0;
 *   }
 *
 * After (with helper):
 *   const { get, set } = useIslandState(props, { count: 0 });
 *   const count = get("count");
 *   // onClick: set("count", count + 1)
 *
 * Usage:
 *   "use client";
 *   import { useIslandState } from "virexjs";
 *
 *   export default function Counter(props) {
 *     const { get, set } = useIslandState(props, { count: 0 });
 *     return (
 *       <button onClick={() => set("count", get("count") + 1)}>
 *         {get("count")}
 *       </button>
 *     );
 *   }
 */

interface IslandProps {
	_state?: Record<string, unknown>;
	_rerender?: () => void;
	[key: string]: unknown;
}

interface IslandStateAPI<T extends Record<string, unknown>> {
	/** Get current value of a state field */
	get: <K extends keyof T>(key: K) => T[K];
	/** Set a state field and trigger rerender */
	set: <K extends keyof T>(key: K, value: T[K]) => void;
	/** Update state with partial object and rerender */
	update: (partial: Partial<T>) => void;
	/** Whether the island is hydrated (client-side) */
	hydrated: boolean;
}

/**
 * Initialize island state with defaults and return a simple API.
 * Automatically bootstraps state on first hydration call.
 */
export function useIslandState<T extends Record<string, unknown>>(
	props: IslandProps,
	defaults: T,
): IslandStateAPI<T> {
	const hydrated = !!props._state;

	// Bootstrap defaults into state on first call
	if (props._state) {
		for (const [key, defaultValue] of Object.entries(defaults)) {
			if (props._state[key] === undefined) {
				props._state[key] = props[key] ?? defaultValue;
			}
		}
	}

	return {
		get<K extends keyof T>(key: K): T[K] {
			if (props._state && key in props._state) {
				return props._state[key as string] as T[K];
			}
			return (props[key as string] as T[K]) ?? defaults[key];
		},

		set<K extends keyof T>(key: K, value: T[K]): void {
			if (props._state && props._rerender) {
				props._state[key as string] = value;
				props._rerender();
			}
		},

		update(partial: Partial<T>): void {
			if (props._state && props._rerender) {
				Object.assign(props._state, partial);
				props._rerender();
			}
		},

		hydrated,
	};
}
