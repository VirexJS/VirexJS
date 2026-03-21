/**
 * Simple task scheduler for VirexJS — cron-like background jobs.
 *
 * No external dependencies. Runs periodic tasks in the server process.
 *
 * Usage:
 *   import { createScheduler } from "virexjs";
 *
 *   const scheduler = createScheduler();
 *
 *   scheduler.every("5m", "cleanup", async () => {
 *     await db.run("DELETE FROM sessions WHERE expired < datetime('now')");
 *   });
 *
 *   scheduler.every("1h", "report", async () => {
 *     console.log("Hourly stats:", await getStats());
 *   });
 *
 *   scheduler.stop(); // cleanup on shutdown
 */

export interface ScheduledTask {
	name: string;
	intervalMs: number;
	fn: () => void | Promise<void>;
	timer: ReturnType<typeof setInterval> | null;
	lastRun: number | null;
	runCount: number;
}

export interface Scheduler {
	/** Run a task at the given interval. Returns the task. */
	every: (interval: string | number, name: string, fn: () => void | Promise<void>) => ScheduledTask;
	/** Stop all scheduled tasks */
	stop: () => void;
	/** Stop a specific task by name */
	cancel: (name: string) => boolean;
	/** List all tasks */
	tasks: () => ScheduledTask[];
	/** Get task by name */
	get: (name: string) => ScheduledTask | undefined;
}

/**
 * Create a task scheduler.
 */
export function createScheduler(): Scheduler {
	const tasks = new Map<string, ScheduledTask>();

	return {
		every(interval, name, fn) {
			// Cancel existing task with same name
			const existing = tasks.get(name);
			if (existing?.timer) clearInterval(existing.timer);

			const intervalMs = typeof interval === "number" ? interval : parseInterval(interval);

			const task: ScheduledTask = {
				name,
				intervalMs,
				fn,
				timer: null,
				lastRun: null,
				runCount: 0,
			};

			task.timer = setInterval(async () => {
				try {
					task.lastRun = Date.now();
					task.runCount++;
					await fn();
				} catch (err) {
					console.error(`[scheduler] Task "${name}" failed:`, err);
				}
			}, intervalMs);

			tasks.set(name, task);
			return task;
		},

		stop() {
			for (const task of tasks.values()) {
				if (task.timer) clearInterval(task.timer);
				task.timer = null;
			}
			tasks.clear();
		},

		cancel(name) {
			const task = tasks.get(name);
			if (!task) return false;
			if (task.timer) clearInterval(task.timer);
			tasks.delete(name);
			return true;
		},

		tasks() {
			return Array.from(tasks.values());
		},

		get(name) {
			return tasks.get(name);
		},
	};
}

/** Parse interval string: "5s", "30m", "1h", "1d" */
function parseInterval(str: string): number {
	const match = str.match(/^(\d+)(s|m|h|d)$/);
	if (!match) throw new Error(`Invalid interval: "${str}". Use: 5s, 30m, 1h, 1d`);

	const value = Number.parseInt(match[1]!, 10);
	const unit = match[2]!;

	switch (unit) {
		case "s":
			return value * 1000;
		case "m":
			return value * 60 * 1000;
		case "h":
			return value * 60 * 60 * 1000;
		case "d":
			return value * 24 * 60 * 60 * 1000;
		default:
			throw new Error(`Unknown unit: ${unit}`);
	}
}
