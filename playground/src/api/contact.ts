import { defineAPIRoute, json, string, validate } from "virexjs";

const contactSchema = {
	name: string().required("Name is required").min(2, "Name too short").max(50).trim(),
	email: string().required("Email is required").email("Invalid email"),
	message: string().required("Message is required").min(10, "Message too short").max(1000),
};

export const POST = defineAPIRoute(async ({ request }) => {
	const body = await request.json();
	const result = validate(contactSchema, body);

	if (!result.success) {
		return json({ success: false, errors: result.errors }, { status: 400 });
	}

	// In a real app: send email, save to DB, etc.
	return json({
		success: true,
		message: `Thank you ${result.data.name}! We received your message.`,
	});
});
