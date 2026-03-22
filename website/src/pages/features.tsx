import Layout from "../components/Layout";

export function meta() {
	return { title: "Features — VirexJS", description: "Everything VirexJS offers" };
}

export default function Features() {
	const categories = [
		{
			title: "Rendering",
			items: [
				"Zero JS by default — pure server-rendered HTML",
				"Islands architecture — only interactive parts ship JS",
				"Async streaming — Suspense-like loading shell + data swap",
				"Nested layouts — _layout.tsx per directory",
				"Loading states — _loading.tsx streaming shell",
				"Error boundaries — _error.tsx per route segment",
				"Streaming HTML — head-first TTFB with ReadableStream",
			],
		},
		{
			title: "Routing",
			items: [
				"File-based routing — [slug], [...rest], (group)",
				"SSG — getStaticPaths() for static pre-rendering",
				"ISR — \"use cache\" + revalidate interval",
				"API routes — GET, POST, PUT, DELETE, PATCH",
				"Form actions — typed server actions with validation",
				"Parallel loaders — defineParallelLoader() for concurrent data",
				"Per-route middleware — _middleware.ts auto-discovery",
				"Redirects & rewrites — config-based URL management",
			],
		},
		{
			title: "Islands",
			items: [
				"useIslandState() — zero-boilerplate state management",
				"useSharedStore() — cross-island reactive state",
				"Event bus — emitIslandEvent() / onIslandEvent()",
				"Hydration strategies — visible, interaction, idle, immediate",
				"Bundle splitting — shared JSX runtime chunks",
				"\"use client\" / \"use island\" directives",
			],
		},
		{
			title: "Built-in",
			items: [
				"Auth — JWT (HS256), sessions, route guards, CSRF",
				"Database — SQLite ORM, typed CRUD, migrations",
				"Validation — chainable schema (string, number, boolean)",
				"i18n — interpolation, pluralization, locale routing",
				"Real-time — WebSocket routes + Server-Sent Events",
				"Image optimization — Sharp resize, WebP/AVIF, blur LQIP",
				"Compression — gzip middleware with smart detection",
				"ETag caching — automatic 304 Not Modified",
			],
		},
		{
			title: "Components",
			items: [
				"<Link> with native browser prefetch",
				"<Image> with lazy loading + responsive srcset",
				"<Head> with tag deduplication",
				"<Script> with loading strategies",
				"<Font> with preload + font-display",
				"<Preload> / <Preconnect> / <DNSPrefetch> resource hints",
				"<ErrorBoundary> with fallback UI",
				"<JsonLd> for structured data (FAQ, breadcrumbs, articles)",
			],
		},
		{
			title: "DX",
			items: [
				"CLI — create, init, dev, build, preview, generate, check, info",
				"HMR — WebSocket hot reload with dev widget + heartbeat",
				"Tailwind CSS — first-class integration, auto-config",
				"TypeScript — strict mode, @/ path aliases",
				"Test utilities — renderComponent, assertHTML, mock request",
				"Critical CSS extraction — inline above-the-fold styles",
				"Sitemap + robots.txt — auto-generated in builds",
				"API docs — auto-generated endpoint documentation",
			],
		},
	];

	return (
		<Layout title="Features — VirexJS">
			<section class="section">
				<div class="container">
					<h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "8px", textAlign: "center" }}>Features</h1>
					<p class="subtitle">75+ exports, zero external dependencies</p>

					{categories.map((cat) => (
						<div style={{ marginBottom: "40px" }}>
							<h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "16px", paddingBottom: "8px", borderBottom: "2px solid #e2e8f0" }}>
								{cat.title}
							</h2>
							<ul style={{ listStyle: "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
								{cat.items.map((item) => (
									<li style={{ fontSize: "14px", color: "#374151", padding: "8px 0", paddingLeft: "20px", position: "relative" }}>
										<span style={{ position: "absolute", left: 0, color: "#2563eb" }}>+</span>
										{item}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</section>
		</Layout>
	);
}
