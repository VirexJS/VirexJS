/**
 * React compatibility shim for VirexJS.
 *
 * Allows using React-style APIs with VirexJS's server-side rendering engine.
 * Provides createElement, Fragment, hooks (SSR stubs), Children utilities,
 * memo, forwardRef, createContext/useContext, and isValidElement.
 *
 * Usage:
 *   import { useState, useEffect, createContext } from "virexjs/compat/react";
 */

import type { VElement, VNode } from "../render/jsx";
import { Fragment, h, renderToString } from "../render/jsx";

// ─── Core ───────────────────────────────────────────────────────────────────

/** React.createElement compatibility — delegates to VirexJS's h() */
export const createElement = h;

/** Render a VNode tree to string (React.renderToString equivalent) */
export { Fragment, renderToString };

// ─── isValidElement ─────────────────────────────────────────────────────────

/** Check if a value is a valid VirexJS element */
export function isValidElement(value: unknown): value is VElement {
	return (
		typeof value === "object" &&
		value !== null &&
		!Array.isArray(value) &&
		"type" in value &&
		"props" in value
	);
}

// ─── cloneElement ───────────────────────────────────────────────────────────

/** Clone a VElement with merged props */
export function cloneElement(
	element: VElement,
	props?: Record<string, unknown>,
	...children: unknown[]
): VElement {
	const mergedProps = { ...element.props, ...props };
	if (children.length > 0) {
		mergedProps.children = children.length === 1 ? children[0] : children;
	}
	return { type: element.type, props: mergedProps };
}

// ─── Children utilities ─────────────────────────────────────────────────────

function childrenToArray(children: unknown): unknown[] {
	if (children === null || children === undefined) return [];
	if (Array.isArray(children)) return children.flat();
	return [children];
}

export const Children = {
	/** Map over children with a callback */
	map<T>(children: unknown, fn: (child: unknown, index: number) => T): T[] {
		return childrenToArray(children).map(fn);
	},

	/** Iterate over children */
	forEach(children: unknown, fn: (child: unknown, index: number) => void): void {
		childrenToArray(children).forEach(fn);
	},

	/** Count the number of children */
	count(children: unknown): number {
		return childrenToArray(children).length;
	},

	/** Convert children to a flat array */
	toArray(children: unknown): unknown[] {
		return childrenToArray(children);
	},

	/** Assert and return the only child */
	only(children: unknown): unknown {
		const arr = childrenToArray(children);
		if (arr.length !== 1) {
			throw new Error("Children.only expected exactly one child");
		}
		return arr[0];
	},
};

// ─── memo / forwardRef ──────────────────────────────────────────────────────

/**
 * React.memo compatibility — returns component as-is.
 * Server-side rendering doesn't benefit from memoization.
 */
export function memo<T extends (props: Record<string, unknown>) => VNode>(component: T): T {
	return component;
}

/**
 * React.forwardRef compatibility — calls the render function with props and null ref.
 * Refs are not used in server-side rendering.
 */
export function forwardRef<P extends Record<string, unknown>>(
	render: (props: P, ref: null) => VNode,
): (props: P) => VNode {
	const wrapped = (props: P): VNode => render(props, null);
	Object.defineProperty(wrapped, "name", { value: render.name || "ForwardRef" });
	return wrapped;
}

// ─── Context ────────────────────────────────────────────────────────────────

/** Context object compatible with React's createContext/useContext pattern */
export interface Context<T> {
	/** Provider component that sets the context value */
	Provider: (props: { value: T; children?: unknown }) => VNode;
	/** Get the current context value */
	_currentValue: T;
}

/** Symbol used to identify context provider types in h() */
export const CONTEXT_PROVIDER = Symbol.for("vrx.context.provider");

/**
 * Create a server-side context.
 * The Provider uses a deferred rendering mechanism so that context values
 * are available to child components during renderToString.
 *
 * Usage:
 *   const ThemeCtx = createContext("light");
 *   <ThemeCtx.Provider value="dark">...</ThemeCtx.Provider>
 *   const theme = useContext(ThemeCtx);
 */
export function createContext<T>(defaultValue: T): Context<T> {
	const ctx: Context<T> = {
		_currentValue: defaultValue,
		Provider: null as unknown as (props: { value: T; children?: unknown }) => VNode,
	};

	// Create a callable provider that carries context metadata.
	// h() detects the __vrx_provider__ symbol and defers child evaluation
	// so that context is set before children render.
	const provider = (props: { value: T; children?: unknown }): VNode => {
		return props.children as VNode;
	};
	(provider as unknown as Record<string, unknown>).__vrx_provider__ = true;
	(provider as unknown as Record<string, unknown>).__vrx_ctx__ = ctx;

	ctx.Provider = provider as (props: { value: T; children?: unknown }) => VNode;

	return ctx;
}

/** Read the current value of a context */
export function useContext<T>(context: Context<T>): T {
	return context._currentValue;
}

// ─── SSR Hook Stubs ─────────────────────────────────────────────────────────
// These hooks provide meaningful behavior during server-side rendering.
// useState returns the initial value, effects are no-ops, refs return objects.

/** SSR stub: returns [initialState, no-op setter] */
export function useState<T>(initial: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void] {
	const value = typeof initial === "function" ? (initial as () => T)() : initial;
	return [value, () => {}];
}

/** SSR stub: useReducer returns [initialState, no-op dispatch] */
export function useReducer<S, A>(
	_reducer: (state: S, action: A) => S,
	initialState: S,
): [S, (action: A) => void] {
	return [initialState, () => {}];
}

/** SSR stub: useEffect is a no-op (effects don't run on server) */
export function useEffect(_effect: () => undefined | (() => void), _deps?: unknown[]): void {}

/** SSR stub: useLayoutEffect is a no-op */
export function useLayoutEffect(_effect: () => undefined | (() => void), _deps?: unknown[]): void {}

/** SSR stub: useRef returns a ref object with .current */
export function useRef<T>(initial: T): { current: T } {
	return { current: initial };
}

/** SSR stub: useMemo returns the computed value immediately */
export function useMemo<T>(factory: () => T, _deps?: unknown[]): T {
	return factory();
}

/** SSR stub: useCallback returns the callback as-is */
export function useCallback<T extends (...args: unknown[]) => unknown>(
	callback: T,
	_deps?: unknown[],
): T {
	return callback;
}

/** SSR stub: useId returns a deterministic ID */
let idCounter = 0;
export function useId(): string {
	return `:vrx-${idCounter++}:`;
}

/** Reset useId counter (for testing) */
export function resetIdCounter(): void {
	idCounter = 0;
}

// ─── Default export (React-like namespace) ──────────────────────────────────

const React = {
	createElement,
	Fragment,
	isValidElement,
	cloneElement,
	Children,
	memo,
	forwardRef,
	createContext,
	useContext,
	useState,
	useReducer,
	useEffect,
	useLayoutEffect,
	useRef,
	useMemo,
	useCallback,
	useId,
};

export default React;
