import type { PageProps } from "virexjs";
import { createFAQ, ErrorBoundary, Head, JsonLd, useHead } from "virexjs";
import Counter from "../islands/Counter";
import Default from "../layouts/Default";

const features = [
	{
		title: "Zero JS by Default",
		desc: "Pages ship pure HTML. No client JavaScript unless you opt in with islands.",
		icon: "0",
	},
	{
		title: "Islands Architecture",
		desc: "Only interactive components hydrate on the client. See the Counter below.",
		icon: "I",
	},
	{
		title: "File-based Routing",
		desc: "Drop a .tsx file in src/pages/ and it becomes a route. Dynamic [params], catch-all [...rest], groups (auth).",
		icon: "R",
	},
	{
		title: "Streaming HTML",
		desc: "Head-first TTFB with ReadableStream. Browser starts loading CSS before body renders.",
		icon: "S",
	},
	{
		title: "Built-in Auth",
		desc: "JWT (HS256), cookie sessions, route guards, CSRF protection — all zero-dependency.",
		icon: "A",
	},
	{
		title: "Form Validation",
		desc: "Chainable validators: string().required().email(). Try the Contact page.",
		icon: "V",
	},
	{
		title: "i18n",
		desc: "Interpolation, pluralization, locale detection from Accept-Language. See the i18n demo.",
		icon: "i",
	},
	{
		title: "Real-time",
		desc: "WebSocket routes with defineWSRoute() and Server-Sent Events with createSSEStream().",
		icon: "W",
	},
	{
		title: "Database + Migrations",
		desc: "SQLite ORM with defineTable(), typed CRUD, and migrate()/rollback().",
		icon: "D",
	},
	{
		title: "Plugin System",
		desc: "6 lifecycle hooks: configResolved, serverCreated, buildStart, buildEnd, transformHTML, middleware.",
		icon: "P",
	},
	{
		title: "Security",
		desc: "CORS, rate limiting, CSP headers, CSRF, body size limiter, path traversal protection.",
		icon: "L",
	},
	{
		title: "SEO",
		desc: "useHead() for OG/Twitter, <Head> component, JSON-LD structured data, sitemap generation.",
		icon: "E",
	},
];

export default function Features(_props: PageProps) {
	const head = useHead({
		title: "Features — VirexJS",
		description: "Everything VirexJS offers — zero dependencies, production ready.",
		og: { title: "VirexJS Features", type: "website" },
	});

	const faq = createFAQ([
		{
			question: "Does VirexJS use React?",
			answer:
				"No. VirexJS has its own JSX runtime. A React compatibility shim is available for migration.",
		},
		{ question: "How many dependencies?", answer: "Zero. Everything is built on Bun native APIs." },
		{
			question: "Can I use TypeScript?",
			answer:
				"Yes. VirexJS is built with TypeScript strict mode. Full type inference for loaders, API routes, and config.",
		},
	]);

	return (
		<Default>
			{head}
			<Head>
				<meta name="robots" content="index, follow" />
			</Head>
			<JsonLd data={faq} />

			<div style={{ textAlign: "center", padding: "32px 0 16px" }}>
				<h1 style={{ fontSize: "32px", margin: "0 0 8px" }}>Features</h1>
				<p style={{ color: "#666", fontSize: "16px", margin: 0 }}>
					Everything you need to build production web applications.
				</p>
			</div>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
					gap: "16px",
					padding: "16px 0",
				}}
			>
				{features.map((f) => (
					<div
						style={{
							border: "1px solid #eee",
							borderRadius: "8px",
							padding: "20px",
							background: "#fafafa",
						}}
					>
						<div
							style={{
								width: "36px",
								height: "36px",
								borderRadius: "8px",
								background: "#0066cc",
								color: "#fff",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontWeight: "bold",
								fontSize: "16px",
								marginBottom: "12px",
							}}
						>
							{f.icon}
						</div>
						<h3 style={{ margin: "0 0 8px", fontSize: "16px" }}>{f.title}</h3>
						<p style={{ margin: 0, color: "#666", fontSize: "14px", lineHeight: "1.5" }}>
							{f.desc}
						</p>
					</div>
				))}
			</div>

			<section
				style={{ marginTop: "32px", padding: "24px", background: "#f8f9fa", borderRadius: "8px" }}
			>
				<h2 style={{ margin: "0 0 16px" }}>Live Island Demo</h2>
				<p style={{ color: "#666", margin: "0 0 16px" }}>
					This Counter is an island component. Server-rendered as static HTML, then hydrated on the
					client with interactive JavaScript. Click the buttons!
				</p>
				<ErrorBoundary
					fallback={(err) => <p style={{ color: "red" }}>Island error: {err.message}</p>}
				>
					<Counter initial={0} />
				</ErrorBoundary>
			</section>

			<section style={{ marginTop: "32px" }}>
				<h2>FAQ (JSON-LD structured data embedded)</h2>
				<div>
					<h4 style={{ margin: "16px 0 4px" }}>Does VirexJS use React?</h4>
					<p style={{ color: "#666", margin: 0 }}>
						No. VirexJS has its own JSX runtime. A React compatibility shim is available.
					</p>
					<h4 style={{ margin: "16px 0 4px" }}>How many dependencies?</h4>
					<p style={{ color: "#666", margin: 0 }}>Zero. Everything is built on Bun native APIs.</p>
					<h4 style={{ margin: "16px 0 4px" }}>Can I use TypeScript?</h4>
					<p style={{ color: "#666", margin: 0 }}>Yes. Full TypeScript strict mode support.</p>
				</div>
			</section>
		</Default>
	);
}
