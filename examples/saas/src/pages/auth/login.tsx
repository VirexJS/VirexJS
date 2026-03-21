import type { PageProps } from "virexjs";
import { Link, useHead } from "virexjs";

export default function Login(_props: PageProps) {
	const head = useHead({ title: "Login" });
	const input = { width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" as const };

	return (
		<div style={{ maxWidth: "380px", margin: "80px auto", padding: "0 16px", fontFamily: "system-ui" }}>
			{head}
			<h1 style={{ fontSize: "24px", textAlign: "center", margin: "0 0 24px" }}>Sign In</h1>
			<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
				<div>
					<label htmlFor="email" style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Email</label>
					<input id="email" type="email" placeholder="demo@example.com" style={input} />
				</div>
				<div>
					<label htmlFor="password" style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Password</label>
					<input id="password" type="password" placeholder="Password" style={input} />
				</div>
				<button type="button" style={{ padding: "12px", background: "#0066cc", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>
					Sign In
				</button>
			</div>
			<p style={{ textAlign: "center", marginTop: "16px", fontSize: "14px", color: "#6b7280" }}>
				{"No account? "}<Link href="/auth/register">Register</Link>
			</p>
		</div>
	);
}
