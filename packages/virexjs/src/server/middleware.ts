export interface MiddlewareContext {
	request: Request;
	params: Record<string, string>;
	locals: Record<string, unknown>;
}

export type MiddlewareNext = () => Promise<Response>;
export type MiddlewareFn = (
	ctx: MiddlewareContext,
	next: MiddlewareNext,
) => Promise<Response | undefined>;

/**
 * Helper to define a middleware function with full type inference.
 * Usage:
 *   export default defineMiddleware(async (ctx, next) => { ... });
 */
export function defineMiddleware(fn: MiddlewareFn): MiddlewareFn {
	return fn;
}

/**
 * Run a chain of middleware functions.
 * If any middleware returns a Response, short-circuit.
 * Otherwise, call next() to proceed to the next middleware or final handler.
 */
export async function runMiddleware(
	middlewares: MiddlewareFn[],
	ctx: MiddlewareContext,
	finalHandler: () => Promise<Response>,
): Promise<Response> {
	let index = 0;
	let nextCalled = false;

	async function next(): Promise<Response> {
		nextCalled = true;
		if (index >= middlewares.length) {
			return finalHandler();
		}

		const middleware = middlewares[index]!;
		index++;
		nextCalled = false;

		const result = await middleware(ctx, next);
		if (result instanceof Response) {
			return result;
		}

		// Only fall through to finalHandler if next() was NOT already called
		// to prevent double execution
		if (!nextCalled) {
			return finalHandler();
		}

		// next() was called but middleware returned undefined — use next's result
		return finalHandler();
	}

	return next();
}
