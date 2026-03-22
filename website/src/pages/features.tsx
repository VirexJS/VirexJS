import Layout from "../components/Layout";

export function meta() {
	return { title: "Features — VirexJS", description: "Everything VirexJS offers" };
}

export default function Features() {
	const categories = [
		{
			title: "Rendering",
			icon: "\u26A1",
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
			icon: "\uD83D\uDD17",
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
			icon: "\uD83C\uDFDD\uFE0F",
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
			icon: "\uD83D\uDD12",
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
			icon: "\uD83D\uDDBC\uFE0F",
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
			icon: "\uD83D\uDE80",
			items: [
				"CLI — create, init, dev, build, preview, generate, check, info",
				"HMR — WebSocket hot reload with heartbeat + dev widget",
				"Tailwind CSS — first-class integration, auto-config",
				"TypeScript — strict mode, @/ path aliases",
				"Test utilities — renderComponent, assertHTML",
				"Critical CSS extraction + async loader",
				"Sitemap + robots.txt auto-generated in builds",
				"Auto API docs generation",
			],
		},
	];

	return (
		<Layout title="Features — VirexJS">
			<section class="section">
				<div class="container">
					<div class="section-header">
						<h2>Features</h2>
						<p>75+ exports, zero external dependencies</p>
					</div>

					{categories.map((cat) => (
						<div style={{ marginBottom: "48px" }}>
							<h3 style={{
								fontSize: "1.25rem",
								fontWeight: 700,
								marginBottom: "20px",
								paddingBottom: "12px",
								borderBottom: "1px solid #27272a",
								display: "flex",
								alignItems: "center",
								gap: "10px",
							}}>
								<span style={{ fontSize: "20px" }}>{cat.icon}</span>
								{cat.title}
							</h3>
							<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
								{cat.items.map((item) => (
									<div style={{
										fontSize: "14px",
										color: "#a1a1aa",
										padding: "10px 16px",
										background: "#18181b",
										borderRadius: "8px",
										border: "1px solid #27272a",
										display: "flex",
										alignItems: "center",
										gap: "10px",
									}}>
										<span style={{ color: "#3b82f6", fontWeight: 700, fontSize: "14px", flexShrink: 0 }}>+</span>
										{item}
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</section>
		</Layout>
	);
}
