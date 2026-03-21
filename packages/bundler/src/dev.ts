import { type FSWatcher, watch } from "node:fs";
import { resolve } from "node:path";

/**
 * Start dev mode:
 * 1. Start file watcher on src/ directory (recursive)
 * 2. On file change: determine what changed, notify callback
 * 3. Track dependency graph: which pages use which components
 */
export function startDevMode(options: {
	srcDir: string;
	onFileChange: (filePath: string, event: string) => void;
}): { stop: () => void } {
	const srcDir = resolve(options.srcDir);
	let watcher: FSWatcher | null = null;

	try {
		watcher = watch(srcDir, { recursive: true }, (eventType, filename) => {
			if (!filename) return;

			// Ignore non-source files
			if (!filename.endsWith(".ts") && !filename.endsWith(".tsx") && !filename.endsWith(".css")) {
				return;
			}

			const filePath = resolve(srcDir, filename);
			options.onFileChange(filePath, eventType);
		});
	} catch (error) {
		console.error("Failed to start file watcher:", error);
	}

	return {
		stop: () => {
			watcher?.close();
		},
	};
}
