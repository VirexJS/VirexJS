import Layout from "../components/Layout";

export function meta() {
	return { title: "Examples — VirexJS", description: "Real-world examples and templates" };
}

export default function Examples() {
	const examples = [
		{
			title: "Blog Starter",
			desc: "Full blog with SQLite database, dynamic routes, islands, and SEO.",
			features: ["[slug] routing", "SQLite CRUD", "Islands", "SEO meta"],
			cmd: "bunx virexjs create my-blog --template blog",
		},
		{
			title: "SaaS Starter",
			desc: "Landing page, auth, dashboard, pricing with nested layouts.",
			features: ["JWT Auth", "Nested layouts", "Dashboard", "Pricing"],
			cmd: "bunx virexjs create my-saas --template dashboard",
		},
		{
			title: "API Server",
			desc: "REST API with validation, rate limiting, and auto-generated docs.",
			features: ["API routes", "Validation", "Rate limit", "API docs"],
			cmd: "bunx virexjs create my-api --template api",
		},
		{
			title: "Minimal",
			desc: "Bare minimum VirexJS project. Just pages and a config file.",
			features: ["1 page", "Config", "TypeScript", "Ready to go"],
			cmd: "bunx virexjs init my-app",
		},
	];

	return (
		<Layout title="Examples — VirexJS">
			<section class="section">
				<div class="container">
					<h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "8px", textAlign: "center" }}>Examples</h1>
					<p class="subtitle">Start with a template, customize from there</p>

					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px" }}>
						{examples.map((ex) => (
							<div class="feature">
								<h3 style={{ fontSize: "18px", marginBottom: "8px" }}>{ex.title}</h3>
								<p style={{ marginBottom: "12px" }}>{ex.desc}</p>
								<div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
									{ex.features.map((f) => (
										<span style={{ padding: "2px 8px", background: "#eff6ff", color: "#2563eb", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>
											{f}
										</span>
									))}
								</div>
								<pre style={{ fontSize: "13px", padding: "12px" }}><code>{ex.cmd}</code></pre>
							</div>
						))}
					</div>

					<div style={{ textAlign: "center", padding: "40px 0" }}>
						<h2 style={{ marginBottom: "12px" }}>Interactive Playground</h2>
						<p style={{ color: "#64748b", marginBottom: "20px" }}>
							13 islands, 27 pages, cross-island communication, async streaming, and more.
						</p>
						<a href="https://github.com/VirexJS/VirexJS/tree/main/playground" class="btn btn-primary" target="_blank" rel="noopener">
							View Playground Source
						</a>
					</div>
				</div>
			</section>
		</Layout>
	);
}
