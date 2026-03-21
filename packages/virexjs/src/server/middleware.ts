export interface MiddlewareContext {
	request: Request;
	params: Record<string, string>;
	locals: Record<string, unknown>;
}

export type MiddlewareNext = () => Promise<Response>;
export type MiddlewareFn = (ctx: MiddlewareContext, next: MiddlewareNext) => Promise<Response | void>;

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

	async function next(): Promise<Response> {
		if (index >= middlewares.length) {
			return finalHandler();
		}

		const middleware = middlewares[index]!;
		index++;

		const result = await middleware(ctx, next);
		if (result instanceof Response) {
			return result;
		}

		// If middleware didn't return a Response and didn't call next,
		// we still need to proceed
		return finalHandler();
	}

	return next();
}
