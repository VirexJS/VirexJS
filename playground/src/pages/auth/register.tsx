import type { PageProps } from "virexjs";
import { useHead } from "virexjs";
import Default from "../../layouts/Default";

/**
 * Register page — JWT auth registration flow.
 * The inline script is a static trusted template (no user-generated content).
 * dangerouslySetInnerHTML is safe here because the script content is hardcoded.
 */
export default function Register(_props: PageProps) {
	const head = useHead({ title: "Register — VirexJS" });

	const inputStyle = {
		width: "100%",
		padding: "10px 14px",
		border: "1px solid #d1d5db",
		borderRadius: "8px",
		fontSize: "14px",
		boxSizing: "border-box" as const,
	};

	// Static trusted script content — no user input
	const registerScript = [
		"document.getElementById('register-btn').addEventListener('click', async function() {",
		"  var name = document.getElementById('name').value;",
		"  var email = document.getElementById('email').value;",
		"  var password = document.getElementById('password').value;",
		"  var errorDiv = document.getElementById('register-error');",
		"  try {",
		"    var res = await fetch('/api/auth', {",
		"      method: 'POST',",
		"      headers: { 'Content-Type': 'application/json' },",
		"      body: JSON.stringify({ action: 'register', name: name, email: email, password: password })",
		"    });",
		"    var data = await res.json();",
		"    if (data.token) {",
		"      localStorage.setItem('vrx_token', data.token);",
		"      localStorage.setItem('vrx_user', JSON.stringify(data.user));",
		"      window.location.href = '/admin';",
		"    } else {",
		"      errorDiv.textContent = data.error || 'Registration failed';",
		"      errorDiv.style.display = 'block';",
		"    }",
		"  } catch(e) {",
		"    errorDiv.textContent = 'Network error';",
		"    errorDiv.style.display = 'block';",
		"  }",
		"});",
	].join("\n");

	return (
		<Default>
			{head}
			<div style={{ maxWidth: "400px", margin: "40px auto" }}>
				<div style={{ textAlign: "center", marginBottom: "32px" }}>
					<h1 style={{ fontSize: "24px", margin: "0 0 8px" }}>Create Account</h1>
					<p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
						JWT auth with password hashing
					</p>
				</div>

				<div
					id="register-error"
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
							htmlFor="name"
							style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}
						>
							Name
						</label>
						<input id="name" type="text" placeholder="Your name" style={inputStyle} />
					</div>
					<div>
						<label
							htmlFor="email"
							style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}
						>
							Email
						</label>
						<input id="email" type="email" placeholder="you@example.com" style={inputStyle} />
					</div>
					<div>
						<label
							htmlFor="password"
							style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}
						>
							Password (min 6 chars)
						</label>
						<input id="password" type="password" placeholder="Password" style={inputStyle} />
					</div>
					<button
						type="button"
						id="register-btn"
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
						Create Account
					</button>
				</div>

				<p style={{ textAlign: "center", marginTop: "16px", fontSize: "14px", color: "#6b7280" }}>
					Already have an account? <a href="/auth/login">Sign in</a>
				</p>

				<script dangerouslySetInnerHTML={{ __html: registerScript }} />
			</div>
		</Default>
	);
}
