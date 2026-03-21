import type { LoaderContext, PageProps } from "virexjs";
import { useHead } from "virexjs";
import Default from "../layouts/Default";

/** Contact form page — demonstrates useHead + form rendering */
export async function loader(_ctx: LoaderContext) {
	return {
		submitted: false,
	};
}

export default function Contact(_props: PageProps<{ submitted: boolean }>) {
	const head = useHead({
		title: "Contact — VirexJS",
		description: "Get in touch. This page demonstrates form validation and server actions.",
	});

	const inputStyle = {
		width: "100%",
		padding: "10px 12px",
		border: "1px solid #ddd",
		borderRadius: "6px",
		fontSize: "14px",
		boxSizing: "border-box" as const,
	};

	const labelStyle = {
		display: "block",
		marginBottom: "6px",
		fontSize: "14px",
		fontWeight: "500" as const,
		color: "#333",
	};

	return (
		<Default>
			{head}

			<div style={{ maxWidth: "500px", margin: "0 auto" }}>
				<h1 style={{ fontSize: "28px", margin: "0 0 8px" }}>Contact</h1>
				<p style={{ color: "#666", margin: "0 0 24px" }}>
					This form showcases VirexJS validation. Fields use{" "}
					<code>string().required().email()</code> chainable validators.
				</p>

				<form
					method="POST"
					action="/api/contact"
					style={{ display: "flex", flexDirection: "column", gap: "16px" }}
				>
					<div>
						<label htmlFor="name" style={labelStyle}>
							Name
						</label>
						<input
							id="name"
							type="text"
							name="name"
							placeholder="Your name"
							required
							style={inputStyle}
						/>
						<small style={{ color: "#999", fontSize: "12px" }}>
							Validated: string().required().min(2).max(50).trim()
						</small>
					</div>

					<div>
						<label htmlFor="email" style={labelStyle}>
							Email
						</label>
						<input
							id="email"
							type="email"
							name="email"
							placeholder="you@example.com"
							required
							style={inputStyle}
						/>
						<small style={{ color: "#999", fontSize: "12px" }}>
							Validated: string().required().email()
						</small>
					</div>

					<div>
						<label htmlFor="message" style={labelStyle}>
							Message
						</label>
						<textarea
							id="message"
							name="message"
							rows={4}
							placeholder="Your message..."
							required
							style={{ ...inputStyle, resize: "vertical" as const }}
						/>
						<small style={{ color: "#999", fontSize: "12px" }}>
							Validated: string().required().min(10).max(1000)
						</small>
					</div>

					<button
						type="submit"
						style={{
							padding: "12px 24px",
							background: "#0066cc",
							color: "#fff",
							border: "none",
							borderRadius: "6px",
							fontSize: "14px",
							cursor: "pointer",
							fontWeight: "500",
						}}
					>
						Send Message
					</button>
				</form>

				<div
					style={{
						marginTop: "24px",
						padding: "16px",
						background: "#f8f9fa",
						borderRadius: "8px",
						fontSize: "13px",
					}}
				>
					<strong>How it works:</strong>
					<ul style={{ margin: "8px 0 0", paddingLeft: "20px", color: "#666" }}>
						<li>
							Form submits to <code>/api/contact</code> (API route)
						</li>
						<li>
							Server validates with <code>validate(schema, data)</code>
						</li>
						<li>Returns JSON errors or success response</li>
						<li>
							Body size limited by <code>bodyLimit()</code> middleware
						</li>
					</ul>
				</div>
			</div>
		</Default>
	);
}
