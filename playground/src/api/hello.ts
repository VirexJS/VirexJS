export function GET() {
	return Response.json({ message: "Hello from VirexJS!", timestamp: Date.now() });
}

export function POST({ request }: { request: Request }) {
	return Response.json({ received: true }, { status: 201 });
}
