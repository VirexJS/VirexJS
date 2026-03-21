import type { PageProps, LoaderContext, MetaData } from "virexjs";
import Default from "../../layouts/Default";

interface BlogListData {
	posts: { slug: string; title: string; date: string; excerpt: string }[];
}

export async function loader(_ctx: LoaderContext) {
	return {
		posts: [
			{ slug: "hello-world", title: "Hello World", date: "2024-01-15", excerpt: "Welcome to VirexJS!" },
			{ slug: "getting-started", title: "Getting Started", date: "2024-01-10", excerpt: "Learn how to build with VirexJS." },
			{ slug: "islands-architecture", title: "Islands Architecture", date: "2024-01-05", excerpt: "Ship HTML, hydrate only what you need." },
		],
	};
}

export function meta(): MetaData {
	return {
		title: "Blog — VirexJS",
		description: "Latest articles about VirexJS development.",
	};
}

export default function BlogIndex(props: PageProps<BlogListData>) {
	const { posts } = props.data;

	return (
		<Default>
			<h1>Blog</h1>
			<ul style={{ listStyle: "none", padding: "0" }}>
				{posts.map((post) => (
					<li style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid #eee" }}>
						<a href={`/blog/${post.slug}`} style={{ fontSize: "20px", textDecoration: "none", color: "#333" }}>
							{post.title}
						</a>
						<p style={{ color: "#999", fontSize: "14px", margin: "4px 0" }}>{post.date}</p>
						<p style={{ color: "#666", margin: "4px 0 0 0" }}>{post.excerpt}</p>
					</li>
				))}
			</ul>
		</Default>
	);
}
