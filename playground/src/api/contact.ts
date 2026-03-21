import { defineAPIRoute, json, parseFormData, string, validate } from "virexjs";

const contactSchema = {
	name: string().required("Name is required").min(2, "Name too short").max(50).trim(),
	email: string().required("Email is required").email("Invalid email"),
	message: string().required("Message is required").min(10, "Message too short").max(1000),
};

export const POST = defineAPIRoute(async ({ request }) => {
	// Accept both JSON and form-encoded data
	const data = await parseFormData(request);
	const result = validate(contactSchema, data);

	if (!result.success) {
		// Return HTML page with errors for form submissions
		const contentType = request.headers.get("Content-Type") ?? "";
		if (contentType.includes("application/json")) {
			return json({ success: false, errors: result.errors }, { status: 400 });
		}
		// For HTML form: show error page
		const errorList = result.errors.map((e) => `<li>${e.field}: ${e.message}</li>`).join("");
		return new Response(
			`<!DOCTYPE html><html><head><title>Validation Error</title></head><body style="font-family:system-ui;max-width:500px;margin:40px auto;padding:0 16px">
			<h1 style="color:#dc2626">Validation Failed</h1>
			<ul style="color:#666">${errorList}</ul>
			<a href="/contact" style="color:#0066cc">Go back</a>
			</body></html>`,
			{ status: 400, headers: { "Content-Type": "text/html" } },
		);
	}

	// For HTML form: show success page
	const contentType = request.headers.get("Content-Type") ?? "";
	if (!contentType.includes("application/json")) {
		return new Response(
			`<!DOCTYPE html><html><head><title>Success</title></head><body style="font-family:system-ui;max-width:500px;margin:40px auto;padding:0 16px;text-align:center">
			<h1 style="color:#16a34a">Message Sent!</h1>
			<p style="color:#666">Thank you ${result.data.name}! We received your message.</p>
			<a href="/" style="color:#0066cc">Back to home</a>
			</body></html>`,
			{ headers: { "Content-Type": "text/html" } },
		);
	}

	return json({
		success: true,
		message: `Thank you ${result.data.name}! We received your message.`,
	});
});
