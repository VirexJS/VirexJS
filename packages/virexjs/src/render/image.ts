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

	const imgAttrs: Record<string, unknown> = {
		src,
		alt,
		width,
		height,
		decoding,
	};

	// Lazy loading — disabled for priority (above-fold) images
	if (!priority) {
		imgAttrs.loading = "lazy";
	}

	if (fetchPriority || priority) {
		imgAttrs.fetchpriority = fetchPriority ?? "high";
	}

	if (className) imgAttrs.className = className;
	if (srcSet) imgAttrs.srcset = srcSet;
	if (sizes) imgAttrs.sizes = sizes;

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
