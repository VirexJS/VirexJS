import type { PageProps } from "virexjs";
import { useHead } from "virexjs";
import Default from "../../layouts/Default";

/**
 * Login page — demonstrates JWT auth flow.
 * Uses inline script for client-side fetch (this is a controlled demo,
 * the script content is static and trusted, not user-generated).
 */
export default function Login(_props: PageProps) {
	const head = useHead({
		title: "Login — VirexJS",
		description: "Sign in to the VirexJS admin panel.",
	});

	const inputStyle = {
		width: "100%",
		padding: "10px 14px",
		border: "1px solid #d1d5db",
		borderRadius: "8px",
		fontSize: "14px",
		boxSizing: "border-box" as const,
	};

	// Static trusted login script — no user input in the template
	const loginScript = `
		document.getElementById('login-btn').addEventListener('click', async function() {
			var email = document.getElementById('email').value;
			var password = document.getElementById('password').value;
			var errorDiv = document.getElementById('login-error');
			try {
				var res = await fetch('/api/auth', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ action: 'login', email: email, password: password })
				});
				var data = await res.json();
				if (data.token) {
					localStorage.setItem('vrx_token', data.token);
					localStorage.setItem('vrx_user', JSON.stringify(data.user));
					window.location.href = '/admin';
				} else {
					errorDiv.textContent = data.error || 'Login failed';
					errorDiv.style.display = 'block';
				}
			} catch(e) {
				errorDiv.textContent = 'Network error';
				errorDiv.style.display = 'block';
			}
		});
	`;

	return (
		<Default>
			{head}
			<div style={{ maxWidth: "400px", margin: "40px auto" }}>
				<div style={{ textAlign: "center", marginBottom: "32px" }}>
					<h1 style={{ fontSize: "24px", margin: "0 0 8px" }}>Sign In</h1>
					<p style={{ color: "#6b7280", margin: 0 }}>
						Demo: <code>admin@virexjs.dev</code> / <code>admin123</code>
					</p>
				</div>

				<div
					id="login-error"
					style={{
						display: "none",
						padding: "10px 14px",
						background: "#fef2f2",
						border: "1px solid #fecaca",
						borderRadius: "8px",
						color: "#dc2626",
						fontSize: "14px",
						marginBottom: "16px",
					}}
				/>

				<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
					<div>
						<label
							htmlFor="email"
							style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}
						>
							Email
						</label>
						<input id="email" type="email" value="admin@virexjs.dev" style={inputStyle} />
					</div>

					<div>
						<label
							htmlFor="password"
							style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}
						>
							Password
						</label>
						<input id="password" type="password" value="admin123" style={inputStyle} />
					</div>

					<button
						type="button"
						id="login-btn"
						style={{
							padding: "12px",
							background: "#0066cc",
							color: "#fff",
							border: "none",
							borderRadius: "8px",
							fontSize: "15px",
							fontWeight: "600",
							cursor: "pointer",
						}}
					>
						Sign In
					</button>
				</div>

				<p style={{ textAlign: "center", marginTop: "16px", fontSize: "14px", color: "#6b7280" }}>
					{"Don't have an account? "}
					<a href="/auth/register">Register</a>
				</p>

				{/* Trusted static script for login flow — no user content */}
				<script dangerouslySetInnerHTML={{ __html: loginScript }} />
			</div>
		</Default>
	);
}
