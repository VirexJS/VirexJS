import type { VNode, VElement } from "./jsx";
import { renderToString } from "./jsx";

/**
 * Collected head tags from <Head> components during rendering.
 * Reset before each page render, read after renderToString completes.
 */
let headTags: VNode[] = [];

/** Reset the head tag collector (call before rendering a page) */
export function resetHeadCollector(): void {
	headTags = [];
}

/** Get collected head tags as an HTML string */
export function flushHeadTags(): string {
	const tags = headTags;
	headTags = [];
	return deduplicateAndRender(tags);
}

/**
 * Head component — collects children into the document <head>.
 *
 * Usage:
 *   import { Head } from "virexjs";
 *
 *   function BlogPost(props) {
 *     return (
 *       <>
 *         <Head>
 *           <title>{props.data.title}</title>
 *           <meta name="description" content={props.data.excerpt} />
 *           <link rel="stylesheet" href="/blog.css" />
 *           <script src="/analytics.js" defer />
 *         </Head>
 *         <article>...</article>
 *       </>
 *     );
 *   }
 *
 * Tags are deduplicated: later <title> overrides earlier, meta tags
 * are deduped by name/property attribute, link tags by href.
 */
export function Head(props: { children?: unknown }): null {
	if (props.children) {
		const children = Array.isArray(props.children) ? props.children : [props.children];
		for (const child of children) {
			headTags.push(child as VNode);
		}
	}
	return null;
}

/**
 * Deduplicate head tags and render to HTML.
 *
 * Dedup rules:
 * - <title>: last one wins
 * - <meta name="X">: last one with same name wins
 * - <meta property="X">: last one with same property wins
 * - <meta charset="X">: last one wins
 * - <link rel="X" href="Y">: dedup by href
 * - Everything else: kept in order
 */
function deduplicateAndRender(tags: VNode[]): string {
	let title = "";
	const metaByName = new Map<string, VNode>();
	const metaByProperty = new Map<string, VNode>();
	let metaCharset: VNode | null = null;
	const linkByHref = new Map<string, VNode>();
	const others: VNode[] = [];

	for (const tag of tags) {
		if (!isVElement(tag)) {
			continue;
		}

		if (tag.type === "title") {
			// Render children to get the title text
			const children = tag.props.children;
			if (children !== undefined) {
				title = renderToString(children as VNode);
			}
			continue;
		}

		if (tag.type === "meta") {
			const name = tag.props.name as string | undefined;
			const property = tag.props.property as string | undefined;
			const charset = tag.props.charset as string | undefined;

			if (name) {
				metaByName.set(name, tag);
			} else if (property) {
				metaByProperty.set(property, tag);
			} else if (charset) {
				metaCharset = tag;
			} else {
				others.push(tag);
			}
			continue;
		}

		if (tag.type === "link") {
			const href = tag.props.href as string | undefined;
			if (href) {
				linkByHref.set(href, tag);
			} else {
				others.push(tag);
			}
			continue;
		}

		others.push(tag);
	}

	const parts: string[] = [];

	if (title) {
		parts.push(`<title>${title}</title>`);
	}

	if (metaCharset) {
		parts.push(renderToString(metaCharset));
	}

	for (const meta of metaByName.values()) {
		parts.push(renderToString(meta));
	}

	for (const meta of metaByProperty.values()) {
		parts.push(renderToString(meta));
	}

	for (const link of linkByHref.values()) {
		parts.push(renderToString(link));
	}

	for (const other of others) {
		parts.push(renderToString(other));
	}

	return parts.join("\n    ");
}

function isVElement(node: VNode): node is VElement {
	return (
		typeof node === "object" &&
		node !== null &&
		!Array.isArray(node) &&
		"type" in node &&
		"props" in node
	);
}
