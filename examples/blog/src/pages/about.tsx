import type { PageProps } from "virexjs";
import { useHead } from "virexjs";
import Default from "../layouts/Default";

export default function About(_props: PageProps) {
	const head = useHead({ title: "About — Blog" });
	return (
		<Default>
			{head}
			<h1 style={{ fontSize: "28px", margin: "0 0 16px" }}>About</h1>
			<p style={{ lineHeight: "1.8", color: "#374151" }}>
				This blog is built with VirexJS — a full-stack web framework that ships HTML, not
				JavaScript. Posts are stored in SQLite, pages are server-rendered, and the only
				client-side JavaScript is the like button (an island component).
			</p>
		</Default>
	);
}
