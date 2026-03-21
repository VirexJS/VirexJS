/** Virtual DOM node type */
export type VNode = string | number | boolean | null | undefined | VElement | VNode[];

/** Virtual element representing an HTML tag or component */
export interface VElement {
	type: string | ((props: Record<string, unknown>) => VNode);
	props: Record<string, unknown>;
}

/** Fragment symbol for grouping children without a wrapper element */
export const Fragment = Symbol.for("vrx.fragment");

/**
 * Global island registry. When a component name is registered here,
 * renderToString will wrap its output with island marker comments.
 */
const islandRegistry = new Set<string>();

/** Register a component name as an island */
export function registerIsland(name: string): void {
	islandRegistry.add(name);
}

/** Clear the island registry */
export function clearIslands(): void {
	islandRegistry.clear();
}

/** Get the island registry */
export function getIslandRegistry(): ReadonlySet<string> {
	return islandRegistry;
}

/** Set of void HTML elements that must not have closing tags */
const VOID_ELEMENTS = new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr",
]);

/** Boolean HTML attributes */
const BOOLEAN_ATTRS = new Set([
	"disabled",
	"checked",
	"readonly",
	"required",
	"autofocus",
	"autoplay",
	"controls",
	"defer",
	"hidden",
	"loop",
	"multiple",
	"muted",
	"novalidate",
	"open",
	"selected",
]);

/**
 * JSX factory function. This replaces React.createElement.
 * - String type ("div", "span") → VElement for HTML rendering
 * - Function type (Component) → call it immediately, return its output
 * - Fragment → just return children
 */
export function h(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type: string | symbol | ((props: any) => VNode),
	props: Record<string, unknown> | null,
	...children: unknown[]
): VNode {
	const mergedProps = props ?? {};

	// Flatten children from props.children or arguments
	const allChildren =
		mergedProps.children !== undefined
			? flattenChildren([mergedProps.children as unknown])
			: flattenChildren(children);

	// Fragment — just return children
	if (type === Fragment) {
		return allChildren as VNode;
	}

	// Function component — defer to renderToString (do not call eagerly,
	// so that context providers can set values before children render)
	if (typeof type === "function") {
		const componentProps = {
			...mergedProps,
			children: allChildren.length === 1 ? allChildren[0] : allChildren,
		};
		return { type: type as (props: Record<string, unknown>) => VNode, props: componentProps };
	}

	// String type — build VElement
	const elementProps: Record<string, unknown> = { ...mergedProps };
	if (allChildren.length > 0) {
		elementProps.children = allChildren;
	} else {
		delete elementProps.children;
	}

	return { type: type as string, props: elementProps };
}

/**
 * Render a VNode tree to an HTML string.
 *
 * Handles XSS prevention by escaping all text content and attribute values.
 * Supports className→class, htmlFor→for, boolean attrs, style objects,
 * void elements, raw HTML injection, arrays, and null/undefined/boolean nodes.
 */
