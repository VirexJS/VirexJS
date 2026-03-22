import type { PageProps } from "virexjs";
import { defineParallelLoader, useHead } from "virexjs";
import Default from "../layouts/Default";

/**
 * Dashboard page — demonstrates defineParallelLoader.
 * All data sources run concurrently (not sequentially).
 */

interface DashboardData {
	stats: { users: number; revenue: string; orders: number; pageViews: number };
	recentOrders: { id: string; customer: string; amount: string; status: string }[];
	topProducts: { name: string; sold: number; revenue: string }[];
	systemHealth: { cpu: string; memory: string; uptime: string; requests: string };
}

export const loader = defineParallelLoader({
	stats: async () => {
		// Simulated DB query
		await new Promise((r) => setTimeout(r, 10));
		return { users: 12_847, revenue: "$48,293", orders: 342, pageViews: 89_412 };
	},
	recentOrders: async () => {
		await new Promise((r) => setTimeout(r, 10));
		return [
			{ id: "ORD-001", customer: "Alice", amount: "$129.99", status: "Shipped" },
			{ id: "ORD-002", customer: "Bob", amount: "$79.00", status: "Processing" },
			{ id: "ORD-003", customer: "Charlie", amount: "$249.50", status: "Delivered" },
			{ id: "ORD-004", customer: "Diana", amount: "$34.99", status: "Shipped" },
			{ id: "ORD-005", customer: "Eve", amount: "$189.00", status: "Processing" },
		];
	},
	topProducts: async () => {
		await new Promise((r) => setTimeout(r, 10));
		return [
			{ name: "Wireless Headphones", sold: 234, revenue: "$11,700" },
			{ name: "USB-C Hub", sold: 189, revenue: "$5,670" },
			{ name: "Mechanical Keyboard", sold: 156, revenue: "$15,600" },
			{ name: "Monitor Stand", sold: 98, revenue: "$4,900" },
		];
	},
	systemHealth: async () => {
		await new Promise((r) => setTimeout(r, 10));
		return {
			cpu: "23%",
			memory: "1.2 GB / 4 GB",
			uptime: "14d 6h 32m",
			requests: "1,247/min",
		};
	},
});

export default function Dashboard(props: PageProps<DashboardData>) {
	const { stats, recentOrders, topProducts, systemHealth } = props.data;

	const head = useHead({
		title: "Dashboard — VirexJS",
		description: "Dashboard with parallel data loading",
	});

	const cardStyle = {
		padding: "20px",
		background: "#fff",
		borderRadius: "12px",
		border: "1px solid #e5e7eb",
	};

	const statCards = [
		{ label: "Total Users", value: stats.users.toLocaleString(), color: "#3b82f6" },
		{ label: "Revenue", value: stats.revenue, color: "#22c55e" },
		{ label: "Orders", value: String(stats.orders), color: "#f59e0b" },
		{ label: "Page Views", value: stats.pageViews.toLocaleString(), color: "#8b5cf6" },
	];

	const statusColors: Record<string, string> = {
		Shipped: "#3b82f6",
		Processing: "#f59e0b",
		Delivered: "#22c55e",
	};

	return (
		<Default>
			{head}
			<div style={{ marginBottom: "24px" }}>
				<h1 style={{ margin: "0 0 4px" }}>Dashboard</h1>
				<p style={{ color: "#6b7280", margin: "0 0 8px", fontSize: "14px" }}>
					All 4 data sources loaded in parallel with{" "}
					<code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px" }}>
						defineParallelLoader()
					</code>
				</p>
				<pre
					style={{
						background: "#1e1e1e",
						color: "#d4d4d4",
						padding: "12px 16px",
						borderRadius: "8px",
						fontSize: "12px",
						overflow: "auto",
					}}
				>
					{`export const loader = defineParallelLoader({
  stats:        async () => db.query("SELECT ..."),
  recentOrders: async () => db.select("orders").limit(5),
  topProducts:  async () => db.select("products").orderBy("sold"),
  systemHealth: async () => fetchMetrics(),
});`}
				</pre>
			</div>

			{/* Stat Cards */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(4, 1fr)",
					gap: "12px",
					marginBottom: "24px",
				}}
			>
				{statCards.map((s) => (
					<div style={cardStyle}>
						<div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px" }}>
							{s.label}
						</div>
						<div style={{ fontSize: "24px", fontWeight: "700", color: s.color }}>{s.value}</div>
					</div>
				))}
			</div>

			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
				{/* Recent Orders */}
				<div style={cardStyle}>
					<h3 style={{ margin: "0 0 12px", fontSize: "15px" }}>Recent Orders</h3>
					<table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
						<thead>
							<tr style={{ borderBottom: "1px solid #e5e7eb" }}>
								<th style={{ textAlign: "left", padding: "6px 0", color: "#9ca3af" }}>ID</th>
								<th style={{ textAlign: "left", padding: "6px 0", color: "#9ca3af" }}>
									Customer
								</th>
								<th style={{ textAlign: "right", padding: "6px 0", color: "#9ca3af" }}>
									Amount
								</th>
								<th style={{ textAlign: "right", padding: "6px 0", color: "#9ca3af" }}>
									Status
								</th>
							</tr>
						</thead>
						<tbody>
							{recentOrders.map((o) => (
								<tr style={{ borderBottom: "1px solid #f3f4f6" }}>
									<td style={{ padding: "8px 0", fontFamily: "monospace", fontSize: "12px" }}>
										{o.id}
									</td>
									<td style={{ padding: "8px 0" }}>{o.customer}</td>
									<td style={{ padding: "8px 0", textAlign: "right", fontWeight: "600" }}>
										{o.amount}
									</td>
									<td style={{ padding: "8px 0", textAlign: "right" }}>
										<span
											style={{
												padding: "2px 8px",
												borderRadius: "12px",
												fontSize: "11px",
												fontWeight: "600",
												color: statusColors[o.status] ?? "#6b7280",
												background: `${statusColors[o.status] ?? "#6b7280"}15`,
											}}
										>
											{o.status}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Right column */}
				<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
					{/* Top Products */}
					<div style={cardStyle}>
						<h3 style={{ margin: "0 0 12px", fontSize: "15px" }}>Top Products</h3>
						{topProducts.map((p) => (
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									padding: "8px 0",
									borderBottom: "1px solid #f3f4f6",
									fontSize: "13px",
								}}
							>
								<div>
									<strong>{p.name}</strong>
									<span style={{ color: "#9ca3af", marginLeft: "8px" }}>
										{p.sold} sold
									</span>
								</div>
								<span style={{ fontWeight: "600", color: "#22c55e" }}>{p.revenue}</span>
							</div>
						))}
					</div>

					{/* System Health */}
					<div style={cardStyle}>
						<h3 style={{ margin: "0 0 12px", fontSize: "15px" }}>System Health</h3>
						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
							{Object.entries(systemHealth).map(([key, value]) => (
								<div>
									<div
										style={{
											fontSize: "11px",
											color: "#9ca3af",
											textTransform: "uppercase",
											letterSpacing: "0.05em",
										}}
									>
										{key}
									</div>
									<div style={{ fontSize: "14px", fontWeight: "600" }}>{value}</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</Default>
	);
}
