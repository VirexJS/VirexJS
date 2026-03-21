import type { LoaderContext, PageProps } from "virexjs";
import { ErrorBoundary, Link, useHead } from "virexjs";
import LikeButton from "../../islands/LikeButton";
import { posts } from "../../db/schema";
import Default from "../../layouts/Default";

interface Post {
	title: string;
	content: string;
	created_at: string;
}

export async function loader(ctx: LoaderContext) {
	const slug = ctx.params.slug ?? "";
	const post = posts.findOne({ slug, published: 1 }) as Post | null;
	if (!post) return { title: "Not Found", content: "Post not found.", created_at: "" };
	return post;
}

export default function BlogPost(props: PageProps<Post>) {
	const { title, content, created_at } = props.data;
	const head = useHead({
		title: `${title} — Blog`,
		og: { title, type: "article" },
	});

	const paragraphs = content.split("\n").filter(Boolean);

	return (
		<Default>
			{head}
			<article>
				<h1 style={{ fontSize: "28px", margin: "0 0 8px" }}>{title}</h1>
				{created_at && (
					<time style={{ color: "#9ca3af", fontSize: "14px" }}>
						{created_at.split("T")[0]}
					</time>
				)}
				<div style={{ marginTop: "24px", lineHeight: "1.8", color: "#374151" }}>
					{paragraphs.map((p) => (
						<p style={{ margin: "0 0 16px" }}>{p}</p>
					))}
				</div>
				<div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
					<ErrorBoundary fallback={() => <span />}>
						<LikeButton />
					</ErrorBoundary>
				</div>
				<div style={{ marginTop: "24px" }}>
					<Link href="/" style={{ color: "#0066cc" }}>
						{"← Back to posts"}
					</Link>
				</div>
			</article>
		</Default>
	);
}
