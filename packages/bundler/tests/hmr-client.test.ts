import { describe, expect, test } from "bun:test";
import { generateHMRClientScript } from "../src/hmr-client";

describe("generateHMRClientScript", () => {
	test("returns a non-empty string", () => {
		const script = generateHMRClientScript(3001);
		expect(typeof script).toBe("string");
		expect(script.length).toBeGreaterThan(100);
	});

	test("contains WebSocket connection to the given port", () => {
		const script = generateHMRClientScript(4567);
		expect(script).toContain("ws://localhost:4567");
	});

	test("contains smart reload function", () => {
		const script = generateHMRClientScript(3001);
		expect(script).toContain("smartReload");
		expect(script).toContain("DOMParser");
	});

	test("contains CSS hot swap function", () => {
		const script = generateHMRClientScript(3001);
		expect(script).toContain("updateCSS");
		expect(script).toContain("stylesheet");
	});

	test("contains error overlay function", () => {
		const script = generateHMRClientScript(3001);
		expect(script).toContain("showErrorOverlay");
		expect(script).toContain("vrx-error-overlay");
	});

	test("contains dev widget", () => {
		const script = generateHMRClientScript(3001);
		expect(script).toContain("vrx-dev-widget");
		expect(script).toContain("VirexJS");
	});

	test("handles ping/pong messages", () => {
		const script = generateHMRClientScript(3001);
		expect(script).toContain("ping");
		expect(script).toContain("pong");
	});

	test("handles full-reload message type", () => {
		const script = generateHMRClientScript(3001);
		expect(script).toContain("full-reload");
	});

	test("handles css-update message type", () => {
		const script = generateHMRClientScript(3001);
		expect(script).toContain("css-update");
	});

	test("uses safe DOM APIs (no innerHTML)", () => {
		const script = generateHMRClientScript(3001);
		expect(script).not.toContain("innerHTML");
		expect(script).toContain("createElement");
		expect(script).toContain("textContent");
	});

	test("includes auto-reconnect logic", () => {
		const script = generateHMRClientScript(3001);
		expect(script).toContain("retryDelay");
		expect(script).toContain("onclose");
	});

	test("wraps in IIFE for no global pollution", () => {
		const script = generateHMRClientScript(3001);
		expect(script).toContain("(function()");
		expect(script).toContain("})()");
	});

	test("different ports produce different scripts", () => {
		const a = generateHMRClientScript(3001);
		const b = generateHMRClientScript(4002);
		expect(a).not.toBe(b);
		expect(a).toContain("3001");
		expect(b).toContain("4002");
	});
});
