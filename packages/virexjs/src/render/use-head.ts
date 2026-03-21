import { h } from "./jsx";
import { Head } from "./head";
import type { VNode } from "./jsx";

/** Options for useHead() — supports common head tags as structured data */
export interface UseHeadOptions {
	title?: string;
	description?: string;
	canonical?: string;
	charset?: string;
	lang?: string;
	favicon?: string;
	og?: {
		title?: string;
		description?: string;
		image?: string;
		type?: string;
		url?: string;
		siteName?: string;
	};
	twitter?: {
		card?: "summary" | "summary_large_image" | "app" | "player";
		title?: string;
		description?: string;
		image?: string;
		site?: string;
		creator?: string;
	};
	/** Additional link tags */
	links?: Array<{ rel: string; href: string; type?: string; sizes?: string }>;
	/** Additional meta tags */
	meta?: Array<{ name?: string; property?: string; content: string; httpEquiv?: string }>;
	/** Additional script tags */
	scripts?: Array<{ src: string; defer?: boolean; async?: boolean; type?: string }>;
}

/**
 * Programmatic head management hook.
 *
 * Converts structured head data into `<Head>` children. Call this inside
 * a component and include the returned VNode in the render output.
 *
 * Usage:
 *   function BlogPost(props) {
 *     const head = useHead({
 *       title: props.data.title,
 *       description: props.data.excerpt,
 *       og: { title: props.data.title, image: props.data.cover },
 *     });
 *     return <>{head}<article>...</article></>;
 *   }
 */
export function useHead(options: UseHeadOptions): VNode {
	const children: VNode[] = [];

	if (options.title) {
		children.push(h("title", null, options.title));
	}

	if (options.charset) {
		children.push(h("meta", { charset: options.charset }));
	}

	if (options.description) {
		children.push(h("meta", { name: "description", content: options.description }));
	}

	if (options.canonical) {
		children.push(h("link", { rel: "canonical", href: options.canonical }));
	}

	if (options.favicon) {
		children.push(h("link", { rel: "icon", href: options.favicon }));
	}

	// OpenGraph
	if (options.og) {
		const og = options.og;
		if (og.title) children.push(h("meta", { property: "og:title", content: og.title }));
		if (og.description) children.push(h("meta", { property: "og:description", content: og.description }));
		if (og.image) children.push(h("meta", { property: "og:image", content: og.image }));
		if (og.type) children.push(h("meta", { property: "og:type", content: og.type }));
		if (og.url) children.push(h("meta", { property: "og:url", content: og.url }));
		if (og.siteName) children.push(h("meta", { property: "og:site_name", content: og.siteName }));
	}

	// Twitter Card
	if (options.twitter) {
		const tw = options.twitter;
		if (tw.card) children.push(h("meta", { name: "twitter:card", content: tw.card }));
		if (tw.title) children.push(h("meta", { name: "twitter:title", content: tw.title }));
		if (tw.description) children.push(h("meta", { name: "twitter:description", content: tw.description }));
		if (tw.image) children.push(h("meta", { name: "twitter:image", content: tw.image }));
		if (tw.site) children.push(h("meta", { name: "twitter:site", content: tw.site }));
		if (tw.creator) children.push(h("meta", { name: "twitter:creator", content: tw.creator }));
	}

	// Additional link tags
	if (options.links) {
		for (const link of options.links) {
			children.push(h("link", link as Record<string, unknown>));
		}
	}

	// Additional meta tags
	if (options.meta) {
		for (const meta of options.meta) {
			const props: Record<string, unknown> = { content: meta.content };
			if (meta.name) props.name = meta.name;
			if (meta.property) props.property = meta.property;
			if (meta.httpEquiv) props["http-equiv"] = meta.httpEquiv;
			children.push(h("meta", props));
		}
	}

	// Additional script tags
	if (options.scripts) {
		for (const script of options.scripts) {
			children.push(h("script", script as Record<string, unknown>));
		}
	}

	if (children.length === 0) {
		return null;
	}

	return h(Head, { children });
}
