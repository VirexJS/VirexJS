import type { MiddlewareContext, MiddlewareNext } from "virexjs/server/middleware";

/** Sample logger middleware — logs request method and URL */
export async function logger(ctx: MiddlewareContext, next: MiddlewareNext) {
	const start = performance.now();
	const response = await next();
	const elapsed = (performance.now() - start).toFixed(1);
	console.log(`${ctx.request.method} ${new URL(ctx.request.url).pathname} — ${elapsed}ms`);
	return response;
}
