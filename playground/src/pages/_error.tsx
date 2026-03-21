import Default from "../layouts/Default";

export function meta() {
	return {
		title: "500 — Server Error",
	};
}

/** Custom error page rendered when a page throws an uncaught error */
export default function ErrorPage(props: { error?: string }) {
	return (
		<Default>
			<div style={{ textAlign: "center", padding: "64px 0" }}>
				<h1 style={{ fontSize: "72px", margin: "0", color: "#ff6b6b" }}>500</h1>
				<p style={{ fontSize: "20px", color: "#666", marginTop: "16px" }}>
					Something went wrong
				</p>
				{props.error && (
					<pre style={{ background: "#f5f5f5", padding: "16px", borderRadius: "8px", textAlign: "left", maxWidth: "600px", margin: "24px auto", overflow: "auto", fontSize: "14px", color: "#333" }}>
						{props.error}
					</pre>
				)}
				<a href="/" style={{ display: "inline-block", marginTop: "24px", color: "#0066cc", textDecoration: "none" }}>
					Go back home
				</a>
			</div>
		</Default>
	);
}
