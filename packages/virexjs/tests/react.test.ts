import { describe, expect, test } from "bun:test";
import React, {
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
	useId,
	useMemo,
	useRef,
	useState,
} from "../src/compat/react";

// The compat shim is primarily tested via compat.test.ts.
// This file tests the default export and module structure.

describe("React compat default export", () => {
	test("default export has all methods", () => {
		expect(React.createElement).toBe(createElement);
		expect(React.Fragment).toBe(Fragment);
		expect(React.isValidElement).toBe(isValidElement);
		expect(React.cloneElement).toBe(cloneElement);
		expect(React.Children).toBe(Children);
		expect(React.memo).toBe(memo);
		expect(React.forwardRef).toBe(forwardRef);
		expect(React.createContext).toBe(createContext);
		expect(React.useContext).toBe(useContext);
		expect(React.useState).toBe(useState);
		expect(React.useRef).toBe(useRef);
		expect(React.useMemo).toBe(useMemo);
		expect(React.useCallback).toBe(useCallback);
		expect(React.useId).toBe(useId);
	});

	test("renderToString is exported", () => {
		expect(typeof renderToString).toBe("function");
	});

	test("resetIdCounter is exported", () => {
		expect(typeof resetIdCounter).toBe("function");
	});
});
