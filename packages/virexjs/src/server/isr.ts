/**
 * Incremental Static Regeneration (ISR) for VirexJS.
 *
 * Dual-layer cache: in-memory (fast) + disk (survives restart).
 * Stale-while-revalidate pattern.
 */

import { createHash } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";

interface ISREntry {
	html: string;
	headers: Record<string, string>;
	status: number;
	createdAt: number;
	revalidateAfter: number;
	revalidating: boolean;
}

// In-memory cache (fast layer)
const memCache = new Map<string, ISREntry>();

// Disk cache directory
let diskCacheDir: string | null = null;

/** Initialize disk cache directory */
export function initISRDiskCache(cacheDir: string): void {
	diskCacheDir = cacheDir;
	mkdirSync(cacheDir, { recursive: true });
}

/**
 * Get a cached response. Checks memory first, then disk.
 */
export function getISRCache(path: string): Response | null {
	// Memory cache (fast)
	let entry: ISREntry | null = memCache.get(path) ?? null;

	// Disk fallback (survives restart)
	if (!entry && diskCacheDir) {
		entry = readDiskCache(path);
		if (entry) memCache.set(path, entry); // promote to memory
	}

	if (!entry) return null;

	const now = Date.now();
	const isStale = now >= entry.revalidateAfter;

	return new Response(entry.html, {
		status: entry.status,
		headers: {
			"Content-Type": "text/html; charset=utf-8",
			...entry.headers,
			"X-VirexJS-Cache": isStale ? "STALE" : "HIT",
			"X-VirexJS-Age": String(Math.round((now - entry.createdAt) / 1000)),
		},
	});
}

export function needsRevalidation(path: string): boolean {
	const entry = memCache.get(path);
	if (!entry) return false;
	if (entry.revalidating) return false;
	return Date.now() >= entry.revalidateAfter;
}

export function markRevalidating(path: string): void {
	const entry = memCache.get(path);
	if (entry) entry.revalidating = true;
}

/**
 * Store in both memory and disk cache.
 */
export function setISRCache(
	path: string,
	html: string,
	revalidateSeconds: number,
	status = 200,
	headers: Record<string, string> = {},
): void {
	const entry: ISREntry = {
		html,
		headers,
		status,
		createdAt: Date.now(),
		revalidateAfter: Date.now() + revalidateSeconds * 1000,
		revalidating: false,
	};

	memCache.set(path, entry);

	// Write to disk for persistence
	if (diskCacheDir) {
		writeDiskCache(path, entry);
	}
}

export function invalidateISR(pathOrPattern: string | RegExp): number {
	let count = 0;

	if (typeof pathOrPattern === "string") {
		if (memCache.delete(pathOrPattern)) count++;
		if (diskCacheDir) deleteDiskCache(pathOrPattern);
	} else {
		for (const key of memCache.keys()) {
			if (pathOrPattern.test(key)) {
				memCache.delete(key);
				if (diskCacheDir) deleteDiskCache(key);
				count++;
			}
		}
	}

	return count;
}

export function getISRStats(): { entries: number; paths: string[]; diskEnabled: boolean } {
	return {
		entries: memCache.size,
		paths: Array.from(memCache.keys()),
		diskEnabled: diskCacheDir !== null,
	};
}

// ─── Disk cache helpers ─────────────────────────────────────────────────────

function cacheKey(path: string): string {
	return createHash("md5").update(path).digest("hex");
}

function writeDiskCache(path: string, entry: ISREntry): void {
	if (!diskCacheDir) return;
	try {
		const file = join(diskCacheDir, `${cacheKey(path)}.json`);
		writeFileSync(file, JSON.stringify({ path, ...entry }), "utf-8");
	} catch {
		// Disk write failed — memory cache still works
	}
}

function readDiskCache(path: string): ISREntry | null {
	if (!diskCacheDir) return null;
	try {
		const file = join(diskCacheDir, `${cacheKey(path)}.json`);
		if (!existsSync(file)) return null;
		const data = JSON.parse(readFileSync(file, "utf-8"));
		return {
			html: data.html,
			headers: data.headers ?? {},
			status: data.status ?? 200,
			createdAt: data.createdAt ?? 0,
			revalidateAfter: data.revalidateAfter ?? 0,
			revalidating: false,
		};
	} catch {
		return null;
	}
}

function deleteDiskCache(path: string): void {
	if (!diskCacheDir) return;
	try {
		const file = join(diskCacheDir, `${cacheKey(path)}.json`);
		if (existsSync(file)) unlinkSync(file);
	} catch {
		// Ignore
	}
}
