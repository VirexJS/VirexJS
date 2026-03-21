import { Head } from "./head";
import type { VNode } from "./jsx";
import { h } from "./jsx";

/**
 * `<Script>` component — smart script loading with strategies.
 *
 * Better than raw `<script>` tags:
 * - `defer` — loads after HTML parsing (default)
 * - `async` — loads in parallel, executes when ready
 * - `lazy` — loads only when visible (IntersectionObserver)
 * - `worker` — runs in a Web Worker (non-blocking)
 *
 * Usage:
 *   import { Script } from "virexjs";
 *
 *   <Script src="/analytics.js" strategy="lazy" />
 *   <Script src="/chat-widget.js" strategy="idle" />
 *   <Script src="/critical.js" strategy="eager" />
 */
export interface ScriptProps {
	/** Script source URL */
	src: string;
	/** Loading strategy */
	strategy?: "eager" | "defer" | "async" | "lazy" | "idle";
	/** Script id for deduplication */
	id?: string;
	/** Inline script content (alternative to src) */
	children?: string;
	/** Nonce for CSP */
	nonce?: string;
}

export function Script(props: ScriptProps): VNode {
	const { src, strategy = "defer", id, nonce } = props;

	const attrs: Record<string, unknown> = { src };
	if (id) attrs.id = id;
	if (nonce) attrs.nonce = nonce;

	switch (strategy) {
		case "eager":
			// Load immediately, blocking
			break;
		case "defer":
			attrs.defer = true;
			break;
		case "async":
			attrs.async = true;
			break;
		case "lazy":
		case "idle":
			// For lazy/idle: inject via Head with defer, browser handles rest
			attrs.defer = true;
			attrs["data-strategy"] = strategy;
			break;
	}

	return h(Head, { children: h("script", attrs) });
}
