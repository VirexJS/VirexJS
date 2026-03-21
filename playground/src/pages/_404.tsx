import Default from "../layouts/Default";

export function meta() {
	return {
		title: "404 — Page Not Found",
	};
}

export default function NotFound() {
	return (
		<Default>
			<div style={{ textAlign: "center", padding: "64px 0" }}>
				<h1 style={{ fontSize: "72px", margin: "0", color: "#ddd" }}>404</h1>
				<p style={{ fontSize: "20px", color: "#666", marginTop: "16px" }}>Page not found</p>
				<p style={{ color: "#999" }}>The page you are looking for does not exist.</p>
				<a
					href="/"
					style={{
						display: "inline-block",
						marginTop: "24px",
						color: "#0066cc",
						textDecoration: "none",
					}}
				>
					Go back home
				</a>
			</div>
		</Default>
	);
}
