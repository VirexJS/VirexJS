import { describe, test, expect } from "bun:test";
import { generateHydrationRuntime } from "../src/hydration-runtime";

describe("generateHydrationRuntime", () => {
	test("returns a JavaScript string", () => {
		const script = generateHydrationRuntime("/_virex/islands/");
		expect(typeof script).toBe("string");
		expect(script.length).toBeGreaterThan(100);
	});

	test("includes the correct base path", () => {
		const script = generateHydrationRuntime("/assets/islands/");
		expect(script).toContain('"/assets/islands/"');
	});

	test("contains discoverIslands function", () => {
		const script = generateHydrationRuntime("/");
		expect(script).toContain("discoverIslands");
	});

	test("contains scheduleHydration function", () => {
		const script = generateHydrationRuntime("/");
		expect(script).toContain("scheduleHydration");
	});

	test("handles all 4 hydration strategies", () => {
		const script = generateHydrationRuntime("/");
		expect(script).toContain('"immediate"');
		expect(script).toContain('"visible"');
		expect(script).toContain('"interaction"');
		expect(script).toContain('"idle"');
	});

	test("uses IntersectionObserver for visible strategy", () => {
		const script = generateHydrationRuntime("/");
		expect(script).toContain("IntersectionObserver");
	});

	test("uses requestIdleCallback for idle strategy", () => {
		const script = generateHydrationRuntime("/");
		expect(script).toContain("requestIdleCallback");
	});

	test("parses vrx-island comment markers", () => {
		const script = generateHydrationRuntime("/");
		expect(script).toContain("vrx-island:");
	});

	test("loads island modules dynamically", () => {
		const script = generateHydrationRuntime("/_virex/islands/");
		expect(script).toContain("import(url)");
	});

	test("sets data-vrx-hydrated attribute", () => {
		const script = generateHydrationRuntime("/");
		expect(script).toContain("data-vrx-hydrated");
	});

	test("uses DOMContentLoaded for boot", () => {
		const script = generateHydrationRuntime("/");
		expect(script).toContain("DOMContentLoaded");
	});

	test("is a self-executing function", () => {
		const script = generateHydrationRuntime("/");
		expect(script.trim()).toMatch(/^\(function\(\)/);
		expect(script.trim()).toMatch(/\)\(\);$/);
	});
});
