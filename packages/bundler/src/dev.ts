import { type FSWatcher, watch } from "node:fs";
import { resolve } from "node:path";

/**
 * Start dev mode:
 * 1. Start file watcher on src/ directory (recursive)
 * 2. On file change: debounce rapid events, notify callback
 * 3. Group rapid changes into a single notification
 *
 * File system watchers often fire multiple events for a single save.
 * The debounce window (100ms default) coalesces these into one callback.
 */
export function startDevMode(options: {
	srcDir: string;
	onFileChange: (filePath: string, event: string) => void;
	/** Debounce interval in ms (default: 100) */
	debounceMs?: number;
}): { stop: () => void } {
	const srcDir = resolve(options.srcDir);
	const debounceMs = options.debounceMs ?? 100;
	let watcher: FSWatcher | null = null;

	// Debounce: collect changes, fire callback after quiet period
	const pendingChanges = new Map<string, string>();
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function flushChanges(): void {
		const changes = new Map(pendingChanges);
		pendingChanges.clear();
		for (const [filePath, event] of changes) {
			options.onFileChange(filePath, event);
		}
	}

	try {
		watcher = watch(srcDir, { recursive: true }, (eventType, filename) => {
			if (!filename) return;

			// Ignore non-source files
			if (!filename.endsWith(".ts") && !filename.endsWith(".tsx") && !filename.endsWith(".css")) {
				return;
			}

			const filePath = resolve(srcDir, filename);
			pendingChanges.set(filePath, eventType);

			// Reset debounce timer
			if (debounceTimer) clearTimeout(debounceTimer);
			debounceTimer = setTimeout(flushChanges, debounceMs);
		});
	} catch (error) {
		console.error("Failed to start file watcher:", error);
	}

	return {
		stop: () => {
			if (debounceTimer) clearTimeout(debounceTimer);
			watcher?.close();
		},
	};
}
