import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { extractIslands } from "./island-extract";

export interface IslandBundleResult {
	bundles: Map<string, string>;
	totalSize: number;
}

/**
 * Bundle all island components for client-side hydration.
 *
 * Strategy:
 * 1. Write a browser-side shim for virexjs (useIslandState, useSharedStore, etc.)
 * 2. Rewrite island sources to import from shim instead of "virexjs"
 * 3. Bundle all islands together with shared chunks
 * 4. Clean up temp files
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

	// Write browser-side virexjs shim
	const shimPath = join(islandsOutDir, "_vrx_shim.ts");
	writeFileSync(shimPath, generateBrowserShim());

	// Create entry files for all islands
	const entrypoints: string[] = [];
	const tempFiles: string[] = [shimPath];

	for (const [name, island] of islands) {
		// Rewrite island source to use browser shim instead of "virexjs"
		const clientSource = rewriteForBrowser(island.filePath, shimPath);
		const clientPath = join(islandsOutDir, `_src_${name}.tsx`);
		writeFileSync(clientPath, clientSource);
		tempFiles.push(clientPath);

		// Create mount entry
		const entryContent = generateClientEntry(clientPath);
		const entryPath = join(islandsOutDir, `_entry_${name}.tsx`);
		writeFileSync(entryPath, entryContent);
		entrypoints.push(entryPath);
		tempFiles.push(entryPath);
	}

	try {
		// Bundle ALL islands together — Bun creates shared chunks
		const result = await Bun.build({
			entrypoints,
			outdir: islandsOutDir,
			minify,
			target: "browser",
			splitting: true,
			naming: "[name].js",
		});

		if (result.success) {
			for (const output of result.outputs) {
				const fileName = output.path
					.replace(/\\/g, "/")
					.split("/")
					.pop()
					?.replace("_entry_", "")
					.replace(".js", "");
				if (fileName && islands.has(fileName)) {
					bundles.set(fileName, output.path);
					totalSize += output.size ?? 0;
				} else {
					totalSize += output.size ?? 0;
				}
			}
		} else {
			// Fallback: bundle individually
			await bundleIndividually(entrypoints, islandsOutDir, minify, islands, bundles);
		}
	} catch {
		console.error("Island bundle failed, trying individual bundles...");
		await bundleIndividually(entrypoints, islandsOutDir, minify, islands, bundles);
	}

	// Clean up temp files
	for (const f of tempFiles) {
		try {
			unlinkSync(f);
		} catch {
			// Ignore
		}
	}

	return { bundles, totalSize };
}

async function bundleIndividually(
	entrypoints: string[],
	outDir: string,
	minify: boolean,
	islands: Map<string, { filePath: string; name: string }>,
	bundles: Map<string, string>,
): Promise<void> {
	for (const entryPath of entrypoints) {
		const name = entryPath
			.replace(/\\/g, "/")
			.split("/")
			.pop()
			?.replace("_entry_", "")
			.replace(".tsx", "");
		if (!name || !islands.has(name)) continue;

		try {
			const r = await Bun.build({
				entrypoints: [entryPath],
				outdir: outDir,
				minify,
				target: "browser",
				naming: `${name}.js`,
			});
			if (r.success && r.outputs[0]) {
				bundles.set(name, r.outputs[0].path);
			}
		} catch {
			console.error(`Failed to bundle island "${name}"`);
		}
	}
}

/**
 * Rewrite an island source file for browser bundling.
 * Replaces `import { ... } from "virexjs"` with import from browser shim.
 */
function rewriteForBrowser(filePath: string, shimPath: string): string {
	let source: string;
	try {
		source = readFileSync(filePath, "utf-8");
	} catch {
		return "";
	}

	const shimImport = shimPath.replace(/\\/g, "/");

	// Replace all imports from "virexjs" with imports from the shim
	return source.replace(
		/import\s*\{([^}]+)\}\s*from\s*["']virexjs["'];?/g,
		`import { $1 } from "${shimImport}";`,
	);
}

