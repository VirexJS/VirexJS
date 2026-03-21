import { flushHeadTags, resetHeadCollector } from "./head";
import type { VNode } from "./jsx";
import { h, renderToString } from "./jsx";
import { type MetaData, renderMeta } from "./meta";

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
	/** Loading component shown while streaming (like Next.js loading.tsx) */
	loadingComponent?: (props: Record<string, unknown>) => VNode;
}): Response {
	const {
		component,
		layout,
		data = {},
		meta,
		cssLinks = [],
		devScript,
		loadingComponent,
	} = options;

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
	// If loadingComponent exists, send loading shell before body (like Next.js loading.tsx)
	const encoder = new TextEncoder();
	const loadingHtml = loadingComponent ? renderToString(loadingComponent({})) : "";

	const stream = new ReadableStream({
		start(controller) {
			// 1. Send <head> immediately — browser can start loading CSS/fonts
			controller.enqueue(
				encoder.encode(
					`<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    ${headHtml}\n    ${cssLinkTags}\n</head>\n<body>\n`,
				),
			);

			// 2. If loading component exists, send it as initial shell
			if (loadingHtml) {
				controller.enqueue(encoder.encode(`<div id="vrx-loading">${loadingHtml}</div>\n`));
			}

			// 3. Send rendered body in chunks (better streaming for large pages)
			if (loadingHtml) {
				controller.enqueue(encoder.encode(`<div id="vrx-content" style="display:none">`));
				// Stream body in 16KB chunks for better TTFB on large pages
				const CHUNK_SIZE = 16384;
				for (let i = 0; i < bodyHtml.length; i += CHUNK_SIZE) {
					controller.enqueue(encoder.encode(bodyHtml.slice(i, i + CHUNK_SIZE)));
				}
				controller.enqueue(
					encoder.encode(
						`</div>\n<script>document.getElementById("vrx-loading").remove();document.getElementById("vrx-content").style.display="";</script>\n`,
					),
				);
			} else {
				// Stream body in chunks for large pages
				const CHUNK = 16384;
				for (let i = 0; i < bodyHtml.length; i += CHUNK) {
					controller.enqueue(encoder.encode(bodyHtml.slice(i, i + CHUNK)));
				}
			}

			// 4. Send closing tags + dev script
			controller.enqueue(encoder.encode(`${devScriptTag}\n</body>\n</html>`));

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

export type { ErrorBoundaryProps } from "./error-boundary";
export { ErrorBoundary } from "./error-boundary";
export { flushHeadTags, Head, resetHeadCollector } from "./head";
export type { VElement, VNode } from "./jsx";
export { clearIslands, getIslandRegistry, registerIsland } from "./jsx";
export type { MetaData } from "./meta";
export type { UseHeadOptions } from "./use-head";
export { useHead } from "./use-head";
export { h, renderMeta, renderToString };
