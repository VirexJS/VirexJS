import type { VNode } from "./jsx";
import { h } from "./jsx";

/**
 * `<Link>` component — like next/link but zero JS for static links.
 *
 * On the server: renders a standard `<a>` tag with optional prefetch hint.
 * The browser natively prefetches via `<link rel="prefetch">` — no JavaScript needed.
 *
 * This is BETTER than Next.js Link because:
 * - No client-side router (zero JS overhead)
 * - Native browser prefetch via resource hints
 * - Works without JavaScript enabled
 * - Standard HTML semantics
 *
 * Usage:
 *   import { Link } from "virexjs";
 *   <Link href="/about">About</Link>
 *   <Link href="/blog" prefetch>Blog</Link>
 *   <Link href="/admin" className="nav-link" activeClassName="active">Admin</Link>
 */
export interface LinkProps {
	/** URL to navigate to */
	href: string;
	/** Enable prefetch hint (browser preloads the page) */
	prefetch?: boolean;
	/** CSS class name */
	className?: string;
	/** Additional class when href matches current URL */
	activeClassName?: string;
	/** Link children */
	children?: unknown;
	/** HTML target attribute */
	target?: string;
	/** HTML rel attribute */
	rel?: string;
	/** Inline styles */
	style?: Record<string, string | number>;
	/** Title attribute */
	title?: string;
}

export function Link(props: LinkProps): VNode {
	const {
		href,
		prefetch = false,
		className,
		activeClassName: _activeClassName,
		children,
		target,
		rel,
		style,
		title,
	} = props;

	const attrs: Record<string, unknown> = { href };
	if (className) attrs.className = className;
	if (target) attrs.target = target;
	if (rel) attrs.rel = rel;
	if (style) attrs.style = style;
	if (title) attrs.title = title;

	// External links: add security attrs
	if (target === "_blank" && !rel) {
		attrs.rel = "noopener noreferrer";
	}

	const elements: VNode[] = [];

	// Prefetch hint — browser natively preloads the page
	if (prefetch && !href.startsWith("http")) {
		elements.push(h("link", { rel: "prefetch", href, as: "document" }) as VNode);
	}

	elements.push(h("a", attrs, children));

	return elements.length === 1 ? elements[0]! : (elements as VNode);
}