/**
 * Generate browser-side shim for virexjs island APIs.
 * Provides useIslandState, useSharedStore, and shared store functions.
 */
function generateBrowserShim(): string {
	return `
// VirexJS Browser Shim — client-side implementations of island APIs
// This replaces server-side "virexjs" imports in bundled islands

// ─── Shared Store (cross-island communication) ─────────────────
const _state = (globalThis as any).__vrx_store ??= {};
const _subs = (globalThis as any).__vrx_subs ??= {} as Record<string, Array<() => void>>;
const _events = (globalThis as any).__vrx_events ??= {} as Record<string, Array<(d: any) => void>>;

export function getShared(key: string): unknown { return _state[key]; }

export function setShared(key: string, value: unknown): void {
  _state[key] = value;
  const subs = _subs[key];
  if (subs) for (const fn of subs) fn();
}

export function subscribeShared(key: string, cb: () => void): () => void {
  if (!_subs[key]) _subs[key] = [];
  _subs[key].push(cb);
  return () => { _subs[key] = (_subs[key] || []).filter((f: () => void) => f !== cb); };
}

export function emitIslandEvent(event: string, data?: unknown): void {
  const listeners = _events[event];
  if (listeners) for (const fn of listeners) fn(data);
}

export function onIslandEvent(event: string, cb: (d: unknown) => void): () => void {
  if (!_events[event]) _events[event] = [];
  _events[event].push(cb);
  return () => { _events[event] = (_events[event] || []).filter((f: (d: unknown) => void) => f !== cb); };
}

// Track which rerender functions are already subscribed to which keys
const _subbed = (globalThis as any).__vrx_subbed ??= new Set<string>();

export function useSharedStore(props: any) {
  const rerender = props._rerender;
  return {
    get: getShared,
    set: setShared,
    subscribe: (key: string) => {
      if (!rerender) return;
      // Dedup: don't subscribe same rerender to same key twice
      const id = key + ":" + (rerender.__vrx_id ??= Math.random().toString(36).slice(2));
      if (_subbed.has(id)) return;
      _subbed.add(id);
      subscribeShared(key, rerender);
    },
    emit: emitIslandEvent,
    on: onIslandEvent,
  };
}

// ─── Island State (per-island local state) ─────────────────────
export function useIslandState(props: any, defaults: Record<string, unknown>) {
  const hydrated = !!props._state;
  if (props._state) {
    for (const key of Object.keys(defaults)) {
      if (props._state[key] === undefined) {
        props._state[key] = props[key] !== undefined ? props[key] : defaults[key];
      }
    }
  }
  return {
    get(key: string) {
      if (props._state && key in props._state) return props._state[key];
      return props[key] !== undefined ? props[key] : defaults[key];
    },
    set(key: string, value: unknown) {
      if (props._state && props._rerender) { props._state[key] = value; props._rerender(); }
    },
    update(partial: Record<string, unknown>) {
      if (props._state && props._rerender) { Object.assign(props._state, partial); props._rerender(); }
    },
    hydrated,
  };
}

// ─── No-op exports for other virexjs imports ───────────────────
export function useHead() { return null; }
export function Head() { return null; }
export function Link(props: any) { return props; }
export function Image(props: any) { return props; }
export function ErrorBoundary(props: any) { return props.children; }
export function defineConfig(c: any) { return c; }
export function defineLoader(f: any) { return f; }
export function defineAPIRoute(f: any) { return f; }
export function defineMiddleware(f: any) { return f; }
`;
}

/**
 * Generate client-side mount entry for an island.
 * Uses safe DOM APIs (no innerHTML).
 */
function generateClientEntry(componentPath: string): string {
	const importPath = componentPath.replace(/\\/g, "/");

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

  // Single initial render (not two)
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
