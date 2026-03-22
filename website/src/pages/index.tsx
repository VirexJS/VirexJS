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
				<span class="hero-badge">
					<span class="dot"></span>
					v0.2.0 — Built with VirexJS
				</span>
				<h1>
					Ship <span class="gradient">HTML</span>,<br />
					not JavaScript.
				</h1>
				<p class="subtitle">
					A full-stack web framework built on Bun. Zero client JS by default, islands
					architecture, and built-in everything — with zero external dependencies.
				</p>
				<div class="hero-buttons">
					<CopyButton text="bun add virexjs" />
					<a href="/docs" class="btn btn-outline">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
						Documentation
					</a>
					<a href="https://github.com/VirexJS/VirexJS" class="btn btn-outline" target="_blank" rel="noopener">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
						GitHub
					</a>
				</div>
			</section>

			{/* Stats */}
			<div class="container">
				<div class="stats-grid">
					<div class="stat-card"><div class="stat-value blue">1098</div><div class="stat-label">Tests Passing</div></div>
					<div class="stat-card"><div class="stat-value green">0</div><div class="stat-label">Dependencies</div></div>
					<div class="stat-card"><div class="stat-value purple">27ms</div><div class="stat-label">Server Startup</div></div>
					<div class="stat-card"><div class="stat-value amber">75+</div><div class="stat-label">API Exports</div></div>
				</div>
			</div>

			{/* Live Demo */}
			<section class="section">
				<div class="container">
					<div class="section-header">
						<h2>Interactive Islands</h2>
						<p>This page is server-rendered HTML. Only these interactive parts ship JavaScript.</p>
					</div>

					<div class="demo-grid">
						<div class="demo-card">
							<h3>
								Independent State
								<span class="tag tag-green">useIslandState</span>
							</h3>
							<p>Each counter has its own state — clicking one doesn't affect the other.</p>
							<div style={{ display: "flex", gap: "12px" }}>
								<LiveCounter label="Counter A" />
								<LiveCounter label="Counter B" />
							</div>
						</div>

						<div class="demo-card" style={{ borderColor: "rgba(59,130,246,0.3)" }}>
							<h3>
								Cross-Island Sync
								<span class="tag tag-blue">useSharedStore</span>
							</h3>
							<p>3 separate islands sharing state. Click a button — badge and list update.</p>
							<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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

			{/* Code */}
			<section class="section" style={{ background: "#0c0c0e" }}>
				<div class="container">
					<div class="section-header">
						<h2>Simple by Design</h2>
						<p>Pages, islands, shared state, and API routes — all in a few lines.</p>
					</div>
					<div class="code-block">
						<TabSwitcher />
					</div>
				</div>
			</section>

			{/* Features */}
			<section class="section">
				<div class="container">
					<div class="section-header">
						<h2>Everything Built-in</h2>
						<p>No npm install for common features. Zero external dependencies.</p>
					</div>
					<div class="card-grid">
						{[
							{ icon: "bg:rgba(59,130,246,0.1)", emoji: "\u26A1", title: "Zero Client JS", desc: "Pages ship pure server-rendered HTML. No React runtime, no hydration overhead." },
							{ icon: "bg:rgba(139,92,246,0.1)", emoji: "\uD83C\uDFDD\uFE0F", title: "Islands Architecture", desc: "Only interactive components ship JS. Independent or shared state between islands." },
							{ icon: "bg:rgba(236,72,153,0.1)", emoji: "\uD83C\uDF0A", title: "Async Streaming", desc: "Suspense-like: loading shell first, data swap when ready. No client JS needed." },
							{ icon: "bg:rgba(34,197,94,0.1)", emoji: "\uD83D\uDD12", title: "Built-in Auth", desc: "JWT (HS256), cookie sessions, route guards, CSRF protection. No packages." },
							{ icon: "bg:rgba(245,158,11,0.1)", emoji: "\uD83D\uDDC3\uFE0F", title: "SQLite Database", desc: "Typed CRUD with defineTable(), migrations, query builder. bun:sqlite." },
							{ icon: "bg:rgba(168,85,247,0.1)", emoji: "\uD83C\uDFA8", title: "Tailwind CSS", desc: "First-class integration. Auto-config, HMR hot swap, content-hashed builds." },
							{ icon: "bg:rgba(59,130,246,0.1)", emoji: "\uD83D\uDDBC\uFE0F", title: "Image Optimization", desc: "Sharp resize, WebP/AVIF conversion, blur placeholders. Native lazy loading." },
							{ icon: "bg:rgba(34,197,94,0.1)", emoji: "\uD83D\uDD17", title: "File-Based Routing", desc: "[slug] params, [...rest] catch-all, nested layouts, per-route middleware." },
							{ icon: "bg:rgba(236,72,153,0.1)", emoji: "\uD83D\uDE80", title: "Compression + ETag", desc: "Gzip middleware, automatic 304 Not Modified. Maximum bandwidth savings." },
						].map((f) => (
							<div class="card">
								<div class="card-icon" style={{ background: f.icon.replace("bg:", "") }}>
									{f.emoji}
								</div>
								<h3>{f.title}</h3>
								<p>{f.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Comparison */}
			<section class="section" style={{ background: "#0c0c0e" }}>
				<div class="container">
					<div class="section-header">
						<h2>VirexJS vs Next.js</h2>
						<p>Different philosophy, different trade-offs.</p>
					</div>
					<div class="table-wrap">
						<table class="comparison">
							<thead>
								<tr><th>Feature</th><th>Next.js</th><th>VirexJS</th></tr>
							</thead>
							<tbody>
								{[
									["Client JavaScript", "~85 KB React runtime", "0 KB by default"],
									["Dependencies", "400+ packages", "0 packages"],
									["Runtime", "Node.js", "Bun (3-5x faster)"],
									["Database", "External package", "Built-in SQLite ORM"],
									["Authentication", "External package", "Built-in JWT + sessions"],
									["Island Communication", "React Context (85KB)", "useSharedStore (0KB)"],
									["Dev Server Startup", "~2 seconds", "~27 milliseconds"],
									["Test Coverage", "Framework-level", "1098 tests"],
								].map((row) => (
									<tr>
										<td>{row[0]}</td>
										<td class="muted">{row[1]}</td>
										<td class="highlight">{row[2]}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section class="section" style={{ textAlign: "center" }}>
				<div class="container">
					<h2 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "12px", letterSpacing: "-0.02em" }}>
						Ready to ship <span class="gradient" style={{ background: "var(--gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>HTML</span>?
					</h2>
					<p style={{ color: "var(--text-muted)", fontSize: "18px", marginBottom: "32px" }}>
						Install VirexJS and build something fast.
					</p>
					<div class="hero-buttons">
						<CopyButton text="bunx virexjs create my-app" />
						<a href="/docs" class="btn btn-outline">Get Started</a>
					</div>
				</div>
			</section>
		</Layout>
	);
}
