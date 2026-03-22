import Layout from "../components/Layout";

export function meta() {
	return {
		title: "VirexJS — Ship HTML, not JavaScript",
		description: "A full-stack web framework built on Bun. Zero dependencies, islands architecture, 1098 tests.",
		og: { title: "VirexJS", description: "Ship HTML, not JavaScript.", type: "website" },
	};
}

export default function Home() {
	return (
		<Layout>
			{/* Hero */}
			<section class="hero">
				<span class="hero-badge">v0.2.0 — 1098 Tests Passing</span>
				<h1>
					Ship <span>HTML</span>,<br />not JavaScript.
				</h1>
				<p>
					A full-stack web framework built on Bun. Zero client JS by default, islands
					architecture, and built-in everything — with zero external dependencies.
				</p>
				<div class="hero-buttons">
					<a href="/docs" class="btn btn-primary">Get Started</a>
					<a href="https://github.com/VirexJS/VirexJS" class="btn btn-secondary" target="_blank" rel="noopener">
						GitHub
					</a>
				</div>
			</section>

			{/* Stats */}
			<div class="container">
				<div class="stats">
					{[
						{ value: "1098", label: "Tests" },
						{ value: "0", label: "Dependencies" },
						{ value: "27ms", label: "Startup" },
						{ value: "75+", label: "Exports" },
					].map((s) => (
						<div class="stat">
							<div class="stat-value">{s.value}</div>
							<div class="stat-label">{s.label}</div>
						</div>
					))}
				</div>
			</div>

			{/* Quick Start */}
			<section class="section">
				<div class="container">
					<h2>Quick Start</h2>
					<p class="subtitle">Up and running in 30 seconds</p>
					<div class="code-block">
						<div class="code-header">terminal</div>
						<pre><code>{`bunx virexjs init my-app
cd my-app && bun install
bun run dev

# Open http://localhost:3000`}</code></pre>
					</div>
				</div>
			</section>

			{/* Features */}
			<section class="section section-alt">
				<div class="container">
					<h2>Features</h2>
					<p class="subtitle">Everything you need, nothing you don't</p>
					<div class="features">
						{[
							{
								title: "Zero Client JS",
								desc: "Pages ship pure HTML. No React runtime, no hydration overhead. Only islands ship JavaScript.",
							},
							{
								title: "Islands Architecture",
								desc: "Interactive components hydrate independently. Shared store for cross-island communication.",
							},
							{
								title: "File-Based Routing",
								desc: "[slug] params, [...rest] catch-all, (group) routes, nested layouts, loading states.",
							},
							{
								title: "Built-in Auth",
								desc: "JWT (HS256), cookie sessions, route guards, CSRF protection. No external packages.",
							},
							{
								title: "SQLite Database",
								desc: "Typed CRUD with defineTable(), migrations, query builder. Zero-config bun:sqlite.",
							},
							{
								title: "Async Streaming",
								desc: "Suspense-like streaming: loading shell first, data swap when ready. No client JS needed.",
							},
							{
								title: "Image Optimization",
								desc: "Sharp integration for resize, WebP/AVIF, blur placeholders. Native lazy loading.",
							},
							{
								title: "Tailwind CSS",
								desc: "First-class Tailwind integration. Auto-config, HMR CSS hot swap, content-hashed output.",
							},
							{
								title: "Full Middleware Stack",
								desc: "CORS, rate limit, compression, ETag, body limit, security headers, request ID.",
							},
						].map((f) => (
							<div class="feature">
								<h3>{f.title}</h3>
								<p>{f.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Comparison */}
			<section class="section">
				<div class="container">
					<h2>VirexJS vs Next.js</h2>
					<p class="subtitle">Different philosophy, different trade-offs</p>
					<table class="comparison">
						<thead>
							<tr>
								<th></th>
								<th>Next.js</th>
								<th>VirexJS</th>
							</tr>
						</thead>
						<tbody>
							{[
								["Client JS", "~85 KB React runtime", "0 KB by default"],
								["Dependencies", "400+ packages", "0 packages"],
								["Runtime", "Node.js", "Bun (3-5x faster)"],
								["Database", "External package", "Built-in SQLite ORM"],
								["Auth", "External package", "Built-in JWT + sessions"],
								["Startup", "~2s", "~27ms"],
								["Tests", "Framework-level", "1098 tests"],
							].map((row) => (
								<tr>
									<td>{row[0]}</td>
									<td>{row[1]}</td>
									<td class="highlight">{row[2]}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			{/* Code Example */}
			<section class="section section-alt">
				<div class="container">
					<h2>Simple by Design</h2>
					<p class="subtitle">A complete page in 15 lines</p>
					<div class="code-block">
						<div class="code-header">src/pages/blog/[slug].tsx</div>
						<pre><code>{`import type { PageProps, LoaderContext } from "virexjs";
import { useHead } from "virexjs";

export async function loader(ctx: LoaderContext) {
  return await db.findOne({ slug: ctx.params.slug });
}

export default function BlogPost(props: PageProps) {
  const head = useHead({ title: props.data.title });
  return (
    <>
      {head}
      <article>
        <h1>{props.data.title}</h1>
        <p>{props.data.content}</p>
      </article>
    </>
  );
}`}</code></pre>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section class="section" style={{ textAlign: "center", padding: "80px 24px" }}>
				<h2>Ready to ship HTML?</h2>
				<p class="subtitle">Install VirexJS and build something fast.</p>
				<div class="code-block" style={{ maxWidth: "500px" }}>
					<pre><code>bun add virexjs</code></pre>
				</div>
				<div class="hero-buttons" style={{ marginTop: "24px" }}>
					<a href="/docs" class="btn btn-primary">Read the Docs</a>
					<a href="/examples" class="btn btn-secondary">See Examples</a>
				</div>
			</section>
		</Layout>
	);
}
