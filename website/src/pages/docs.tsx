import Layout from "../components/Layout";

export function meta() {
	return { title: "Documentation — VirexJS", description: "Getting started with VirexJS" };
}

export default function Docs() {
	const sections = [
		{
			title: "Getting Started",
			content: `bunx virexjs init my-app
cd my-app && bun install
bun run dev`,
		},
		{
			title: "Project Structure",
			content: `src/
  pages/           File-based routes
    _layout.tsx     Nested layout
    _loading.tsx    Loading state (streaming)
    _error.tsx      Error boundary
    _404.tsx        Custom 404
    index.tsx       \u2192 /
    blog/[slug].tsx \u2192 /blog/:slug
  islands/          Interactive components
  api/              API routes
  middleware/       Auto-loaded middleware
  components/       Server components`,
		},
		{
			title: "Pages & Routing",
			content: `// src/pages/blog/[slug].tsx
import type { PageProps, LoaderContext } from "virexjs";

export async function loader(ctx: LoaderContext) {
  return { post: await getPost(ctx.params.slug) };
}

export function meta({ data }) {
  return { title: data.post.title };
}

export default function BlogPost(props: PageProps) {
  return <h1>{props.data.post.title}</h1>;
}`,
		},
		{
			title: "Islands (Interactive Components)",
			content: `// src/islands/Counter.tsx
"use island";
import { useIslandState } from "virexjs";

export default function Counter(props) {
  const { get, set } = useIslandState(props, { count: 0 });
  return (
    <button onClick={() => set("count", get("count") + 1)}>
      Count: {get("count")}
    </button>
  );
}`,
		},
		{
			title: "Cross-Island Communication",
			content: `// CartButton island
"use island";
import { useSharedStore } from "virexjs";

export default function CartButton(props) {
  const store = useSharedStore(props);
  store.subscribe("cart.count");
  return (
    <button onClick={() =>
      store.set("cart.count", (store.get("cart.count") ?? 0) + 1)
    }>
      Add to Cart
    </button>
  );
}

// CartBadge island (SEPARATE island, auto-synced)
"use island";
import { useSharedStore } from "virexjs";

export default function CartBadge(props) {
  const store = useSharedStore(props);
  store.subscribe("cart.count");
  return <span>Cart: {store.get("cart.count") ?? 0}</span>;
}`,
		},
		{
			title: "API Routes",
			content: `// src/api/users.ts
import { json, notFound } from "virexjs";

export async function GET({ params }) {
  const users = await db.select("users").all();
  return json(users);
}

export async function POST({ request }) {
  const body = await request.json();
  return json({ created: true }, { status: 201 });
}`,
		},
		{
			title: "Middleware",
			content: `// src/middleware/auth.ts
import { defineMiddleware, redirect } from "virexjs";

export default defineMiddleware(async (ctx, next) => {
  if (!ctx.request.headers.get("Authorization")) {
    return redirect("/login");
  }
  return next();
});

// Per-route: src/pages/admin/_middleware.ts
// Built-in: cors(), rateLimit(), compress(), withETag()`,
		},
		{
			title: "Configuration",
			content: `// virex.config.ts
import { defineConfig } from "virexjs";

export default defineConfig({
  port: 3000,
  css: { engine: "tailwind" },
  redirects: [
    { source: "/old", destination: "/new", permanent: true },
  ],
});`,
		},
		{
			title: "CLI Commands",
			content: `virex init <name>     # Scaffold project
virex dev             # Dev server + HMR
virex build           # Production SSG build
virex preview         # Preview build
virex generate <type> # Scaffold page/component/api/island
virex check           # Validate project
virex info            # Show project stats`,
		},
	];

	return (
		<Layout title="Documentation — VirexJS">
			<section class="section">
				<div class="container">
					<h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "8px" }}>Documentation</h1>
					<p style={{ color: "#64748b", marginBottom: "40px", fontSize: "17px" }}>
						Everything you need to build with VirexJS.
					</p>

					{sections.map((s) => (
						<div style={{ marginBottom: "40px" }}>
							<h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "12px" }}>{s.title}</h2>
							<pre><code>{s.content}</code></pre>
						</div>
					))}

					<div style={{ marginTop: "40px", padding: "24px", background: "#eff6ff", borderRadius: "12px", border: "1px solid #bfdbfe" }}>
						<h3 style={{ margin: "0 0 8px", color: "#1e40af" }}>Full API Reference</h3>
						<p style={{ color: "#64748b", margin: "0 0 12px", fontSize: "14px" }}>
							75+ exports covering rendering, routing, auth, validation, i18n, real-time, and more.
						</p>
						<a href="https://github.com/VirexJS/VirexJS/blob/main/docs/api-reference.md" class="btn btn-primary" target="_blank" rel="noopener" style={{ fontSize: "14px", padding: "10px 20px" }}>
							View API Reference
						</a>
					</div>
				</div>
			</section>
		</Layout>
	);
}
