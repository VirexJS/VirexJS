import type { LoaderContext, PageProps } from "virexjs";
import { useHead } from "virexjs";
import { users } from "../db/schema";

export async function loader(_ctx: LoaderContext) {
	const user = users.findOne({ id: 1 }) as Record<string, unknown> | null;
	return { name: user?.name ?? "User", email: user?.email ?? "", plan: user?.plan ?? "free" };
}

export default function Settings(props: PageProps<{ name: string; email: string; plan: string }>) {
	const { name, email, plan } = props.data;
	const head = useHead({ title: "Settings" });
	const input = { width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" as const };

	return (
		<div style={{ maxWidth: "500px", margin: "40px auto", padding: "0 16px", fontFamily: "system-ui" }}>
			{head}
			<h1 style={{ fontSize: "24px", margin: "0 0 24px" }}>Settings</h1>

			<div style={{ padding: "20px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", marginBottom: "16px" }}>
				<h2 style={{ fontSize: "16px", margin: "0 0 16px" }}>Profile</h2>
				<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
					<div>
						<label htmlFor="name" style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#6b7280" }}>Name</label>
						<input id="name" value={name} style={input} />
					</div>
					<div>
						<label htmlFor="email" style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#6b7280" }}>Email</label>
						<input id="email" value={email} style={input} />
					</div>
				</div>
			</div>

			<div style={{ padding: "20px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
				<h2 style={{ fontSize: "16px", margin: "0 0 8px" }}>Plan</h2>
				<p style={{ margin: "0 0 12px", fontSize: "14px", color: "#6b7280" }}>
					Current plan: <strong style={{ color: "#0066cc" }}>{plan.charAt(0).toUpperCase() + plan.slice(1)}</strong>
				</p>
				<a href="/#pricing" style={{ padding: "8px 16px", background: "#f3f4f6", borderRadius: "6px", textDecoration: "none", fontSize: "14px", color: "#111" }}>
					Change Plan
				</a>
			</div>
		</div>
	);
}
