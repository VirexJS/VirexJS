import { afterEach, describe, expect, test } from "bun:test";
import { createScheduler } from "../src/server/scheduler";

describe("createScheduler", () => {
	let scheduler = createScheduler();

	afterEach(() => {
		scheduler.stop();
		scheduler = createScheduler();
	});

	test("schedules a task", async () => {
		let count = 0;
		scheduler.every(50, "counter", () => {
			count++;
		});
		await new Promise((r) => setTimeout(r, 130));
		expect(count).toBeGreaterThanOrEqual(2);
	});

	test("parses interval strings", () => {
		const task = scheduler.every("1s", "test-parse", () => {});
		expect(task.intervalMs).toBe(1000);
	});

	test("tasks() returns all tasks", () => {
		scheduler.every(1000, "a", () => {});
		scheduler.every(2000, "b", () => {});
		expect(scheduler.tasks()).toHaveLength(2);
	});

	test("get() returns task by name", () => {
		scheduler.every(1000, "findme", () => {});
		expect(scheduler.get("findme")).toBeDefined();
		expect(scheduler.get("nope")).toBeUndefined();
	});

	test("cancel() stops specific task", () => {
		scheduler.every(1000, "cancelme", () => {});
		expect(scheduler.cancel("cancelme")).toBe(true);
		expect(scheduler.cancel("nope")).toBe(false);
		expect(scheduler.tasks()).toHaveLength(0);
	});

	test("stop() clears all tasks", () => {
		scheduler.every(1000, "x", () => {});
		scheduler.every(1000, "y", () => {});
		scheduler.stop();
		expect(scheduler.tasks()).toHaveLength(0);
	});

	test("tracks runCount and lastRun", async () => {
		scheduler.every(50, "tracked", () => {});
		await new Promise((r) => setTimeout(r, 80));
		const task = scheduler.get("tracked")!;
		expect(task.runCount).toBeGreaterThanOrEqual(1);
		expect(task.lastRun).not.toBeNull();
	});

	test("replaces task with same name", () => {
		scheduler.every(1000, "dup", () => {});
		scheduler.every(2000, "dup", () => {});
		expect(scheduler.tasks()).toHaveLength(1);
		expect(scheduler.get("dup")!.intervalMs).toBe(2000);
	});

	test("throws on invalid interval string", () => {
		expect(() => scheduler.every("invalid", "bad", () => {})).toThrow("Invalid interval");
	});
});
