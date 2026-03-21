/**
 * Server actions — typed form submission handlers.
 *
 * Define type-safe form actions that run on the server.
 * Similar to Remix/Next.js server actions pattern.
 *
 * Usage:
 *   // src/pages/contact.tsx
 *   import { defineAction } from "virexjs";
 *   import { string, validate } from "virexjs";
 *
 *   export const action = defineAction(async ({ request }) => {
 *     const form = await request.formData();
 *     const data = Object.fromEntries(form);
 *
 *     const result = validate({
 *       name: string().required(),
 *       email: string().required().email(),
 *       message: string().required().min(10),
 *     }, data);
 *
 *     if (!result.success) {
 *       return { errors: result.errors };
 *     }
 *
 *     await sendEmail(result.data);
 *     return { success: true };
 *   });
 */

/** Action context */
export interface ActionContext {
	/** The incoming request (POST/PUT/PATCH/DELETE) */
	request: Request;
	/** URL params if route is dynamic */
	params: Record<string, string>;
	/** Shared middleware context */
	locals: Record<string, unknown>;
}

/** Action result — either success data or redirect */
export type ActionResult<T = Record<string, unknown>> =
	| { data: T; redirect?: undefined }
	| { redirect: string; status?: number; data?: undefined };

/** Action handler function */
export type ActionHandler<T = Record<string, unknown>> = (
	ctx: ActionContext,
) => Promise<T | Response> | T | Response;

/**
 * Define a type-safe server action for form handling.
 *
 * The action runs on POST/PUT/PATCH/DELETE requests.
 * Returns either data (rendered with the page) or a Response (redirect, JSON, etc).
 */
export function defineAction<T extends Record<string, unknown>>(
	handler: ActionHandler<T>,
): ActionHandler<T> {
	return handler;
}

/**
 * Create a redirect response from an action.
 *
 * Usage:
 *   return actionRedirect("/success", 303);
 */
export function actionRedirect(url: string, status: 301 | 302 | 303 | 307 | 308 = 303): Response {
	return new Response(null, {
		status,
		headers: { Location: url },
	});
}

/**
 * Create a JSON response from an action (for API-style form submissions).
 */
export function actionJson<T>(data: T, init?: { status?: number }): Response {
	return new Response(JSON.stringify(data), {
		status: init?.status ?? 200,
		headers: { "Content-Type": "application/json" },
	});
}

/**
 * Parse form data from a request into a plain object.
 *
 * Usage:
 *   const data = await parseFormData(request);
 *   // { name: "Alice", email: "alice@test.com" }
 */
export async function parseFormData(request: Request): Promise<Record<string, string>> {
	const contentType = request.headers.get("Content-Type") ?? "";
	const result: Record<string, string> = {};

	if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
		const formData = await request.formData();
		for (const [key, value] of formData.entries()) {
			if (typeof value === "string") {
				result[key] = value;
			}
		}
	} else if (contentType.includes("application/json")) {
		const json = await request.json();
		if (typeof json === "object" && json !== null) {
			for (const [key, value] of Object.entries(json)) {
				result[key] = String(value);
			}
		}
	}

	return result;
}
