import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { extractIslands } from "./island-extract";

export interface IslandBundleResult {
	/** Island name → output JS file path */
	bundles: Map<string, string>;
	/** Total bundle size in bytes */
	totalSize: number;
}

/**
 * Bundle all island components for client-side hydration.
 * Each island gets its own small JS file that exports a `mount` function.
 *
 * The mount function receives a container element and props,
 * then takes over the DOM inside that container with interactive behavior.
 */
export async function bundleIslands(options: {
	srcDir: string;
	outDir: string;
	minify?: boolean;
}): Promise<IslandBundleResult> {
	const { srcDir, outDir, minify = true } = options;
	const islands = extractIslands(srcDir);

	if (islands.size === 0) {
		return { bundles: new Map(), totalSize: 0 };
	}

	const islandsOutDir = join(outDir, "_virex", "islands");
	mkdirSync(islandsOutDir, { recursive: true });

	const bundles = new Map<string, string>();
	let totalSize = 0;

	for (const [name, island] of islands) {
		try {
			// Create a client entry that wraps the island with a mount function
			const entryContent = generateClientEntry(island.filePath, name);
			const entryPath = join(islandsOutDir, `_entry_${name}.tsx`);
			writeFileSync(entryPath, entryContent);

			// Bundle with Bun.build()
			const result = await Bun.build({
				entrypoints: [entryPath],
				outdir: islandsOutDir,
				minify,
				target: "browser",
				naming: `${name}.js`,
			});

			if (result.success && result.outputs.length > 0) {
				const output = result.outputs[0];
				if (!output) continue;
				const outputPath = output.path;
				const size = output.size ?? 0;

				bundles.set(name, outputPath);
				totalSize += size;
			}

			// Clean up entry file
			try {
				const { unlinkSync } = await import("node:fs");
				unlinkSync(entryPath);
			} catch {
				// Ignore cleanup errors
			}
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			console.error(`Failed to bundle island "${name}": ${msg}`);
		}
	}

	return { bundles, totalSize };
}

/**
 * Generate a client-side entry file for an island component.
 *
 * The generated mount function uses safe DOM APIs (createElement,
 * textContent, setAttribute) instead of innerHTML to prevent XSS.
 * All text content is inserted via textContent which is inherently safe.
 */
function generateClientEntry(filePath: string, name: string): string {
	const importPath = filePath.replace(/\\/g, "/");

	return `
import Component from "${importPath}";

/**
 * Mount the ${name} island into a container element.
 * Replaces the static HTML with an interactive version using safe DOM APIs.
 */
export function mount(container, props) {
  const state = { ...props };

  function rerender() {
    const vnode = Component(state);
    // Clear existing children safely
    while (container.firstChild) container.removeChild(container.firstChild);
    // Build DOM from vnode using safe APIs
    const dom = vnodeToDom(vnode, state, rerender);
    if (dom) container.appendChild(dom);
  }

  rerender();
}

function vnodeToDom(node, state, rerender) {
  if (node === null || node === undefined || typeof node === "boolean") return null;
  if (typeof node === "string" || typeof node === "number") {
    return document.createTextNode(String(node));
  }
  if (Array.isArray(node)) {
    const frag = document.createDocumentFragment();
    node.forEach(child => {
      const d = vnodeToDom(child, state, rerender);
      if (d) frag.appendChild(d);
    });
    return frag;
  }
  if (typeof node.type === "function") {
    return vnodeToDom(node.type(node.props), state, rerender);
  }

  const el = document.createElement(node.type);
  const props = node.props || {};
  const children = [];

  for (const [key, value] of Object.entries(props)) {
    if (key === "children") {
      if (Array.isArray(value)) children.push(...value);
      else children.push(value);
      continue;
    }
    // Bind event handlers
    if (key.startsWith("on") && typeof value === "function") {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, value);
      continue;
    }
    if (key === "className") { el.setAttribute("class", String(value)); continue; }
    if (key === "htmlFor") { el.setAttribute("for", String(value)); continue; }
    if (key === "style" && typeof value === "object") {
      for (const [sk, sv] of Object.entries(value)) {
        const cssProp = sk.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
        el.style.setProperty(cssProp, String(sv));
      }
      continue;
    }
    if (value === true) { el.setAttribute(key, ""); continue; }
    if (value === false || value === null || value === undefined) continue;
    if (key === "disabled" && !value) continue;
    el.setAttribute(key, String(value));
  }

  children.forEach(child => {
    const d = vnodeToDom(child, state, rerender);
    if (d) el.appendChild(d);
  });

  return el;
}

export default { mount };
`;
}
