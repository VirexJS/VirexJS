import type { LoaderContext, PageProps } from "virexjs";
import { useHead } from "virexjs";
import { projects } from "../../db/schema";

interface Project { id: number; name: string; description: string; status: string; created_at: string }

export async function loader(_ctx: LoaderContext) {
	return { projects: projects.findMany({ where: { user_id: 1 }, orderBy: "id DESC" }) as unknown as Project[] };
}

export default function Projects(props: PageProps<{ projects: Project[] }>) {
	const head = useHead({ title: "Projects" });

	return (
		<div>
			{head}
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
				<h1 style={{ fontSize: "24px", margin: 0 }}>Projects</h1>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
				{props.data.projects.map((p) => (
					<div style={{ padding: "16px", background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<div>
							<strong style={{ fontSize: "15px" }}>{p.name}</strong>
							<p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "13px" }}>{p.description}</p>
						</div>
						<span style={{
							padding: "4px 10px",
							borderRadius: "12px",
							fontSize: "12px",
							fontWeight: "500",
							background: p.status === "active" ? "#dcfce7" : "#f3f4f6",
							color: p.status === "active" ? "#16a34a" : "#6b7280",
						}}>
							{p.status}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
