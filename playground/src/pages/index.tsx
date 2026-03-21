import type { LoaderContext, PageProps } from "virexjs";
import { ErrorBoundary, Head, useHead } from "virexjs";
import Counter from "../islands/Counter";
import Default from "../layouts/Default";

interface HomeData {
	posts: { slug: string; title: string; excerpt: string }[];
	serverTime: string;
	stats: { tests: number; packages: number; islands: number; routes: number };
}

export async function loader(_ctx: LoaderContext) {
	return {
		posts: [
			{ slug: "hello-world", title: "Hello World", excerpt: "Welcome to VirexJS!" },
			{
				slug: "getting-started",
				title: "Getting Started",
				excerpt: "Learn how to build with VirexJS.",
			},
			{
				slug: "islands-architecture",
				title: "Islands Architecture",
				excerpt: "Ship HTML, hydrate only what you need.",
			},
		],
		serverTime: new Date().toLocaleTimeString(),
		stats: { tests: 886, packages: 4, islands: 8, routes: 19 },
	};
}

export default function Home(props: PageProps<HomeData>) {
	const { posts, serverTime, stats } = props.data;

	const head = useHead({
		title: "VirexJS — Ship HTML, not JavaScript",
		description: "A full-stack web framework built on Bun. Zero dependencies.",
		og: {
			title: "VirexJS",
			description: "Ship HTML, not JavaScript.",
			type: "website",
			image: "/api/og?title=VirexJS&subtitle=Ship+HTML,+not+JavaScript",
		},
	});

	const statItems = [
		{ value: String(stats.tests), label: "Tests" },
		{ value: String(stats.packages), label: "Packages" },
		{ value: String(stats.islands), label: "Islands" },
		{ value: "0", label: "Dependencies" },
	];

	return (
		<Default>
			{head}
			<Head>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			{/* Hero */}
			<div style={{ textAlign: "center", padding: "48px 0 32px" }}>
				<p
					style={{
						display: "inline-block",
						padding: "4px 12px",
						background: "#e8f0fe",
						color: "#0066cc",
						borderRadius: "16px",
						fontSize: "13px",
						fontWeight: "500",
						marginBottom: "16px",
					}}
				>
					v0.1.0 — Production Ready
				</p>
				<h1 style={{ fontSize: "2.5rem", margin: "0 0 12px", lineHeight: "1.1" }}>
					Ship HTML,
					<br />
					not JavaScript.
				</h1>
				<p
					style={{
						color: "#4b5563",
						fontSize: "18px",
						margin: "0 auto 24px",
						maxWidth: "520px",
					}}
				>
					A full-stack web framework built on Bun. Islands architecture, file-based routing, zero
					dependencies.
				</p>
				<div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
					<a
						href="/features"
						style={{
							padding: "12px 28px",
							background: "#0066cc",
							color: "#fff",
							borderRadius: "8px",
							fontWeight: "600",
							fontSize: "15px",
						}}
					>
						Explore Features
					</a>
					<a
						href="/islands"
						style={{
							padding: "12px 28px",
							background: "#f3f4f6",
							color: "#111",
							borderRadius: "8px",
							fontWeight: "600",
							fontSize: "15px",
						}}
					>
						See Islands
					</a>
				</div>
			</div>

			{/* Stats */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(4, 1fr)",
					gap: "1px",
					background: "#e5e7eb",
					borderRadius: "12px",
					overflow: "hidden",
					margin: "0 0 40px",
				}}
			>
				{statItems.map((s) => (
					<div style={{ background: "#fff", padding: "20px", textAlign: "center" }}>
						<div style={{ fontSize: "28px", fontWeight: "700", color: "#111" }}>{s.value}</div>
						<div style={{ fontSize: "13px", color: "#9ca3af" }}>{s.label}</div>
					</div>
				))}
			</div>

			{/* Island Demo */}
			<section
				style={{
					padding: "24px",
					background: "#f9fafb",
					borderRadius: "12px",
					border: "1px solid #e5e7eb",
					marginBottom: "32px",
				}}
			>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
					<div>
						<h2 style={{ margin: "0 0 8px" }}>Interactive Island</h2>
						<p style={{ color: "#4b5563", fontSize: "14px", margin: "0 0 16px" }}>
							Server-rendered HTML. Client-hydrated JavaScript. Only this component ships JS.
						</p>
					</div>
					<span
						style={{
							padding: "4px 10px",
							background: "#dcfce7",
							color: "#16a34a",
							borderRadius: "6px",
							fontSize: "12px",
							fontWeight: "600",
						}}
					>
						HYDRATED
					</span>
				</div>
				<ErrorBoundary fallback={(err) => <p style={{ color: "red" }}>{err.message}</p>}>
					<Counter initial={0} />
				</ErrorBoundary>
			</section>

			{/* Blog Posts */}
			<section style={{ marginBottom: "32px" }}>
				<h2 style={{ margin: "0 0 16px" }}>Latest Posts</h2>
				<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
					{posts.map((post) => (
						<a
							href={`/blog/${post.slug}`}
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								padding: "14px 16px",
								border: "1px solid #e5e7eb",
								borderRadius: "8px",
								color: "inherit",
							}}
						>
							<div>
								<strong style={{ fontSize: "15px" }}>{post.title}</strong>
								<p style={{ color: "#9ca3af", margin: "2px 0 0", fontSize: "13px" }}>
									{post.excerpt}
								</p>
							</div>
							<span style={{ color: "#9ca3af", fontSize: "18px" }}>&rarr;</span>
						</a>
					))}
				</div>
			</section>

			{/* Quick Links */}
			<section>
				<h2 style={{ margin: "0 0 16px" }}>Explore</h2>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
					{[
						{ href: "/features", title: "Features", desc: "12 categories" },
						{ href: "/islands", title: "Islands", desc: "7 interactive demos" },
						{ href: "/contact", title: "Contact", desc: "Form validation" },
						{ href: "/db-demo", title: "Database", desc: "Live SQLite CRUD" },
						{ href: "/api-demo", title: "API Explorer", desc: "7 endpoints" },
						{ href: "/realtime", title: "Realtime", desc: "SSE + WebSocket" },
					].map((item) => (
						<a
							href={item.href}
							style={{
								padding: "16px",
								border: "1px solid #e5e7eb",
								borderRadius: "8px",
								color: "inherit",
							}}
						>
							<strong style={{ fontSize: "14px" }}>{item.title}</strong>
							<p style={{ margin: "4px 0 0", color: "#9ca3af", fontSize: "12px" }}>{item.desc}</p>
						</a>
					))}
				</div>
			</section>

			{/* Server info */}
			<p
				style={{
					textAlign: "center",
					color: "#d1d5db",
					fontSize: "12px",
					marginTop: "32px",
				}}
			>
				Server rendered at {serverTime} — zero client JavaScript
			</p>
		</Default>
	);
}
