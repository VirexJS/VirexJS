import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * `virex init` command:
 * Scaffold a new VirexJS project in the current directory.
 */
export async function init(args: string[]): Promise<void> {
	const projectName = args[0] ?? "my-virex-app";
	// Validate project name — prevent path traversal
	if (projectName.includes("..") || projectName.includes("/") || projectName.includes("\\")) {
		console.error('  Error: Project name must not contain "..", "/" or "\\".');
		process.exit(1);
	}
	const projectDir = join(process.cwd(), projectName);

	if (existsSync(projectDir)) {
		console.error(`  Error: Directory "${projectName}" already exists.`);
		process.exit(1);
	}

	console.log(`\n  ⚡ Creating VirexJS project: ${projectName}\n`);

	// Create directories
	const dirs = [
		"src/pages",
		"src/pages/blog",
		"src/components",
		"src/islands",
		"src/layouts",
		"src/api",
		"src/middleware",
		"public",
	];
	for (const dir of dirs) {
		mkdirSync(join(projectDir, dir), { recursive: true });
	}

	// package.json
	writeFile(
		projectDir,
		"package.json",
		JSON.stringify(
			{
				name: projectName,
				version: "0.1.0",
				type: "module",
				scripts: {
					dev: "virex dev",
					build: "virex build",
					preview: "virex preview",
				},
				dependencies: {
					virexjs: "^0.1.0",
				},
				devDependencies: {
					"@types/bun": "latest",
					typescript: "^5.7.0",
				},
			},
			null,
			2,
		),
	);

	// tsconfig.json
	writeFile(
		projectDir,
		"tsconfig.json",
		JSON.stringify(
			{
				compilerOptions: {
					target: "ESNext",
					module: "ESNext",
					moduleResolution: "bundler",
					jsx: "react-jsx",
					jsxImportSource: "virexjs",
					strict: true,
					noEmit: true,
					skipLibCheck: true,
				},
			},
			null,
			2,
		),
	);

	// virex.config.ts
	writeFile(
		projectDir,
		"virex.config.ts",
		`import { defineConfig } from "virexjs";

export default defineConfig({
\tport: 3000,
\trender: "server",
});
`,
	);

	// src/pages/index.tsx
	writeFile(
		projectDir,
		"src/pages/index.tsx",
		`import type { PageProps, MetaData } from "virexjs";

export function meta(): MetaData {
\treturn {
\t\ttitle: "${projectName}",
\t\tdescription: "Built with VirexJS — Ship HTML, not JavaScript.",
\t};
}

export default function Home(props: PageProps) {
\treturn (
\t\t<div style={{ maxWidth: "600px", margin: "80px auto", textAlign: "center", fontFamily: "system-ui" }}>
\t\t\t<h1>Welcome to VirexJS</h1>
\t\t\t<p style={{ color: "#666", fontSize: "18px" }}>
\t\t\t\tShip HTML, not JavaScript.
\t\t\t</p>
\t\t\t<p style={{ marginTop: "32px" }}>
\t\t\t\t<a href="/about" style={{ color: "#0066cc" }}>About</a>
\t\t\t</p>
\t\t</div>
\t);
}
`,
	);

	// src/pages/about.tsx
	writeFile(
		projectDir,
		"src/pages/about.tsx",
		`import type { MetaData } from "virexjs";

export function meta(): MetaData {
\treturn { title: "About — ${projectName}" };
}

export default function About() {
\treturn (
\t\t<div style={{ maxWidth: "600px", margin: "80px auto", fontFamily: "system-ui" }}>
\t\t\t<h1>About</h1>
\t\t\t<p>This is a VirexJS project.</p>
\t\t\t<a href="/" style={{ color: "#0066cc" }}>Home</a>
\t\t</div>
\t);
}
`,
	);

	// src/api/hello.ts
	writeFile(
		projectDir,
		"src/api/hello.ts",
		`import { defineAPIRoute } from "virexjs";

export const GET = defineAPIRoute(() => {
\treturn Response.json({ message: "Hello from VirexJS!", timestamp: Date.now() });
});
`,
	);

	// public/robots.txt
	writeFile(projectDir, "public/robots.txt", "User-agent: *\nAllow: /\n");

	// .gitignore
	writeFile(projectDir, ".gitignore", "node_modules\ndist\n.env\n*.log\n");

	console.log("  Created files:");
	console.log("    package.json");
	console.log("    tsconfig.json");
	console.log("    virex.config.ts");
	console.log("    src/pages/index.tsx");
	console.log("    src/pages/about.tsx");
	console.log("    src/api/hello.ts");
	console.log("    public/robots.txt");
	console.log("    .gitignore");
	console.log("");
	console.log("  Next steps:");
	console.log(`    cd ${projectName}`);
	console.log("    bun install");
	console.log("    bun run dev");
	console.log("");
}

function writeFile(dir: string, name: string, content: string): void {
	writeFileSync(join(dir, name), content, "utf-8");
}