export function renderToString(node: VNode): string {
	if (node === null || node === undefined || typeof node === "boolean") {
		return "";
	}

	if (typeof node === "number") {
		return String(node);
	}

	if (typeof node === "string") {
		return escapeHtml(node);
	}

	if (Array.isArray(node)) {
		return node.map(renderToString).join("");
	}

	const { type, props } = node;

	// Handle pre-rendered raw HTML (from ErrorBoundary)
	if (type === "__vrx_raw__") {
		return props.html as string;
	}

	// Handle context provider (inserted by compat/react createContext)
	if (type === "__vrx_context__") {
		const ctx = props._ctx as { _currentValue: unknown };
		const value = props._value;
		const renderChildren = props._renderChildren as () => VNode;
		const prev = ctx._currentValue;
		ctx._currentValue = value;
		const childHtml = renderToString(renderChildren());
		ctx._currentValue = prev;
		return childHtml;
	}

	// Handle island marker wrapper (inserted by h() for registered islands)
	if (type === "__vrx_island__") {
		const islandName = props.name as string;
		const islandProps = props.serializableProps as Record<string, unknown>;
		const childHtml = (props.children as unknown[]).map((c) => renderToString(c as VNode)).join("");
		const serializedProps = JSON.stringify(islandProps);
		return `<!--vrx-island:${islandName}:${serializedProps}:visible-->\n<div data-vrx-island="${islandName}">${childHtml}</div>\n<!--/vrx-island-->`;
	}

	if (typeof type === "function") {
		const fn = type as unknown as Record<string, unknown>;

		// Context provider: set value, render children, restore previous
		if (fn.__vrx_provider__) {
			const ctx = fn.__vrx_ctx__ as { _currentValue: unknown };
			const prev = ctx._currentValue;
			ctx._currentValue = props.value;
			const childHtml = renderToString(props.children as VNode);
			ctx._currentValue = prev;
			return childHtml;
		}

		// Island component: wrap output with hydration markers
		const componentName = type.name;
		if (componentName && islandRegistry.has(componentName)) {
			const result = type(props);
			const childHtml = renderToString(result);
			const { children: _children, ...serializableProps } = props;
			const serialized = JSON.stringify(serializableProps);
			return `<!--vrx-island:${componentName}:${serialized}:visible-->\n<div data-vrx-island="${componentName}">${childHtml}</div>\n<!--/vrx-island-->`;
		}

		const result = type(props);
		return renderToString(result);
	}

	// Build attributes string
	let attrs = "";
	let rawInnerHTML = "";
	const children: unknown[] = [];

	for (const [key, value] of Object.entries(props)) {
		if (key === "children") {
			if (Array.isArray(value)) {
				children.push(...value);
			} else {
				children.push(value);
			}
			continue;
		}

		// Handle raw HTML injection (React-compatible API for trusted content only)
		if (key === "dangerouslySetInnerHTML") {
			const htmlObj = value as { __html: string } | null;
			if (htmlObj?.__html) {
				rawInnerHTML = htmlObj.__html;
			}
			continue;
		}

		// Skip event handlers and ref
		if (key.startsWith("on") && key.length > 2 && key[2]! === key[2]?.toUpperCase()) {
			continue;
		}
		if (key === "ref") {
			continue;
		}

		// Handle className → class
		const attrName = key === "className" ? "class" : key === "htmlFor" ? "for" : key;

		// Handle boolean attributes
		if (BOOLEAN_ATTRS.has(attrName)) {
			if (value) {
				attrs += ` ${attrName}`;
			}
			continue;
		}

		// Handle style objects
		if (attrName === "style" && typeof value === "object" && value !== null) {
			attrs += ` style="${escapeAttr(styleToString(value as Record<string, string | number>))}"`;
			continue;
		}

		// Skip null/undefined/false values
		if (value === null || value === undefined || value === false) {
			continue;
		}

		attrs += ` ${attrName}="${escapeAttr(String(value))}"`;
	}

	// Void elements — no children, no closing tag
	if (VOID_ELEMENTS.has(type)) {
		return `<${type}${attrs}>`;
	}

	// Raw inner HTML takes precedence over children (used only with trusted content)
	if (rawInnerHTML) {
		return `<${type}${attrs}>${rawInnerHTML}</${type}>`;
	}

	// Render children
	const childHtml = children.map((child) => renderToString(child as VNode)).join("");

	return `<${type}${attrs}>${childHtml}</${type}>`;
}

/** Escape HTML content to prevent XSS */
function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#x27;");
}

/** Escape attribute values */
function escapeAttr(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#x27;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

/** Convert camelCase style prop to kebab-case CSS */
function styleToString(style: Record<string, string | number>): string {
	return Object.entries(style)
		.map(([key, value]) => {
			const cssKey = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
			return `${cssKey}:${value}`;
		})
		.join(";");
}

function flattenChildren(children: unknown[]): unknown[] {
	const result: unknown[] = [];
	for (const child of children) {
		if (Array.isArray(child)) {
			result.push(...flattenChildren(child));
		} else {
			result.push(child);
		}
	}
	return result;
}
