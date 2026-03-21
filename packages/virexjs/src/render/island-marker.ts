import { sep } from "node:path";

/**
 * Check if a component file path is from the islands directory.
 */
export function isIsland(filePath: string, islandsDir: string): boolean {
	const normalizedFile = filePath.split(sep).join("/");
	const normalizedDir = islandsDir.split(sep).join("/");
	return normalizedFile.startsWith(normalizedDir);
}

/**
 * Wrap island HTML with marker comments for Phase 2 hydration.
 *
 * Output:
 *   <!--vrx-island:Counter:{"initial":0}:visible-->
 *   <div data-vrx-island="Counter">{renderedHTML}</div>
 *   <!--/vrx-island-->
 */
export function wrapIslandMarker(
	html: string,
	name: string,
	props: Record<string, unknown>,
	hydration = "visible",
): string {
	const serializedProps = JSON.stringify(props);
	return `<!--vrx-island:${name}:${serializedProps}:${hydration}-->\n<div data-vrx-island="${name}">${html}</div>\n<!--/vrx-island-->`;
}
