/**
 * Create a streaming HTML response from parts.
 * Sends the opening HTML immediately for fast TTFB,
 * then streams the body content.
 */
export function createStreamingResponse(
	headHtml: string,
	bodyHtml: string,
	devScript?: string,
): Response {
	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		start(controller) {
			// Send head immediately for fast TTFB
			controller.enqueue(
				encoder.encode(`<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    ${headHtml}\n</head>\n<body>\n`),
			);

			// Send body content
			controller.enqueue(encoder.encode(`    ${bodyHtml}\n`));

			// Send dev script if present
			if (devScript) {
				controller.enqueue(encoder.encode(`    <script>${devScript}</script>\n`));
			}

			// Close document
			controller.enqueue(encoder.encode("</body>\n</html>"));
			controller.close();
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/html; charset=utf-8",
			"Transfer-Encoding": "chunked",
		},
	});
}
