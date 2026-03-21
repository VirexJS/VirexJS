/**
 * Structured logger for VirexJS applications.
 *
 * Provides leveled logging with timestamps and optional context.
 * Only messages at or above the configured level are emitted.
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

export interface Logger {
	debug: (message: string, data?: Record<string, unknown>) => void;
	info: (message: string, data?: Record<string, unknown>) => void;
	warn: (message: string, data?: Record<string, unknown>) => void;
	error: (message: string, data?: Record<string, unknown>) => void;
	/** Create a child logger with extra context */
	child: (context: Record<string, unknown>) => Logger;
}

const LEVEL_VALUES: Record<LogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
	silent: 4,
};

/**
 * Create a structured logger.
 *
 * Usage:
 *   import { createLogger } from "virexjs";
 *
 *   const log = createLogger({ level: "info", prefix: "app" });
 *   log.info("Server started", { port: 3000 });
 *   log.error("Request failed", { path: "/api", status: 500 });
 *
 *   const dbLog = log.child({ module: "db" });
 *   dbLog.debug("Query executed", { table: "users", ms: 12 });
 */
export function createLogger(options?: {
	level?: LogLevel;
	prefix?: string;
	context?: Record<string, unknown>;
}): Logger {
	const { level = "info", prefix, context = {} } = options ?? {};
	const minLevel = LEVEL_VALUES[level];

	function log(
		logLevel: LogLevel,
		message: string,
		data?: Record<string, unknown>,
	): void {
		if (LEVEL_VALUES[logLevel] < minLevel) return;

		const timestamp = new Date().toISOString();
		const tag = prefix ? `[${prefix}]` : "";
		const levelTag = logLevel.toUpperCase().padEnd(5);

		const extra = { ...context, ...data };
		const extraStr = Object.keys(extra).length > 0
			? ` ${JSON.stringify(extra)}`
			: "";

		const output = `${timestamp} ${levelTag} ${tag} ${message}${extraStr}`.trim();

		if (logLevel === "error") {
			console.error(output);
		} else if (logLevel === "warn") {
			console.warn(output);
		} else {
			console.log(output);
		}
	}

	return {
		debug: (msg, data) => log("debug", msg, data),
		info: (msg, data) => log("info", msg, data),
		warn: (msg, data) => log("warn", msg, data),
		error: (msg, data) => log("error", msg, data),
		child: (childContext) =>
			createLogger({
				level,
				prefix,
				context: { ...context, ...childContext },
			}),
	};
}
