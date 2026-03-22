import Layout from "../components/Layout";
import CartDemo from "../islands/CartDemo";
import CopyButton from "../islands/CopyButton";
import LiveCounter from "../islands/LiveCounter";
import TabSwitcher from "../islands/TabSwitcher";

export function meta() {
	return {
		title: "VirexJS — Ship HTML, not JavaScript",
		description: "A full-stack web framework built on Bun. Zero dependencies, islands architecture, 1098 tests.",
	};
}

export default function Home() {
	return (
		<Layout>
			{/* Hero */}
			<section class="hero">
				<span class="hero-badge">v0.2.0 — This site is built with VirexJS</span>
				<h1>
					Ship <span>HTML</span>,<br />not JavaScript.
				</h1>
				<p>
					A full-stack web framework built on Bun. Zero client JS by default, islands
					architecture, and built-in everything — with zero external dependencies.
				</p>
				<div class="hero-buttons">
					<CopyButton text="bun add virexjs" />
					<a href="/docs" class="btn btn-secondary">Read the Docs</a>
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

			{/* Live Island Demo */}
			<section class="section">
				<div class="container">
					<h2>Try It — These Are Real Islands</h2>
					<p class="subtitle">
						This entire page is server-rendered HTML. Only the interactive parts below ship JavaScript.
					</p>

					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px" }}>
						{/* Independent State */}
						<div class="feature">
							<h3 style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								Independent State
								<span style={{ fontSize: "11px", padding: "2px 8px", background: "#dcfce7", color: "#16a34a", borderRadius: "4px" }}>
									useIslandState
								</span>
							</h3>
							<p>Each counter has its own state. Clicking one doesn't affect the other.</p>
							<div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
								<LiveCounter label="Counter A" />
								<LiveCounter label="Counter B" />
							</div>
						</div>

						{/* Shared State */}
						<div class="feature" style={{ borderColor: "#2563eb" }}>
							<h3 style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								Cross-Island State
								<span style={{ fontSize: "11px", padding: "2px 8px", background: "#eff6ff", color: "#2563eb", borderRadius: "4px" }}>
									useSharedStore
								</span>
							</h3>
							<p>
								3 separate islands sharing state. Click a button — badge + list update automatically.
							</p>
							<div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
									<CartDemo role="button" />
									<CartDemo role="badge" />
								</div>
								<CartDemo role="list" />
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Interactive Code Tabs */}
			<section class="section section-alt">
				<div class="container">
					<h2>Simple by Design</h2>
					<p class="subtitle">Switch tabs to see pages, islands, shared state, and API routes</p>
					<div style={{ maxWidth: "700px", margin: "0 auto" }}>
						<TabSwitcher />
					</div>
				</div>
			</section>

			{/* Features */}
			<section class="section">
				<div class="container">
					<h2>Everything Built-in</h2>
					<p class="subtitle">No npm install for common features</p>
					<div class="features">
						{[
							{ title: "Zero Client JS", desc: "Pages ship pure HTML. No React runtime. Only islands ship JavaScript." },
							{ title: "Islands + Shared Store", desc: "Independent state with useIslandState. Cross-island sync with useSharedStore." },
							{ title: "Async Streaming", desc: "Suspense-like: loading shell first, data swap when ready. No client JS." },
							{ title: "File-Based Routing", desc: "[slug] params, [...rest] catch-all, nested layouts, loading states." },
							{ title: "Built-in Auth", desc: "JWT (HS256), cookie sessions, route guards, CSRF. No external packages." },
							{ title: "SQLite Database", desc: "Typed CRUD with defineTable(), migrations. Zero-config bun:sqlite." },
							{ title: "Tailwind CSS", desc: "First-class integration. Auto-config, HMR hot swap, content-hashed output." },
							{ title: "Image Optimization", desc: "Sharp resize, WebP/AVIF, blur placeholders. Native lazy loading." },
							{ title: "Compression + ETag", desc: "Gzip middleware, automatic 304 Not Modified. Bandwidth savings." },
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
			<section class="section section-alt">
				<div class="container">
					<h2>VirexJS vs Next.js</h2>
					<p class="subtitle">Different philosophy, different trade-offs</p>
					<table class="comparison">
						<thead>
							<tr><th></th><th>Next.js</th><th>VirexJS</th></tr>
						</thead>
						<tbody>
							{[
								["Client JS", "~85 KB React runtime", "0 KB by default"],
								["Dependencies", "400+ packages", "0 packages"],
								["Runtime", "Node.js", "Bun (3-5x faster)"],
								["Database", "External package", "Built-in SQLite ORM"],
								["Auth", "External package", "Built-in JWT + sessions"],
								["Island State", "React Context (85KB)", "useSharedStore (0KB)"],
								["Startup", "~2s", "~27ms"],
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

			{/* CTA */}
			<section class="section" style={{ textAlign: "center", padding: "80px 24px" }}>
				<h2>Ready to ship HTML?</h2>
				<p class="subtitle">Install VirexJS and build something fast.</p>
				<div style={{ marginTop: "24px" }}>
					<CopyButton text="bunx virexjs create my-app" />
				</div>
				<div class="hero-buttons" style={{ marginTop: "20px" }}>
					<a href="/docs" class="btn btn-primary">Read the Docs</a>
					<a href="https://github.com/VirexJS/VirexJS" class="btn btn-secondary" target="_blank" rel="noopener">
						GitHub (1098 tests)
					</a>
				</div>
			</section>
		</Layout>
	);
}
