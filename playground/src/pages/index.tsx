import type { PageProps, LoaderContext } from "virexjs";
import { Head, ErrorBoundary, useHead } from "virexjs";
import Default from "../layouts/Default";
import Counter from "../islands/Counter";

interface HomeData {
	posts: { slug: string; title: string; excerpt: string }[];
}

/** Loader: runs on the server before rendering */
export async function loader(_ctx: LoaderContext) {
	return {
		posts: [
			{ slug: "hello-world", title: "Hello World", excerpt: "Welcome to VirexJS!" },
			{ slug: "getting-started", title: "Getting Started", excerpt: "Learn how to build with VirexJS." },
			{ slug: "islands-architecture", title: "Islands Architecture", excerpt: "Ship HTML, hydrate only what you need." },
		],
	};
}

/** Page component — showcases Head, useHead, ErrorBoundary, and islands */
export default function Home(props: PageProps<HomeData>) {
	const { posts } = props.data;

	const head = useHead({
		title: "VirexJS — Ship HTML, not JavaScript",
		description: "A next-generation web framework built on Bun runtime.",
		og: {
			title: "VirexJS",
			description: "Ship HTML, not JavaScript.",
			type: "website",
		},
	});

	return (
		<Default>
			{head}
			<Head>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<h1>Welcome to VirexJS</h1>
			<p style={{ color: "#666", fontSize: "18px" }}>
				Ship HTML, not JavaScript. A next-generation web framework built on Bun.
			</p>

			<section style={{ marginTop: "32px" }}>
				<h2>Latest Posts</h2>
				<ErrorBoundary fallback={(err) => <p style={{ color: "red" }}>Failed to load posts: {err.message}</p>}>
					<ul style={{ listStyle: "none", padding: "0" }}>
						{posts.map((post) => (
							<li style={{ marginBottom: "16px", padding: "16px", border: "1px solid #eee", borderRadius: "8px" }}>
								<a href={`/blog/${post.slug}`} style={{ fontSize: "18px", textDecoration: "none", color: "#333" }}>
									{post.title}
								</a>
								<p style={{ color: "#666", margin: "4px 0 0 0" }}>{post.excerpt}</p>
							</li>
						))}
					</ul>
				</ErrorBoundary>
			</section>

			<section style={{ marginTop: "32px" }}>
				<h2>Interactive Island</h2>
				<Counter initial={0} />
			</section>
		</Default>
	);
}
