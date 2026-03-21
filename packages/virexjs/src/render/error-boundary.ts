import type { VNode } from "./jsx";
import { renderToString } from "./jsx";

/**
 * Props for the ErrorBoundary component.
 */
export interface ErrorBoundaryProps {
	/** The content to render. If rendering throws, fallback is used instead. */
	children?: unknown;
	/** Fallback UI to render when an error occurs. Receives the error. */
	fallback: (error: Error) => VNode;
	/** Optional error handler called when an error is caught. */
	onError?: (error: Error) => void;
}

/**
 * Server-side error boundary component.
 *
 * Catches rendering errors in children and displays a fallback UI.
 * This is the SSR equivalent of React's error boundaries.
 *
 * Usage:
 *   import { ErrorBoundary, h } from "virexjs";
 *
 *   function App() {
 *     return h(ErrorBoundary, {
 *       fallback: (error) => h("div", { className: "error" }, `Error: ${error.message}`),
 *       children: h(RiskyComponent, null),
 *     });
 *   }
 *
 * Or in JSX:
 *   <ErrorBoundary fallback={(err) => <p>Something went wrong: {err.message}</p>}>
 *     <RiskyComponent />
 *   </ErrorBoundary>
 */
export function ErrorBoundary(props: ErrorBoundaryProps): VNode {
	const { children, fallback, onError } = props;

	try {
		// Attempt to render children by converting to string and back
		// This forces evaluation of any deferred components
		const html = renderToString(children as VNode);
		// Return a raw HTML wrapper that renderToString will pass through
		return { type: "__vrx_raw__", props: { html } };
	} catch (err) {
		const error = err instanceof Error ? err : new Error(String(err));
		if (onError) {
			try {
				onError(error);
			} catch {
				// Ignore errors in error handler
			}
		}
		return fallback(error);
	}
}
