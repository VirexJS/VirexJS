import { renderToString, h } from "./jsx";
import { renderMeta, type MetaData } from "./meta";
import { resetHeadCollector, flushHeadTags } from "./head";
import type { VNode } from "./jsx";

/**
 * Full page render pipeline:
 * 1. Call layout component (if any) with page as children
 * 2. Render to HTML string via renderToString
 * 3. Build head (meta tags + CSS links)
 * 4. Stream response: send <head> immediately for fast TTFB, then body
 * 5. Return as streaming Response
 */
export function renderPage(options: {
	component: (props: Record<string, unknown>) => VNode;
	layout?: (props: { children: unknown }) => VNode;
	data?: Record<string, unknown>;
	meta?: MetaData;
	cssLinks?: string[];
	devScript?: string;
}): Response {
	const { component, layout, data = {}, meta, cssLinks = [], devScript } = options;

	// Reset head collector before rendering
	resetHeadCollector();

	// Render page component
	let pageVNode: VNode = component(data);

	// Wrap in layout if provided
	if (layout) {
		pageVNode = layout({ children: pageVNode });
	}

	const bodyHtml = renderToString(pageVNode);

	// Collect head tags from <Head> components + meta() export
	const metaHtml = meta ? renderMeta(meta) : "";
	const headComponentHtml = flushHeadTags();
	const headHtml = [metaHtml, headComponentHtml].filter(Boolean).join("\n    ");

	const cssLinkTags = cssLinks
		.map((href) => `<link rel="stylesheet" href="${href}">`)
		.join("\n    ");

	const devScriptTag = devScript ? `\n    <script>${devScript}</script>` : "";

	// Create a true streaming response — head arrives first for fast TTFB
	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		start(controller) {
			// 1. Send <head> immediately — browser can start loading CSS/fonts
			controller.enqueue(
				encoder.encode(
					`<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    ${headHtml}\n    ${cssLinkTags}\n</head>\n<body>\n`,
				),
			);

			// 2. Send rendered body
			controller.enqueue(encoder.encode(bodyHtml));

			// 3. Send closing tags + dev script
			controller.enqueue(
				encoder.encode(`${devScriptTag}\n</body>\n</html>`),
			);

			controller.close();
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/html; charset=utf-8",
		},
	});
}

/**
 * Build a complete HTML document as a single string (for production builds).
 */
export function buildDocument(options: {
	lang?: string;
	head: string;
	body: string;
	cssLinks?: string[];
	devScript?: string;
}): string {
	const { lang = "en", head, body, cssLinks = [], devScript } = options;

	const cssLinkTags = cssLinks
		.map((href) => `<link rel="stylesheet" href="${href}">`)
		.join("\n    ");

	const devScriptTag = devScript ? `<script>${devScript}</script>` : "";

	return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${head}
    ${cssLinkTags}
</head>
<body>
    ${body}
    ${devScriptTag}
</body>
</html>`;
}

export { renderToString, h, renderMeta };
export { registerIsland, clearIslands, getIslandRegistry } from "./jsx";
export { Head, resetHeadCollector, flushHeadTags } from "./head";
export { ErrorBoundary } from "./error-boundary";
export type { ErrorBoundaryProps } from "./error-boundary";
export { useHead } from "./use-head";
export type { UseHeadOptions } from "./use-head";
export type { VNode, VElement } from "./jsx";
export type { MetaData } from "./meta";
