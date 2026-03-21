import type { RouteNode, ScannedRoute } from "./types";
import { parseSegment, segmentToURL } from "./params";

/**
 * Build a route tree (trie) from scanned routes.
 *
 * The tree root represents "/" and each child is a URL segment.
 * Children are sorted by priority: static > dynamic > catch-all.
 */
export function buildTree(routes: ScannedRoute[]): RouteNode {
	const root: RouteNode = {
		segment: "",
		filePath: null,
		isDynamic: false,
		isCatchAll: false,
		isGroup: false,
		params: [],
		children: [],
	};

	for (const route of routes) {
		insertRoute(root, route);
	}

	sortChildren(root);
	return root;
}

function insertRoute(root: RouteNode, route: ScannedRoute): void {
	let current = root;

	// Empty segments means index route at root
	if (route.segments.length === 0) {
		current.filePath = route.absolutePath;
		return;
	}

	for (let i = 0; i < route.segments.length; i++) {
		const fileSegment = route.segments[i]!;
		const isLast = i === route.segments.length - 1;
		const isGroup = fileSegment.startsWith("(") && fileSegment.endsWith(")");
		const urlSegment = segmentToURL(fileSegment);
		const paramDef = parseSegment(fileSegment);

		// For groups, skip URL segment but still traverse/create node
		const segment = urlSegment ?? fileSegment;

		let child = current.children.find((c) => c.segment === segment);
		if (!child) {
			child = {
				segment,
				filePath: null,
				isDynamic: paramDef?.type === "single" || false,
				isCatchAll: paramDef?.type === "catchAll" || false,
				isGroup,
				params: paramDef ? [paramDef] : [],
				children: [],
			};
			current.children.push(child);
		}

		if (isLast) {
			child.filePath = route.absolutePath;
		}

		current = child;
	}
}

/**
 * Recursively sort children by priority: static > dynamic > catch-all.
 */
function sortChildren(node: RouteNode): void {
	node.children.sort((a, b) => {
		const priorityA = getSegmentPriority(a);
		const priorityB = getSegmentPriority(b);
		if (priorityA !== priorityB) {
			return priorityA - priorityB;
		}
		return a.segment.localeCompare(b.segment);
	});

	for (const child of node.children) {
		sortChildren(child);
	}
}

function getSegmentPriority(node: RouteNode): number {
	if (node.isCatchAll) return 3;
	if (node.isDynamic) return 2;
	if (node.isGroup) return 1;
	return 0;
}
