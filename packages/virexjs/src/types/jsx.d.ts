import type { VNode } from "../render/jsx";

declare global {
	namespace JSX {
		type Element = VNode;

		interface IntrinsicElements {
			[elemName: string]: Record<string, unknown>;
		}

		interface ElementChildrenAttribute {
			children: unknown;
		}
	}
}
