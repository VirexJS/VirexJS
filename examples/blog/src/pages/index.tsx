import type { LoaderContext, PageProps } from "virexjs";
import { Link, useHead } from "virexjs";
import { posts } from "../db/schema";
import Default from "../layouts/Default";

interface Post {
	id: number;
	title: string;
	slug: string;
	excerpt: string;
	created_at: string;
}

export async function loader(_ctx: LoaderContext) {
	const allPosts = posts.findMany({
		where: { published: 1 },
		orderBy: "id DESC",
	}) as unknown as Post[];
	return { posts: allPosts };
}

export default function Home(props: PageProps<{ posts: Post[] }>) {
	const head = useHead({
		title: "Blog — VirexJS",
		description: "A blog built with VirexJS. Zero JavaScript, pure HTML.",
		og: { title: "VirexJS Blog", type: "website" },
	});

	return (
		<Default>
			{head}
			<h1 style={{ fontSize: "28px", margin: "0 0 24px" }}>Latest Posts</h1>
			<div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
				{props.data.posts.map((post) => (
					<article>
						<Link
							href={`/blog/${post.slug}`}
							style={{ fontSize: "20px", fontWeight: "600", color: "#111", textDecoration: "none" }}
						>
							{post.title}
						</Link>
						<p style={{ color: "#6b7280", margin: "4px 0 0", lineHeight: "1.6" }}>
							{post.excerpt}
						</p>
						<time style={{ color: "#d1d5db", fontSize: "13px" }}>
							{post.created_at.split("T")[0]}
						</time>
					</article>
				))}
			</div>
		</Default>
	);
}
