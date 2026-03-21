import { defineAPIRoute } from "virexjs";

export const GET = defineAPIRoute(() => {
	return Response.json({ message: "Hello from VirexJS!", timestamp: Date.now() });
});

export const POST = defineAPIRoute(({ request }) => {
	return Response.json({ received: true }, { status: 201 });
});
