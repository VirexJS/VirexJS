import { defineAPIRoute, json } from "virexjs";

export const GET = defineAPIRoute(() => {
	return json({ message: "Hello from VirexJS!", timestamp: Date.now() });
});

export const POST = defineAPIRoute(async ({ request }) => {
	const body = await request.json();
	return json({ received: true, echo: body }, { status: 201 });
});
