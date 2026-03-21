import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * `virex create` — interactive project wizard.
 *
 * Usage:
 *   virex create              → interactive prompts
 *   virex create my-app       → skip name prompt
 *   virex create my-app --template blog
 */

interface ProjectConfig {
	name: string;
	template: "minimal" | "blog" | "dashboard" | "api";
	features: {
		auth: boolean;
		db: boolean;
		i18n: boolean;
	};
}

export async function create(args: string[]): Promise<void> {
	console.log("\n  ⚡ VirexJS Project Creator\n");

	const name = args[0] ?? (await ask("Project name", "my-virex-app"));

	// Validate name
	if (name.includes("..") || name.includes("/") || name.includes("\\")) {
		console.error('  Error: Invalid project name. No "..", "/" or "\\" allowed.');
		process.exit(1);
	}

	const projectDir = join(process.cwd(), name);
	if (existsSync(projectDir)) {
		console.error(`  Error: Directory "${name}" already exists.`);
		process.exit(1);
	}

	// Parse template from args or ask
	const templateArg = args.find((a) => a.startsWith("--template="))?.split("=")[1];
	const template = (templateArg ??
		(await ask("Template (minimal/blog/dashboard/api)", "minimal"))) as ProjectConfig["template"];

	// Features
	const useAuth =
		args.includes("--auth") ||
		(await askYesNo("Include authentication (JWT + sessions)?", template === "dashboard"));
	const useDB =
		args.includes("--db") || (await askYesNo("Include database (SQLite)?", template !== "minimal"));
	const useI18n =
		args.includes("--i18n") || (await askYesNo("Include i18n (internationalization)?", false));

	const config: ProjectConfig = {
		name,
		template,
		features: { auth: useAuth, db: useDB, i18n: useI18n },
	};

	console.log(`\n  Creating ${name} with template: ${template}...`);

	scaffold(projectDir, config);

	console.log(`
  ✓ Project created!

  Next steps:
    cd ${name}
    bun install
    bun run dev

  Open http://localhost:3000
`);
}

