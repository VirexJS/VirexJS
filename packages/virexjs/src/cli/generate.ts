import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * `virex generate` command — scaffold pages, components, API routes, and middleware.
 *
 * Usage:
 *   virex generate page about
 *   virex generate page blog/[slug]
 *   virex generate component Header
 *   virex generate api users
 *   virex generate middleware auth
 *   virex generate island Counter
 */
export async function generate(args: string[]): Promise<void> {
	const type = args[0];
	const name = args[1];

	if (!type || !name) {
		console.log(`
  Usage: virex generate <type> <name>

  Types:
    page        Generate a page component (src/pages/)
    component   Generate a component (src/components/)
    api         Generate an API route (src/api/)
    middleware  Generate a middleware (src/middleware/)
    island      Generate an island component (src/islands/)
`);
		return;
	}

	const cwd = process.cwd();

	switch (type) {
		case "page":
			generatePage(cwd, name);
			break;
		case "component":
			generateComponent(cwd, name);
			break;
		case "api":
			generateAPI(cwd, name);
			break;
		case "middleware":
			generateMiddleware(cwd, name);
			break;
		case "island":
			generateIsland(cwd, name);
			break;
		default:
			console.error(`  Unknown type: "${type}". Use: page, component, api, middleware, island`);
	}
}

function generatePage(cwd: string, name: string): void {
	const filePath = join(cwd, "src", "pages", `${name}.tsx`);
	if (guardExists(filePath)) return;

	const componentName = toComponentName(name);
	const content = `import type { PageProps, LoaderContext } from "virexjs";
import { useHead } from "virexjs";

export async function loader(_ctx: LoaderContext) {
\treturn {};
}

export default function ${componentName}(props: PageProps) {
\tconst head = useHead({
\t\ttitle: "${componentName}",
\t});

\treturn (
\t\t<div>
\t\t\t{head}
\t\t\t<h1>${componentName}</h1>
\t\t</div>
\t);
}
`;
	writeFileSafe(filePath, content);
	console.log(`  Created page: src/pages/${name}.tsx`);
}

function generateComponent(cwd: string, name: string): void {
	const filePath = join(cwd, "src", "components", `${name}.tsx`);
	if (guardExists(filePath)) return;

	const content = `interface ${name}Props {
\tchildren?: unknown;
}

export default function ${name}(props: ${name}Props) {
\treturn (
\t\t<div>
\t\t\t{props.children}
\t\t</div>
\t);
}
`;
	writeFileSafe(filePath, content);
	console.log(`  Created component: src/components/${name}.tsx`);
}

function generateAPI(cwd: string, name: string): void {
	const filePath = join(cwd, "src", "api", `${name}.ts`);
	if (guardExists(filePath)) return;

	const content = `import { defineAPIRoute, json } from "virexjs";

export const GET = defineAPIRoute(({ params }) => {
\treturn json({ message: "Hello from ${name}" });
});

export const POST = defineAPIRoute(async ({ request }) => {
\tconst body = await request.json();
\treturn json({ received: true }, { status: 201 });
});
`;
	writeFileSafe(filePath, content);
	console.log(`  Created API route: src/api/${name}.ts`);
}

function generateMiddleware(cwd: string, name: string): void {
	const filePath = join(cwd, "src", "middleware", `${name}.ts`);
	if (guardExists(filePath)) return;

	const content = `import { defineMiddleware } from "virexjs";

export default defineMiddleware(async (ctx, next) => {
\t// Add your ${name} middleware logic here
\treturn next();
});
`;
	writeFileSafe(filePath, content);
	console.log(`  Created middleware: src/middleware/${name}.ts`);
}

function generateIsland(cwd: string, name: string): void {
	const filePath = join(cwd, "src", "islands", `${name}.tsx`);
	if (guardExists(filePath)) return;

	const content = `// "use island"

interface ${name}Props {
\tinitial?: number;
}

export default function ${name}(props: ${name}Props) {
\tconst value = props.initial ?? 0;

\treturn (
\t\t<div data-island="${name}">
\t\t\t<span>{value}</span>
\t\t</div>
\t);
}
`;
	writeFileSafe(filePath, content);
	console.log(`  Created island: src/islands/${name}.tsx`);
}

function guardExists(filePath: string): boolean {
	if (existsSync(filePath)) {
		console.error(`  Error: File already exists: ${filePath}`);
		return true;
	}
	return false;
}

function writeFileSafe(filePath: string, content: string): void {
	mkdirSync(dirname(filePath), { recursive: true });
	writeFileSync(filePath, content, "utf-8");
}

function toComponentName(name: string): string {
	// "blog/[slug]" → "BlogSlug", "about" → "About"
	return name
		.split(/[/\-_]/)
		.map((part) => {
			const clean = part.replace(/[[\].]/g, "");
			return clean.charAt(0).toUpperCase() + clean.slice(1);
		})
		.join("");
}
