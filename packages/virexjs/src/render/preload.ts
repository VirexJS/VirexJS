import type { VNode } from "./jsx";
import { h } from "./jsx";

/**
 * Generate preload link tags for critical resources.
 * Place in <Head> to tell the browser to fetch these resources early.
 *
 * Usage:
 *   import { Preload } from "virexjs";
 *
 *   <Head>
 *     <Preload href="/fonts/inter.woff2" as="font" type="font/woff2" />
 *     <Preload href="/hero.jpg" as="image" />
 *     <Preload href="/critical.css" as="style" />
 *   </Head>
 */
export interface PreloadProps {
	/** URL of the resource to preload */
	href: string;
	/** Resource type: font, image, style, script, fetch */
	as: "font" | "image" | "style" | "script" | "fetch";
	/** MIME type (required for fonts) */
	type?: string;
	/** CORS mode (required for fonts) */
	crossorigin?: "anonymous" | "use-credentials";
	/** Media query for responsive preloading */
	media?: string;
}

export function Preload(props: PreloadProps): VNode {
	const attrs: Record<string, unknown> = {
		rel: "preload",
		href: props.href,
		as: props.as,
	};

	if (props.type) attrs.type = props.type;
	if (props.media) attrs.media = props.media;

	// Fonts always need crossorigin
	if (props.as === "font") {
		attrs.crossorigin = props.crossorigin ?? "anonymous";
	} else if (props.crossorigin) {
		attrs.crossorigin = props.crossorigin;
	}

	return h("link", attrs);
}

/**
 * Generate DNS prefetch hints for third-party domains.
 *
 * Usage:
 *   <Head>
 *     <DNSPrefetch href="https://fonts.googleapis.com" />
 *     <DNSPrefetch href="https://cdn.example.com" />
 *   </Head>
 */
export function DNSPrefetch(props: { href: string }): VNode {
	return h("link", { rel: "dns-prefetch", href: props.href });
}

/**
 * Generate preconnect hints for third-party origins.
 * More aggressive than DNS prefetch — also establishes TCP/TLS connection.
 *
 * Usage:
 *   <Head>
 *     <Preconnect href="https://fonts.gstatic.com" />
 *   </Head>
 */
export function Preconnect(props: { href: string; crossorigin?: boolean }): VNode {
	const attrs: Record<string, unknown> = {
		rel: "preconnect",
		href: props.href,
	};
	if (props.crossorigin) attrs.crossorigin = "anonymous";
	return h("link", attrs);
}
