/**
 * Build a complete HTML document shell.
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
