import type { PageProps, LoaderContext, MetaContext, MetaData } from "virexjs";
import Default from "../../layouts/Default";

interface BlogPostData {
	title: string;
	date: string;
	content: string;
}

const MOCK_POSTS: Record<string, BlogPostData> = {
	"hello-world": {
		title: "Hello World",
		date: "2024-01-15",
		content: "Welcome to VirexJS! This is a next-generation web framework built on Bun runtime. It ships HTML, not JavaScript, making your pages incredibly fast.",
	},
	"getting-started": {
		title: "Getting Started",
		date: "2024-01-10",
		content: "To get started with VirexJS, create a new project and define your pages in the src/pages directory. Each file becomes a route automatically thanks to file-based routing.",
	},
	"islands-architecture": {
		title: "Islands Architecture",
		date: "2024-01-05",
		content: "VirexJS uses an islands architecture. By default, all pages are rendered as pure HTML on the server. Only components marked as islands get hydrated on the client, keeping the JavaScript bundle minimal.",
	},
};

/**
 * SSG: Return all slugs to pre-render at build time.
 * Each entry becomes a static HTML file in dist/blog/{slug}/index.html.
 */
export function getStaticPaths() {
	return Object.keys(MOCK_POSTS).map((slug) => ({ params: { slug } }));
}

export async function loader(ctx: LoaderContext) {
	const slug = ctx.params.slug ?? "";
	const post = MOCK_POSTS[slug];

	if (!post) {
		return {
			title: "Post Not Found",
			date: "",
			content: "The blog post you are looking for does not exist.",
		};
	}

	return post;
}

export function meta(ctx: MetaContext<BlogPostData>): MetaData {
	return {
		title: `${ctx.data.title} — VirexJS Blog`,
		description: ctx.data.content.slice(0, 160),
		og: {
			title: ctx.data.title,
			type: "article",
		},
	};
}

export default function BlogPost(props: PageProps<BlogPostData>) {
	const { title, date, content } = props.data;

	return (
		<Default>
			<article>
				<h1>{title}</h1>
				{date && <p style={{ color: "#999", fontSize: "14px" }}>{date}</p>}
				<div style={{ lineHeight: "1.8", color: "#444", marginTop: "16px" }}>
					<p>{content}</p>
				</div>
				<a href="/blog" style={{ display: "inline-block", marginTop: "24px", color: "#0066cc" }}>
					← Back to Blog
				</a>
			</article>
		</Default>
	);
}
