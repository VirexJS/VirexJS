import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { extractIslands } from "./island-extract";

export interface IslandBundleResult {
	bundles: Map<string, string>;
	totalSize: number;
}

/**
 * Bundle all island components for client-side hydration.
 *
 * Strategy: bundle all islands together with shared chunks so the
 * JSX runtime (h, Fragment, etc.) is only included ONCE.
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

	// Create entry files for all islands
	const entrypoints: string[] = [];
	const entryPaths: string[] = [];

	for (const [name, island] of islands) {
		const entryContent = generateClientEntry(island.filePath, name);
		const entryPath = join(islandsOutDir, `_entry_${name}.tsx`);
		writeFileSync(entryPath, entryContent);
		entrypoints.push(entryPath);
		entryPaths.push(entryPath);
	}

	try {
		// Bundle ALL islands together — Bun will create shared chunks
		const result = await Bun.build({
			entrypoints,
			outdir: islandsOutDir,
			minify,
			target: "browser",
			splitting: true, // Enable code splitting for shared runtime
			naming: "[name].js",
		});

		if (result.success) {
			for (const output of result.outputs) {
				const name = output.path
					.replace(/\\/g, "/")
					.split("/")
					.pop()
					?.replace("_entry_", "")
					.replace(".js", "");
				if (name && islands.has(name)) {
					bundles.set(name, output.path);
					totalSize += output.size ?? 0;
				} else {
					// Shared chunk
					totalSize += output.size ?? 0;
				}
			}
		} else {
			// Fallback: bundle individually if splitting fails
			for (const [name, island] of islands) {
				try {
					const entryPath = join(islandsOutDir, `_entry_${name}.tsx`);
					const r = await Bun.build({
						entrypoints: [entryPath],
						outdir: islandsOutDir,
						minify,
						target: "browser",
						naming: `${name}.js`,
					});
					if (r.success && r.outputs[0]) {
						bundles.set(name, r.outputs[0].path);
						totalSize += r.outputs[0].size ?? 0;
					}
				} catch {
					console.error(`Failed to bundle island "${name}"`);
				}
			}
		}
	} catch (error) {
		console.error("Island bundle failed, trying individual bundles...");
		// Fallback to individual bundling
		for (const [name, island] of islands) {
			try {
				const entryPath = join(islandsOutDir, `_entry_${name}.tsx`);
				const r = await Bun.build({
					entrypoints: [entryPath],
					outdir: islandsOutDir,
					minify,
					target: "browser",
					naming: `${name}.js`,
				});
				if (r.success && r.outputs[0]) {
					bundles.set(name, r.outputs[0].path);
					totalSize += r.outputs[0].size ?? 0;
				}
			} catch {
				// Skip failed island
			}
		}
	}

	// Clean up entry files
	for (const entryPath of entryPaths) {
		try {
			const { unlinkSync } = await import("node:fs");
			unlinkSync(entryPath);
		} catch {
			// Ignore
		}
	}

	return { bundles, totalSize };
}

/**
 * Generate client-side mount entry for an island.
 * Uses safe DOM APIs (no innerHTML).
 */
function generateClientEntry(filePath: string, name: string): string {
	const importPath = filePath.replace(/\\/g, "/");

	return `
import Component from "${importPath}";

export function mount(container, props) {
  const state = { ...props };
  state._state = state;
  state._rerender = rerender;

  function rerender() {
    state._state = state;
    state._rerender = rerender;
    const vnode = Component(state);
    while (container.firstChild) container.removeChild(container.firstChild);
    const dom = vnodeToDom(vnode, state, rerender);
    if (dom) container.appendChild(dom);
  }

  Component(state);
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
