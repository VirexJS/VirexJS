import { getDB } from "@virexjs/db";
import type { LoaderContext, PageProps } from "virexjs";
import { useHead } from "virexjs";
import Default from "../../layouts/Default";

interface User {
	id: number;
	email: string;
	name: string;
	created_at: string;
}

interface UsersData {
	users: User[];
}

export async function loader(_ctx: LoaderContext) {
	const db = getDB();
	let users: User[] = [];
	try {
		users = db
			.query("SELECT id, email, name, created_at FROM users ORDER BY id DESC")
			.all() as User[];
	} catch {
		/* table may not exist */
	}
	return { users };
}

export default function AdminUsers(props: PageProps<UsersData>) {
	const { users } = props.data;
	const head = useHead({ title: "Users — Admin — VirexJS" });

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
					<a href="/admin" style={{ fontSize: "13px", color: "#6b7280" }}>
						{"← Back to Dashboard"}
					</a>
					<h1 style={{ fontSize: "24px", margin: "8px 0 0" }}>Users ({users.length})</h1>
				</div>
			</div>

			<div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
				<table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
					<thead>
						<tr style={{ background: "#f9fafb" }}>
							<th
								style={{
									textAlign: "left",
									padding: "12px 16px",
									borderBottom: "1px solid #e5e7eb",
									fontWeight: "600",
									color: "#374151",
								}}
							>
								ID
							</th>
							<th
								style={{
									textAlign: "left",
									padding: "12px 16px",
									borderBottom: "1px solid #e5e7eb",
									fontWeight: "600",
									color: "#374151",
								}}
							>
								Name
							</th>
							<th
								style={{
									textAlign: "left",
									padding: "12px 16px",
									borderBottom: "1px solid #e5e7eb",
									fontWeight: "600",
									color: "#374151",
								}}
							>
								Email
							</th>
							<th
								style={{
									textAlign: "left",
									padding: "12px 16px",
									borderBottom: "1px solid #e5e7eb",
									fontWeight: "600",
									color: "#374151",
								}}
							>
								Created
							</th>
						</tr>
					</thead>
					<tbody>
						{users.map((user) => (
							<tr>
								<td
									style={{
										padding: "12px 16px",
										borderBottom: "1px solid #f3f4f6",
										color: "#6b7280",
									}}
								>
									{user.id}
								</td>
								<td
									style={{
										padding: "12px 16px",
										borderBottom: "1px solid #f3f4f6",
										fontWeight: "500",
									}}
								>
									{user.name}
								</td>
								<td
									style={{
										padding: "12px 16px",
										borderBottom: "1px solid #f3f4f6",
										color: "#6b7280",
									}}
								>
									{user.email}
								</td>
								<td
									style={{
										padding: "12px 16px",
										borderBottom: "1px solid #f3f4f6",
										color: "#9ca3af",
										fontSize: "13px",
									}}
								>
									{user.created_at.split("T")[0]}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div style={{ marginTop: "16px", fontSize: "13px", color: "#9ca3af" }}>
				Data from <code>defineTable("users", ...)</code> — auto-created SQLite table with prepared
				statement CRUD.
			</div>
		</Default>
	);
}
