import { join } from "node:path";

export interface BuildManifest {
	version: string;
	timestamp: number;
	pages: string[];
	assets: Record<string, string>;
	css?: string;
}

/**
 * Generate and write a build manifest file.
 */
export async function writeBuildManifest(outDir: string, manifest: BuildManifest): Promise<void> {
	const manifestPath = join(outDir, "manifest.json");
	await Bun.write(manifestPath, JSON.stringify(manifest, null, 2));
}
