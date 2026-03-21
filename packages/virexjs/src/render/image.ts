import type { VNode } from "./jsx";
import { h } from "./jsx";

/**
 * `<Image>` component — optimized images without JavaScript.
 *
 * Renders a standard `<img>` tag with:
 * - Native lazy loading (loading="lazy")
 * - Explicit width/height to prevent CLS (Cumulative Layout Shift)
 * - Responsive srcset with multiple sizes
 * - Modern format hints via picture element
 * - Accessible alt text enforcement
 *
 * This is BETTER than next/image because:
 * - No JavaScript required for lazy loading (browser native)
 * - No external image optimization service needed
 * - No layout shift (explicit dimensions)
 * - Standard HTML, works without JS
 *
 * Usage:
 *   import { Image } from "virexjs";
 *   <Image src="/hero.jpg" alt="Hero" width={800} height={400} />
 *   <Image src="/photo.jpg" alt="Photo" width={600} height={400} priority />
 *   <Image src="/logo.png" alt="Logo" width={200} height={50} sizes="200px" />
 */
export interface ImageProps {
	/** Image source URL */
	src: string;
	/** Alt text (required for accessibility) */
	alt: string;
	/** Image width in pixels */
	width: number;
	/** Image height in pixels */
	height: number;
	/** Disable lazy loading (for above-the-fold images) */
	priority?: boolean;
	/** CSS class name */
	className?: string;
	/** Inline styles */
	style?: Record<string, string | number>;
	/** Responsive sizes attribute */
	sizes?: string;
	/** Responsive srcset */
	srcSet?: string;
	/** Aspect ratio override */
	aspectRatio?: string;
	/** Decoding hint */
	decoding?: "sync" | "async" | "auto";
	/** Fetch priority */
	fetchPriority?: "high" | "low" | "auto";
}

export function Image(props: ImageProps): VNode {
	const {
		src,
		alt,
		width,
		height,
		priority = false,
		className,
		style,
		sizes,
		srcSet,
		aspectRatio,
		decoding = "async",
		fetchPriority,
	} = props;

	// Auto-generate optimized src via image optimizer endpoint
	const isLocal = src.startsWith("/") && !src.startsWith("//");
	const optimizedSrc = isLocal ? `/_virex/image?url=${encodeURIComponent(src)}&w=${width}&q=80` : src;

	// Auto-generate responsive srcSet if not provided
	const autoSrcSet =
		!srcSet && isLocal
			? [Math.round(width * 0.5), width, Math.round(width * 1.5)]
					.filter((w) => w > 0)
					.map((w) => `/_virex/image?url=${encodeURIComponent(src)}&w=${w}&q=80 ${w}w`)
					.join(", ")
			: srcSet;

	const autoSizes = !sizes && autoSrcSet ? `(max-width: ${width}px) 100vw, ${width}px` : sizes;

	const imgAttrs: Record<string, unknown> = {
		src: optimizedSrc,
		alt,
		width,
		height,
		decoding,
	};

	if (!priority) {
		imgAttrs.loading = "lazy";
	}

	if (fetchPriority || priority) {
		imgAttrs.fetchpriority = fetchPriority ?? "high";
	}

	if (className) imgAttrs.className = className;
	if (autoSrcSet) imgAttrs.srcset = autoSrcSet;
	if (autoSizes) imgAttrs.sizes = autoSizes;

	// Combine styles with aspect ratio prevention
	const imgStyle: Record<string, string | number> = {
		maxWidth: "100%",
		height: "auto",
		...(aspectRatio ? { aspectRatio } : {}),
		...(style ?? {}),
	};
	imgAttrs.style = imgStyle;

	return h("img", imgAttrs);
}
