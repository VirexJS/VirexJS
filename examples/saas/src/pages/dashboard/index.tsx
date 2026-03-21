import type { LoaderContext, PageProps } from "virexjs";
import { useHead } from "virexjs";
import { projects, users } from "../../db/schema";

interface DashData {
	projectCount: number;
	activeCount: number;
	plan: string;
	name: string;
}

export async function loader(_ctx: LoaderContext) {
	const user = users.findOne({ id: 1 }) as Record<string, unknown> | null;
	const allProjects = projects.findMany({ where: { user_id: 1 } });
	const active = projects.findMany({ where: { user_id: 1, status: "active" } });

	return {
		projectCount: allProjects.length,
		activeCount: active.length,
		plan: (user?.plan as string) ?? "free",
		name: (user?.name as string) ?? "User",
	};
}

export default function Dashboard(props: PageProps<DashData>) {
	const { projectCount, activeCount, plan, name } = props.data;
	const head = useHead({ title: "Dashboard" });

	const stats = [
		{ label: "Projects", value: String(projectCount), color: "#3b82f6" },
		{ label: "Active", value: String(activeCount), color: "#22c55e" },
		{ label: "Plan", value: plan.charAt(0).toUpperCase() + plan.slice(1), color: "#a855f7" },
	];

	return (
		<div>
			{head}
			<h1 style={{ fontSize: "24px", margin: "0 0 4px" }}>Welcome back, {name}</h1>
			<p style={{ color: "#6b7280", margin: "0 0 24px", fontSize: "14px" }}>
				{"Here's what's happening with your projects."}
			</p>

			<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
				{stats.map((s) => (
					<div style={{ padding: "20px", background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
						<div style={{ fontSize: "28px", fontWeight: "700", color: s.color }}>{s.value}</div>
						<div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "4px" }}>{s.label}</div>
					</div>
				))}
			</div>

			<div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", padding: "20px" }}>
				<h2 style={{ fontSize: "18px", margin: "0 0 16px" }}>Quick Actions</h2>
				<div style={{ display: "flex", gap: "8px" }}>
					<a href="/dashboard/projects" style={{ padding: "8px 16px", background: "#0066cc", color: "#fff", borderRadius: "6px", textDecoration: "none", fontSize: "14px" }}>
						View Projects
					</a>
					<a href="/settings" style={{ padding: "8px 16px", background: "#f3f4f6", borderRadius: "6px", textDecoration: "none", fontSize: "14px", color: "#111" }}>
						Settings
					</a>
				</div>
			</div>
		</div>
	);
}
