import type { LoaderContext, PageProps } from "virexjs";
import { ErrorBoundary, Head, useHead } from "virexjs";
import Counter from "../islands/Counter";
import Default from "../layouts/Default";

interface HomeData {
	posts: { slug: string; title: string; excerpt: string }[];
	serverTime: string;
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
	};
}

export default function Home(props: PageProps<HomeData>) {
	const { posts, serverTime } = props.data;

	const head = useHead({
		title: "VirexJS — Ship HTML, not JavaScript",
		description: "A full-stack web framework built on Bun. Zero dependencies.",
		og: { title: "VirexJS", description: "Ship HTML, not JavaScript.", type: "website" },
	});

	return (
		<Default>
			{head}
			<Head>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<div style={{ textAlign: "center", padding: "40px 0 24px" }}>
				<h1 style={{ fontSize: "36px", margin: "0 0 12px", color: "#111" }}>
					Ship HTML, not JavaScript.
				</h1>
				<p
					style={{
						color: "#666",
						fontSize: "18px",
						margin: "0 0 24px",
						maxWidth: "600px",
						marginLeft: "auto",
						marginRight: "auto",
					}}
				>
					VirexJS is a full-stack web framework built on Bun. Zero client-side JS by default,
					islands architecture, file-based routing, and 800+ tests.
				</p>
				<div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
					<a
						href="/features"
						style={{
							padding: "10px 24px",
							background: "#0066cc",
							color: "#fff",
							borderRadius: "6px",
							textDecoration: "none",
							fontSize: "14px",
							fontWeight: "500",
						}}
					>
						View Features
					</a>
					<a
						href="/api-demo"
						style={{
							padding: "10px 24px",
							background: "#f0f0f0",
							color: "#333",
							borderRadius: "6px",
							textDecoration: "none",
							fontSize: "14px",
							fontWeight: "500",
						}}
					>
						API Explorer
					</a>
				</div>
				<p style={{ color: "#999", fontSize: "12px", marginTop: "16px" }}>
					Server time: {serverTime} (rendered on the server, zero JS)
				</p>
			</div>

			<section style={{ marginTop: "16px" }}>
				<h2 style={{ fontSize: "20px", margin: "0 0 16px" }}>Latest Posts</h2>
				<ErrorBoundary fallback={(err) => <p style={{ color: "red" }}>Failed: {err.message}</p>}>
					<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
						{posts.map((post) => (
							<a
								href={`/blog/${post.slug}`}
								style={{
									display: "block",
									padding: "16px",
									border: "1px solid #eee",
									borderRadius: "8px",
									textDecoration: "none",
									color: "inherit",
								}}
							>
								<strong style={{ fontSize: "16px", color: "#333" }}>{post.title}</strong>
								<p style={{ color: "#666", margin: "4px 0 0", fontSize: "14px" }}>{post.excerpt}</p>
							</a>
						))}
					</div>
				</ErrorBoundary>
			</section>

			<section
				style={{ marginTop: "32px", padding: "24px", background: "#f8f9fa", borderRadius: "8px" }}
			>
				<h2 style={{ fontSize: "20px", margin: "0 0 12px" }}>Interactive Island</h2>
				<p style={{ color: "#666", margin: "0 0 16px", fontSize: "14px" }}>
					This counter is server-rendered as static HTML, then hydrated on the client. Only this
					component ships JavaScript — the rest of the page is pure HTML.
				</p>
				<Counter initial={0} />
			</section>

			<section style={{ marginTop: "32px" }}>
				<h2 style={{ fontSize: "20px", margin: "0 0 16px" }}>Quick Links</h2>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
					<a
						href="/features"
						style={{
							padding: "12px",
							border: "1px solid #eee",
							borderRadius: "8px",
							textDecoration: "none",
							color: "#333",
						}}
					>
						<strong>Features</strong>
						<p style={{ margin: "4px 0 0", color: "#999", fontSize: "13px" }}>
							12 feature categories
						</p>
					</a>
					<a
						href="/contact"
						style={{
							padding: "12px",
							border: "1px solid #eee",
							borderRadius: "8px",
							textDecoration: "none",
							color: "#333",
						}}
					>
						<strong>Contact</strong>
						<p style={{ margin: "4px 0 0", color: "#999", fontSize: "13px" }}>
							Form validation demo
						</p>
					</a>
					<a
						href="/i18n-demo"
						style={{
							padding: "12px",
							border: "1px solid #eee",
							borderRadius: "8px",
							textDecoration: "none",
							color: "#333",
						}}
					>
						<strong>i18n Demo</strong>
						<p style={{ margin: "4px 0 0", color: "#999", fontSize: "13px" }}>
							Locale detection + plurals
						</p>
					</a>
					<a
						href="/api-demo"
						style={{
							padding: "12px",
							border: "1px solid #eee",
							borderRadius: "8px",
							textDecoration: "none",
							color: "#333",
						}}
					>
						<strong>API Explorer</strong>
						<p style={{ margin: "4px 0 0", color: "#999", fontSize: "13px" }}>
							REST endpoints + curl
						</p>
					</a>
				</div>
			</section>
		</Default>
	);
}
