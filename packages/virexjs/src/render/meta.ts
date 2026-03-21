export interface MetaData {
	title?: string;
	description?: string;
	canonical?: string;
	og?: {
		title?: string;
		description?: string;
		image?: string;
		type?: string;
	};
	twitter?: {
		card?: string;
		title?: string;
		description?: string;
		image?: string;
	};
}

/**
 * Render MetaData to HTML string of <title> and <meta> tags.
 */
export function renderMeta(meta: MetaData): string {
	const tags: string[] = [];

	if (meta.title) {
		tags.push(`<title>${escapeMetaContent(meta.title)}</title>`);
	}

	if (meta.description) {
		tags.push(`<meta name="description" content="${escapeMetaContent(meta.description)}">`);
	}

	if (meta.canonical) {
		tags.push(`<link rel="canonical" href="${escapeMetaContent(meta.canonical)}">`);
	}

	if (meta.og) {
		if (meta.og.title) {
			tags.push(`<meta property="og:title" content="${escapeMetaContent(meta.og.title)}">`);
		}
		if (meta.og.description) {
			tags.push(
				`<meta property="og:description" content="${escapeMetaContent(meta.og.description)}">`,
			);
		}
		if (meta.og.image) {
			tags.push(`<meta property="og:image" content="${escapeMetaContent(meta.og.image)}">`);
		}
		if (meta.og.type) {
			tags.push(`<meta property="og:type" content="${escapeMetaContent(meta.og.type)}">`);
		}
	}

	if (meta.twitter) {
		if (meta.twitter.card) {
			tags.push(
				`<meta name="twitter:card" content="${escapeMetaContent(meta.twitter.card)}">`,
			);
		}
		if (meta.twitter.title) {
			tags.push(
				`<meta name="twitter:title" content="${escapeMetaContent(meta.twitter.title)}">`,
			);
		}
		if (meta.twitter.description) {
			tags.push(
				`<meta name="twitter:description" content="${escapeMetaContent(meta.twitter.description)}">`,
			);
		}
		if (meta.twitter.image) {
			tags.push(
				`<meta name="twitter:image" content="${escapeMetaContent(meta.twitter.image)}">`,
			);
		}
	}

	return tags.join("\n    ");
}

function escapeMetaContent(str: string): string {
	return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
