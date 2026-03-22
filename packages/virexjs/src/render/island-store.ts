/**
 * Shared Island Store — cross-island communication.
 *
 * Islands are independent by default. This store enables:
 * 1. Shared state between islands (pub/sub reactive)
 * 2. Event bus for island-to-island messaging
 *
 * Usage in islands:
 *
 *   "use island";
 *   import { useSharedStore } from "virexjs";
 *
 *   export default function CartButton(props) {
 *     const { get, set, subscribe } = useSharedStore(props);
 *
 *     // Read shared state
 *     const count = get("cart.count") ?? 0;
 *
 *     // Update shared state — ALL subscribed islands re-render
 *     const addToCart = () => set("cart.count", count + 1);
 *
 *     return <button onClick={addToCart}>Cart ({count})</button>;
 *   }
 *
 *   // In another island:
 *   export default function CartBadge(props) {
 *     const { get } = useSharedStore(props);
 *     return <span>{get("cart.count") ?? 0}</span>;
 *   }
 *
 * Both islands react to the same "cart.count" — when CartButton
 * updates it, CartBadge re-renders automatically.
 */

/** Global shared state (lives on window in the browser) */
const sharedState: Record<string, unknown> = {};

/** Subscribers: key → set of rerender callbacks */
const subscribers = new Map<string, Set<() => void>>();

/** Event listeners: eventName → set of callbacks */
const eventListeners = new Map<string, Set<(data: unknown) => void>>();

/**
 * Get a value from the shared store.
 */
export function getShared(key: string): unknown {
	return sharedState[key];
}

/**
 * Set a value in the shared store and notify all subscribers.
 */
export function setShared(key: string, value: unknown): void {
	sharedState[key] = value;
	const subs = subscribers.get(key);
	if (subs) {
		for (const rerender of subs) {
			rerender();
		}
	}
}

/**
 * Subscribe to changes on a shared key.
 * Returns an unsubscribe function.
 */
export function subscribeShared(key: string, callback: () => void): () => void {
	let subs = subscribers.get(key);
	if (!subs) {
		subs = new Set();
		subscribers.set(key, subs);
	}
	subs.add(callback);
	return () => {
		subs!.delete(callback);
		if (subs!.size === 0) subscribers.delete(key);
	};
}

/**
 * Emit an event to all listening islands.
 */
export function emitIslandEvent(event: string, data?: unknown): void {
	const listeners = eventListeners.get(event);
	if (listeners) {
		for (const fn of listeners) {
			fn(data);
		}
	}
}

/**
 * Listen for events from other islands.
 * Returns an unsubscribe function.
 */
export function onIslandEvent(event: string, callback: (data: unknown) => void): () => void {
	let listeners = eventListeners.get(event);
	if (!listeners) {
		listeners = new Set();
		eventListeners.set(event, listeners);
	}
	listeners.add(callback);
	return () => {
		listeners!.delete(callback);
		if (listeners!.size === 0) eventListeners.delete(event);
	};
}

interface SharedStoreAPI {
	/** Get a shared value by key */
	get: (key: string) => unknown;
	/** Set a shared value — all subscribed islands re-render */
	set: (key: string, value: unknown) => void;
	/** Subscribe this island to a key — auto re-renders on change */
	subscribe: (key: string) => void;
	/** Emit an event to other islands */
	emit: (event: string, data?: unknown) => void;
	/** Listen for events from other islands */
	on: (event: string, callback: (data: unknown) => void) => void;
}

interface IslandProps {
	_rerender?: () => void;
	[key: string]: unknown;
}

/**
 * Hook for cross-island communication.
 * Call in any island to access the shared store and event bus.
 */
export function useSharedStore(props: IslandProps): SharedStoreAPI {
	const rerender = props._rerender;

	return {
		get(key: string): unknown {
			return getShared(key);
		},

		set(key: string, value: unknown): void {
			setShared(key, value);
		},

		subscribe(key: string): void {
			if (rerender) {
				subscribeShared(key, rerender);
			}
		},

		emit(event: string, data?: unknown): void {
			emitIslandEvent(event, data);
		},

		on(event: string, callback: (data: unknown) => void): void {
			onIslandEvent(event, callback);
		},
	};
}

/**
 * Reset shared store (for testing).
 */
export function resetSharedStore(): void {
	for (const key of Object.keys(sharedState)) {
		delete sharedState[key];
	}
	subscribers.clear();
	eventListeners.clear();
}