function scaffold(dir: string, config: ProjectConfig): void {
	// Core directories
	const dirs = [
		"src/pages",
		"src/components",
		"src/layouts",
		"src/islands",
		"src/api",
		"src/middleware",
		"public",
	];
	if (config.features.db) dirs.push("src/db");
	for (const d of dirs) mkdirSync(join(dir, d), { recursive: true });

	// package.json
	const deps: Record<string, string> = { virexjs: "^0.1.0" };
	if (config.features.db) deps["@virexjs/db"] = "^0.1.0";

	writeFile(
		dir,
		"package.json",
		JSON.stringify(
			{
				name: config.name,
				version: "0.1.0",
				type: "module",
				scripts: { dev: "virex dev", build: "virex build", preview: "virex preview" },
				dependencies: deps,
				devDependencies: { "@types/bun": "latest", typescript: "^5.7.0" },
			},
			null,
			2,
		),
	);

	// tsconfig.json
	writeFile(
		dir,
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
	const configImports = ['import { defineConfig } from "virexjs";'];
	const configBody: string[] = ["\tport: 3000,", '\trender: "server",'];

	writeFile(
		dir,
		"virex.config.ts",
		`${configImports.join("\n")}

export default defineConfig({
${configBody.join("\n")}
});
`,
	);

	// .env
	writeFile(
		dir,
		".env",
		`PORT=3000
${config.features.auth ? "JWT_SECRET=change-me-in-production" : ""}
${config.features.db ? "DATABASE_URL=sqlite:./data/app.db" : ""}
`,
	);

	// .gitignore
	writeFile(dir, ".gitignore", "node_modules\ndist\n.env.local\n*.log\nbun.lockb\n");

	// Layout
	writeFile(
		dir,
		"src/layouts/Default.tsx",
		`export default function Default(props: { children: unknown }) {
\treturn (
\t\t<div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 16px", fontFamily: "system-ui" }}>
\t\t\t<header style={{ borderBottom: "1px solid #eee", padding: "16px 0" }}>
\t\t\t\t<a href="/" style={{ fontWeight: "bold", fontSize: "18px", textDecoration: "none", color: "#111" }}>
\t\t\t\t\t${config.name}
\t\t\t\t</a>
\t\t\t</header>
\t\t\t<main style={{ padding: "24px 0" }}>{props.children}</main>
\t\t\t<footer style={{ borderTop: "1px solid #eee", padding: "16px 0", color: "#999", fontSize: "13px" }}>
\t\t\t\tBuilt with VirexJS
\t\t\t</footer>
\t\t</div>
\t);
}
`,
	);

	// Template-specific pages
	switch (config.template) {
		case "minimal":
			scaffoldMinimal(dir, config);
			break;
		case "blog":
			scaffoldBlog(dir, config);
			break;
		case "dashboard":
			scaffoldDashboard(dir, config);
			break;
		case "api":
			scaffoldAPI(dir, config);
			break;
	}

	// Common files
	writeFile(dir, "public/robots.txt", "User-agent: *\nAllow: /\n");

	// Auth middleware
	if (config.features.auth) {
		writeFile(
			dir,
			"src/api/auth.ts",
			`import { defineAPIRoute, json, createJWT, verifyJWT } from "virexjs";

export const POST = defineAPIRoute(async ({ request }) => {
\tconst { email, password } = await request.json();
\t// TODO: validate credentials against your database
\tconst token = await createJWT({ email }, process.env.JWT_SECRET ?? "secret", { expiresIn: 86400 });
\treturn json({ token });
});
`,
		);
	}

	// DB setup
	if (config.features.db) {
		writeFile(
			dir,
			"src/db/schema.ts",
			`import { defineTable } from "@virexjs/db";

export const posts = defineTable("posts", {
\tid: "integer primary key autoincrement",
\ttitle: "text not null",
\tcontent: "text not null default ''",
\tpublished: "integer not null default 0",
\tcreated_at: "text not null",
});
`,
		);
	}

	// i18n setup
	if (config.features.i18n) {
		writeFile(
			dir,
			"src/i18n.ts",
			`import { createI18n, defineTranslations } from "virexjs";

const en = defineTranslations({
\twelcome: "Welcome to ${config.name}",
\tdescription: "Built with VirexJS",
});

const tr = defineTranslations({
\twelcome: "${config.name}'e hosgeldiniz",
\tdescription: "VirexJS ile yapildi",
});

export const i18n = createI18n({ defaultLocale: "en", locales: { en, tr } });
`,
		);
	}

	console.log(`  Created ${countFiles(dir)} files`);
}

function scaffoldMinimal(dir: string, config: ProjectConfig): void {
	writeFile(
		dir,
		"src/pages/index.tsx",
		`import type { PageProps } from "virexjs";
import { useHead } from "virexjs";
import Default from "../layouts/Default";

export default function Home(_props: PageProps) {
\tconst head = useHead({ title: "${config.name}" });
\treturn (
\t\t<Default>
\t\t\t{head}
\t\t\t<h1>Welcome to ${config.name}</h1>
\t\t\t<p>Edit <code>src/pages/index.tsx</code> to get started.</p>
\t\t</Default>
\t);
}
`,
	);
}

function scaffoldBlog(dir: string, config: ProjectConfig): void {
	mkdirSync(join(dir, "src/pages/blog"), { recursive: true });

	writeFile(
		dir,
		"src/pages/index.tsx",
		`import type { PageProps, LoaderContext } from "virexjs";
import { useHead, Link } from "virexjs";
import Default from "../layouts/Default";

export async function loader(_ctx: LoaderContext) {
\treturn { posts: [
\t\t{ slug: "hello-world", title: "Hello World", date: "2024-01-15" },
\t\t{ slug: "getting-started", title: "Getting Started", date: "2024-01-10" },
\t]};
}

export default function Home(props: PageProps<{ posts: { slug: string; title: string; date: string }[] }>) {
\tconst head = useHead({ title: "${config.name}" });
\treturn (
\t\t<Default>
\t\t\t{head}
\t\t\t<h1>${config.name}</h1>
\t\t\t{props.data.posts.map(p => (
\t\t\t\t<article style={{ marginBottom: "16px", padding: "16px", border: "1px solid #eee", borderRadius: "8px" }}>
\t\t\t\t\t<Link href={"/blog/" + p.slug}><h2 style={{ margin: 0 }}>{p.title}</h2></Link>
\t\t\t\t\t<time style={{ color: "#999" }}>{p.date}</time>
\t\t\t\t</article>
\t\t\t))}
\t\t</Default>
\t);
}
`,
	);

	writeFile(
		dir,
		"src/pages/blog/[slug].tsx",
		`import type { PageProps, LoaderContext } from "virexjs";
import { useHead } from "virexjs";
import Default from "../../layouts/Default";

export function getStaticPaths() {
\treturn [{ params: { slug: "hello-world" } }, { params: { slug: "getting-started" } }];
}

export async function loader(ctx: LoaderContext) {
\treturn { title: ctx.params.slug?.replace(/-/g, " ") ?? "Post", content: "Blog post content here." };
}

export default function BlogPost(props: PageProps<{ title: string; content: string }>) {
\tconst head = useHead({ title: props.data.title, og: { title: props.data.title, type: "article" } });
\treturn (
\t\t<Default>
\t\t\t{head}
\t\t\t<article>
\t\t\t\t<h1>{props.data.title}</h1>
\t\t\t\t<p>{props.data.content}</p>
\t\t\t\t<a href="/">Back</a>
\t\t\t</article>
\t\t</Default>
\t);
}
`,
	);
}

function scaffoldDashboard(dir: string, config: ProjectConfig): void {
	mkdirSync(join(dir, "src/pages/dashboard"), { recursive: true });

	writeFile(
		dir,
		"src/pages/index.tsx",
		`import type { PageProps } from "virexjs";
import { useHead, Link } from "virexjs";
import Default from "../layouts/Default";

export default function Home(_props: PageProps) {
\tconst head = useHead({ title: "${config.name}" });
\treturn (
\t\t<Default>
\t\t\t{head}
\t\t\t<h1>${config.name}</h1>
\t\t\t<Link href="/dashboard">Go to Dashboard</Link>
\t\t</Default>
\t);
}
`,
	);

	writeFile(
		dir,
		"src/pages/dashboard/index.tsx",
		`import type { PageProps } from "virexjs";
import { useHead } from "virexjs";
import Default from "../../layouts/Default";

export default function Dashboard(_props: PageProps) {
\tconst head = useHead({ title: "Dashboard" });
\treturn (
\t\t<Default>
\t\t\t{head}
\t\t\t<h1>Dashboard</h1>
\t\t\t<p>Your admin panel goes here.</p>
\t\t</Default>
\t);
}
`,
	);

	writeFile(
		dir,
		"src/pages/dashboard/_layout.tsx",
		`export default function DashLayout(props: { children: unknown }) {
\treturn (
\t\t<div>
\t\t\t<nav style={{ background: "#1e293b", color: "#fff", padding: "8px 16px", fontSize: "14px" }}>
\t\t\t\t<a href="/dashboard" style={{ color: "#93c5fd", marginRight: "16px" }}>Dashboard</a>
\t\t\t\t<a href="/" style={{ color: "#93c5fd" }}>Home</a>
\t\t\t</nav>
\t\t\t{props.children}
\t\t</div>
\t);
}
`,
	);
}

function scaffoldAPI(dir: string, _config: ProjectConfig): void {
	writeFile(
		dir,
		"src/pages/index.tsx",
		`import type { PageProps } from "virexjs";
import { useHead } from "virexjs";
import Default from "../layouts/Default";

export default function Home(_props: PageProps) {
\tconst head = useHead({ title: "API Server" });
\treturn (
\t\t<Default>
\t\t\t{head}
\t\t\t<h1>API Server</h1>
\t\t\t<p>Endpoints:</p>
\t\t\t<ul>
\t\t\t\t<li><a href="/api/hello">GET /api/hello</a></li>
\t\t\t\t<li><a href="/api/health">GET /api/health</a></li>
\t\t\t</ul>
\t\t</Default>
\t);
}
`,
	);

	writeFile(
		dir,
		"src/api/hello.ts",
		`import { defineAPIRoute, json } from "virexjs";

export const GET = defineAPIRoute(() => {
\treturn json({ message: "Hello from VirexJS!", timestamp: Date.now() });
});
`,
	);

	writeFile(
		dir,
		"src/api/health.ts",
		`import { defineAPIRoute, json } from "virexjs";

export const GET = defineAPIRoute(() => {
\treturn json({ status: "healthy", uptime: Math.round(process.uptime()) });
});
`,
	);
}

function writeFile(dir: string, name: string, content: string): void {
	writeFileSync(join(dir, name), content, "utf-8");
}

function countFiles(dir: string): number {
	const { readdirSync, statSync } = require("node:fs");
	let count = 0;
	try {
		for (const entry of readdirSync(dir)) {
			const full = join(dir, entry);
			try {
				if (statSync(full).isDirectory()) count += countFiles(full);
				else count++;
			} catch {}
		}
	} catch {
		/* */
	}
	return count;
}

async function ask(question: string, defaultValue: string): Promise<string> {
	process.stdout.write(`  ${question} (${defaultValue}): `);
	const line = await readLine();
	return line.trim() || defaultValue;
}

async function askYesNo(question: string, defaultValue: boolean): Promise<boolean> {
	const def = defaultValue ? "Y/n" : "y/N";
	process.stdout.write(`  ${question} (${def}): `);
	const line = await readLine();
	if (!line.trim()) return defaultValue;
	return line.trim().toLowerCase().startsWith("y");
}

function readLine(): Promise<string> {
	return new Promise((resolve) => {
		let data = "";
		process.stdin.setEncoding("utf-8");
		process.stdin.once("data", (chunk: string) => {
			data = chunk;
			resolve(data);
		});
		process.stdin.resume();
	});
}
