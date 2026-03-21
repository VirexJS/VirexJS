import { flushHeadTags, resetHeadCollector } from "../render/head";
import type { VNode } from "../render/jsx";
import { renderToString } from "../render/jsx";

/**
 * VirexJS test utilities.
 *
 * Helpers for testing VirexJS components, loaders, and middleware
 * in unit/integration tests.
 */

/**
 * Render a component to HTML string for testing.
 * Automatically resets the head collector.
 *
 * Usage:
 *   import { renderComponent } from "virexjs/testing";
 *   const { html, head } = renderComponent(MyPage, { data: { title: "Test" } });
 *   expect(html).toContain("Test");
 *   expect(head).toContain("<title>");
 */
export function renderComponent<P extends Record<string, unknown>>(
	component: (props: P) => VNode,
	props: P,
): { html: string; head: string } {
	resetHeadCollector();
	const vnode = component(props);
	const html = renderToString(vnode);
	const head = flushHeadTags();
	return { html, head };
}

/**
 * Create a mock Request for testing loaders and middleware.
 *
 * Usage:
 *   const req = createTestRequest("/api/users", { method: "POST", body: { name: "Test" } });
 */
export function createTestRequest(
	path: string,
	options?: {
		method?: string;
		headers?: Record<string, string>;
		body?: unknown;
		query?: Record<string, string>;
	},
): Request {
	const { method = "GET", headers = {}, body, query } = options ?? {};

	let url = `http://localhost${path}`;
	if (query) {
		const params = new URLSearchParams(query);
		url += `?${params.toString()}`;
	}

	const reqHeaders = new Headers(headers);
	const init: RequestInit = { method, headers: reqHeaders };

	if (body !== undefined && method !== "GET" && method !== "HEAD") {
		if (typeof body === "string") {
			init.body = body;
		} else {
			init.body = JSON.stringify(body);
			if (!reqHeaders.has("Content-Type")) {
				reqHeaders.set("Content-Type", "application/json");
			}
		}
	}

	return new Request(url, init);
}

/**
 * Create a mock LoaderContext for testing loader functions.
 *
 * Usage:
 *   const ctx = createTestLoaderContext({ slug: "hello" });
 *   const data = await loader(ctx);
 */
export function createTestLoaderContext(
	params: Record<string, string> = {},
	options?: {
		method?: string;
		headers?: Record<string, string>;
		path?: string;
	},
): {
	params: Record<string, string>;
	request: Request;
	headers: Headers;
} {
	const path = options?.path ?? "/";
	const request = createTestRequest(path, {
		method: options?.method,
		headers: options?.headers,
	});
	return {
		params,
		request,
		headers: request.headers,
	};
}

/**
 * Create a mock MiddlewareContext for testing middleware functions.
 *
 * Usage:
 *   const ctx = createTestMiddlewareContext("/api/test", { method: "POST" });
 */
export function createTestMiddlewareContext(
	path?: string,
	options?: {
		method?: string;
		headers?: Record<string, string>;
		params?: Record<string, string>;
		locals?: Record<string, unknown>;
	},
): {
	request: Request;
	params: Record<string, string>;
	locals: Record<string, unknown>;
} {
	return {
		request: createTestRequest(path ?? "/", {
			method: options?.method,
			headers: options?.headers,
		}),
		params: options?.params ?? {},
		locals: options?.locals ?? {},
	};
}

/**
 * Assert that an HTML string contains expected elements.
 * Returns a chainable assertion helper.
 *
 * Usage:
 *   const assert = assertHTML(html);
 *   assert.contains("h1", "Hello");
 *   assert.hasAttribute("a", "href", "/about");
 *   assert.notContains("script");
 */
export function assertHTML(html: string) {
	return {
		/** Assert HTML contains a tag with optional text content */
		contains(tag: string, text?: string): void {
			if (text !== undefined) {
				const pattern = new RegExp(`<${tag}[^>]*>[^<]*${escapeRegex(text)}`);
				if (!pattern.test(html)) {
					throw new Error(`Expected <${tag}> containing "${text}" in HTML`);
				}
			} else {
				if (!html.includes(`<${tag}`)) {
					throw new Error(`Expected <${tag}> in HTML`);
				}
			}
		},

		/** Assert HTML does not contain a tag */
		notContains(tag: string): void {
			if (html.includes(`<${tag}`)) {
				throw new Error(`Expected no <${tag}> in HTML`);
			}
		},

		/** Assert an element has a specific attribute value */
		hasAttribute(tag: string, attr: string, value: string): void {
			const pattern = new RegExp(`<${tag}[^>]*${attr}=["']?${escapeRegex(value)}`);
			if (!pattern.test(html)) {
				throw new Error(`Expected <${tag} ${attr}="${value}"> in HTML`);
			}
		},

		/** Assert HTML contains text (anywhere) */
		containsText(text: string): void {
			if (!html.includes(text)) {
				throw new Error(`Expected "${text}" in HTML`);
			}
		},

		/** Assert HTML does not contain text */
		notContainsText(text: string): void {
			if (html.includes(text)) {
				throw new Error(`Expected "${text}" NOT in HTML`);
			}
		},
	};
}

function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
