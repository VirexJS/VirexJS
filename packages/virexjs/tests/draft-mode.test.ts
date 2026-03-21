import { describe, expect, test } from "bun:test";
import { disableDraftMode, enableDraftMode, isDraftMode } from "../src/server/draft-mode";

describe("draftMode", () => {
	test("isDraftMode returns false without cookie", () => {
		const req = new Request("http://localhost/");
		expect(isDraftMode(req)).toBe(false);
	});

	test("isDraftMode returns true with draft cookie", () => {
		const req = new Request("http://localhost/", {
			headers: { Cookie: "vrx_draft=vrx-draft-mode-token" },
		});
		expect(isDraftMode(req)).toBe(true);
	});

	test("enableDraftMode sets cookie", () => {
		const res = new Response("ok");
		enableDraftMode(res);
		expect(res.headers.get("Set-Cookie")).toContain("vrx_draft=");
	});

	test("disableDraftMode clears cookie", () => {
		const res = new Response("ok");
		disableDraftMode(res);
		expect(res.headers.get("Set-Cookie")).toContain("Max-Age=0");
	});
});
