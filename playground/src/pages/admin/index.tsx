import { getDB } from "@virexjs/db";
import type { LoaderContext, PageProps } from "virexjs";
import { useHead } from "virexjs";
import Default from "../../layouts/Default";

interface AdminData {
	userCount: number;
	noteCount: number;
	uptime: number;
	memoryMB: number;
	bunVersion: string;
}

export async function loader(_ctx: LoaderContext) {
	const db = getDB();
	let userCount = 0;
	let noteCount = 0;
	try {
		const uc = db.query("SELECT COUNT(*) as c FROM users").get() as { c: number } | null;
		userCount = uc?.c ?? 0;
	} catch {
		/* table may not exist */
	}
	try {
		const nc = db.query("SELECT COUNT(*) as c FROM notes").get() as { c: number } | null;
		noteCount = nc?.c ?? 0;
	} catch {
		/* table may not exist */
	}

	return {
		userCount,
		noteCount,
		uptime: Math.round(process.uptime()),
		memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
		bunVersion: Bun.version,
	};
}

export default function AdminDashboard(props: PageProps<AdminData>) {
	const { userCount, noteCount, uptime, memoryMB, bunVersion } = props.data;

	const head = useHead({
		title: "Admin Dashboard — VirexJS",
		description: "Server metrics, database stats, and management.",
	});

	const cardStyle = {
		padding: "20px",
		background: "#fff",
		border: "1px solid #e5e7eb",
		borderRadius: "12px",
	};

	const stats = [
		{ label: "Users", value: String(userCount), color: "#3b82f6" },
		{ label: "Notes", value: String(noteCount), color: "#22c55e" },
		{ label: "Uptime", value: `${uptime}s`, color: "#f59e0b" },
		{ label: "Memory", value: `${memoryMB}MB`, color: "#a855f7" },
	];

	return (
		<Default>
			{head}

			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "24px",
				}}
			>
				<div>
					<h1 style={{ fontSize: "24px", margin: "0 0 4px" }}>Admin Dashboard</h1>
					<p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
						Bun {bunVersion} — Server metrics and database management
					</p>
				</div>
				<div style={{ display: "flex", gap: "8px" }}>
					<a
						href="/auth/login"
						style={{
							padding: "8px 16px",
							background: "#f3f4f6",
							borderRadius: "6px",
							fontSize: "13px",
							color: "#374151",
						}}
					>
						Login
					</a>
				</div>
			</div>

			{/* Stats Grid */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(4, 1fr)",
					gap: "12px",
					marginBottom: "24px",
				}}
			>
				{stats.map((s) => (
					<div style={cardStyle}>
						<div style={{ fontSize: "28px", fontWeight: "700", color: s.color }}>{s.value}</div>
						<div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "4px" }}>{s.label}</div>
					</div>
				))}
			</div>

			{/* Live Metrics */}
			<div style={{ ...cardStyle, marginBottom: "24px" }}>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "16px",
					}}
				>
					<h2 style={{ margin: 0, fontSize: "18px" }}>Live Server Metrics</h2>
					<span
						style={{
							padding: "4px 10px",
							background: "#dcfce7",
							color: "#16a34a",
							borderRadius: "20px",
							fontSize: "12px",
							fontWeight: "600",
						}}
					>
						LIVE
					</span>
				</div>
				<div id="metrics-container" style={{ fontSize: "14px", color: "#6b7280" }}>
					<p style={{ margin: "0 0 8px" }}>
						Connect to <code>/api/events</code> for real-time server events via SSE.
					</p>
					<pre
						style={{
							background: "#1e1e1e",
							color: "#d4d4d4",
							padding: "12px",
							borderRadius: "8px",
							fontSize: "12px",
						}}
					>
						{`const events = new EventSource("/api/events");
events.addEventListener("tick", (e) => {
  const data = JSON.parse(e.data);
  console.log("Server tick:", data.count, data.time);
});`}
					</pre>
				</div>
			</div>

			{/* Quick Actions */}
			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
				<a href="/admin/users" style={{ ...cardStyle, textDecoration: "none", color: "inherit" }}>
					<h3 style={{ margin: "0 0 4px", fontSize: "16px" }}>Manage Users</h3>
					<p style={{ margin: 0, color: "#9ca3af", fontSize: "13px" }}>
						{userCount} users — view, create, delete
					</p>
				</a>
				<a href="/admin/notes" style={{ ...cardStyle, textDecoration: "none", color: "inherit" }}>
					<h3 style={{ margin: "0 0 4px", fontSize: "16px" }}>Manage Notes</h3>
					<p style={{ margin: 0, color: "#9ca3af", fontSize: "13px" }}>
						{noteCount} notes — CRUD operations
					</p>
				</a>
			</div>

			{/* API Info */}
			<div
				style={{
					marginTop: "24px",
					padding: "16px",
					background: "#f0f7ff",
					borderRadius: "8px",
					fontSize: "13px",
				}}
			>
				<strong>Auth API:</strong> <code>POST /api/auth</code> with{" "}
				<code>{`{"action":"login","email":"admin@virexjs.dev","password":"admin123"}`}</code>{" "}
				returns JWT token. Use <code>Authorization: Bearer TOKEN</code> for protected routes.
			</div>
		</Default>
	);
}
