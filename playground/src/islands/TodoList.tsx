// "use island"
import { useIslandState } from "virexjs";

interface Todo {
	id: number;
	text: string;
	done: boolean;
}

const DEFAULTS: Todo[] = [
	{ id: 1, text: "Learn VirexJS", done: true },
	{ id: 2, text: "Build an app", done: false },
	{ id: 3, text: "Ship to production", done: false },
];

export default function TodoList(props: { items?: Todo[]; nextId?: number }) {
	const { get, set } = useIslandState(props, { items: [...DEFAULTS], nextId: 4 });
	const items = get("items") as Todo[];
	const nextId = get("nextId") as number;
	const remaining = items.filter((t) => !t.done).length;

	return (
		<div
			style={{
				border: "1px solid #ddd",
				borderRadius: "8px",
				overflow: "hidden",
				maxWidth: "400px",
			}}
		>
			<div style={{ padding: "12px 16px", background: "#fafafa", borderBottom: "1px solid #ddd" }}>
				<strong style={{ fontSize: "16px" }}>Todo List</strong>
				<span style={{ float: "right", color: "#999", fontSize: "13px" }}>
					{remaining} remaining
				</span>
			</div>
			<div>
				{items.map((todo) => (
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							padding: "10px 16px",
							borderBottom: "1px solid #f0f0f0",
						}}
					>
						<button
							type="button"
							onClick={() => {
								const updated = items.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t));
								set("items", updated);
							}}
							style={{
								width: "20px",
								height: "20px",
								borderRadius: "4px",
								border: "2px solid #ddd",
								background: todo.done ? "#22c55e" : "#fff",
								cursor: "pointer",
								padding: 0,
								color: "#fff",
								fontSize: "12px",
							}}
						>
							{todo.done ? "\u2713" : ""}
						</button>
						<span
							style={{
								flex: 1,
								textDecoration: todo.done ? "line-through" : "none",
								color: todo.done ? "#999" : "#333",
								fontSize: "14px",
							}}
						>
							{todo.text}
						</span>
						<button
							type="button"
							onClick={() =>
								set(
									"items",
									items.filter((t) => t.id !== todo.id),
								)
							}
							style={{
								border: "none",
								background: "none",
								color: "#ccc",
								cursor: "pointer",
								fontSize: "16px",
								padding: "0 4px",
							}}
						>
							{"\u00d7"}
						</button>
					</div>
				))}
			</div>
			<div style={{ display: "flex", padding: "8px", gap: "8px", borderTop: "1px solid #eee" }}>
				<input
					type="text"
					data-todo-input="true"
					placeholder="Add a todo..."
					style={{
						flex: 1,
						padding: "8px 12px",
						border: "1px solid #ddd",
						borderRadius: "4px",
						fontSize: "14px",
					}}
				/>
				<button
					type="button"
					onClick={() => {
						const input =
							typeof document !== "undefined"
								? document.querySelector<HTMLInputElement>("[data-todo-input]")
								: null;
						const text = input?.value?.trim() ?? "";
						if (text) {
							set("items", [...items, { id: nextId, text, done: false }]);
							set("nextId", nextId + 1);
							if (input) input.value = "";
						}
					}}
					style={{
						padding: "8px 16px",
						background: "#0066cc",
						color: "#fff",
						border: "none",
						borderRadius: "4px",
						cursor: "pointer",
						fontSize: "14px",
					}}
				>
					Add
				</button>
			</div>
		</div>
	);
}
