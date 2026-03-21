/**
 * Parse CLI arguments into a key-value map.
 * Supports: --port 3000, --host 0.0.0.0, --no-hmr, --open
 */
export function parseArgs(args: string[]): Record<string, string | boolean> {
	const result: Record<string, string | boolean> = {};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i]!;

		if (arg.startsWith("--no-")) {
			result[arg.slice(5)] = false;
			continue;
		}

		if (arg.startsWith("--")) {
			const key = arg.slice(2);
			const next = args[i + 1];

			if (next && !next.startsWith("--")) {
				result[key] = next;
				i++;
			} else {
				result[key] = true;
			}
			continue;
		}

		if (arg.startsWith("-") && arg.length === 2) {
			const shortFlags: Record<string, string> = {
				p: "port",
				h: "host",
				o: "open",
			};
			const key = shortFlags[arg[1]!] ?? arg[1]!;
			const next = args[i + 1];

			if (next && !next.startsWith("-")) {
				result[key] = next;
				i++;
			} else {
				result[key] = true;
			}
		}
	}

	return result;
}
