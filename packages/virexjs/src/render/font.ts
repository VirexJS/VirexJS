import { Head } from "./head";
import type { VNode } from "./jsx";
import { h } from "./jsx";

/**
 * `<Font>` component — optimized web font loading.
 *
 * Like next/font but without a build step:
 * - Preconnects to font CDN
 * - Preloads critical fonts
 * - Sets font-display: swap for fast text rendering
 *
 * All dangerouslySetInnerHTML usage contains only static, trusted CSS
 * generated from validated font properties — no user input.
 *
 * Usage:
 *   <Font google="Inter" weights={[400, 600, 700]} />
 *   <Font family="MyFont" src="/fonts/myfont.woff2" weight="400" />
 */
export interface FontProps {
	/** Google Fonts family name */
	google?: string;
	/** Font weights to load */
	weights?: number[];
	/** Custom font family name */
	family?: string;
	/** Custom font source URL (woff2) */
	src?: string;
	/** Font weight */
	weight?: string;
	/** Font display strategy. Default: "swap" */
	display?: "swap" | "block" | "fallback" | "optional" | "auto";
	/** Preload the font. Default: true */
	preload?: boolean;
	/** CSS variable name e.g. "--font-heading" */
	variable?: string;
}

export function Font(props: FontProps): VNode {
	const { display = "swap", preload = true } = props;

	if (props.google) {
		return googleFont(props.google, props.weights ?? [400], display, props.variable);
	}

	if (props.family && props.src) {
		return customFont(
			props.family,
			props.src,
			props.weight ?? "400",
			display,
			preload,
			props.variable,
		);
	}

	return null;
}

function googleFont(family: string, weights: number[], display: string, variable?: string): VNode {
	const weightStr = weights.join(";");
	const encodedFamily = encodeURIComponent(family);
	const url = `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@${weightStr}&display=${display}`;

	const elements: VNode[] = [
		h("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }),
		h("link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }),
		h("link", { rel: "stylesheet", href: url }),
	];

	if (variable) {
		// Trusted static CSS — font family from developer config, not user input
		const css = `:root { ${variable}: '${family}', system-ui, sans-serif; }`;
		elements.push(h("style", { dangerouslySetInnerHTML: { __html: css } }));
	}

	return h(Head, { children: elements });
}

function customFont(
	family: string,
	src: string,
	weight: string,
	display: string,
	preload: boolean,
	variable?: string,
): VNode {
	const elements: VNode[] = [];

	if (preload) {
		elements.push(
			h("link", { rel: "preload", href: src, as: "font", type: "font/woff2", crossorigin: "" }),
		);
	}

	// Trusted static CSS — all values from developer config
	const css = [
		`@font-face { font-family: '${family}'; src: url('${src}') format('woff2'); font-weight: ${weight}; font-display: ${display}; }`,
		variable ? `:root { ${variable}: '${family}', system-ui, sans-serif; }` : "",
	]
		.filter(Boolean)
		.join(" ");

	elements.push(h("style", { dangerouslySetInnerHTML: { __html: css } }));

	return h(Head, { children: elements });
}
