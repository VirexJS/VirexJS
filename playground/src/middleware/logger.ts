import { defineMiddleware } from "virexjs";

/** Sample logger middleware — logs request method, URL, and response time */
export default defineMiddleware(async (ctx, next) => {
	const start = performance.now();
	const response = await next();
	const elapsed = (performance.now() - start).toFixed(1);
	console.log(`${ctx.request.method} ${new URL(ctx.request.url).pathname} — ${elapsed}ms`);
	return response;
});
