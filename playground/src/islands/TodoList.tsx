// "use island"

/**
 * Todo list island — add/remove/toggle items.
 * Shows complex state management with arrays in islands.
 */

interface Todo {
	id: number;
	text: string;
	done: boolean;
}

interface TodoListProps {
	items?: Todo[];
	nextId?: number;
	_state?: Record<string, unknown>;
	_rerender?: () => void;
}

export default function TodoList(props: TodoListProps) {
	const defaultItems: Todo[] = [
		{ id: 1, text: "Learn VirexJS", done: true },
		{ id: 2, text: "Build an app", done: false },
		{ id: 3, text: "Ship to production", done: false },
	];
	const items: Todo[] = (props.items as Todo[]) ?? defaultItems;
	const nextId = (props.nextId as number) ?? 4;
	const remaining = items.filter((t) => !t.done).length;

	// Bootstrap state on first hydration call
	if (props._state) {
		if (props._state.items === undefined) props._state.items = [...defaultItems];
		if (props._state.nextId === undefined) props._state.nextId = 4;
	}

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

			<div style={{ padding: "0" }}>
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
								if (props._state && props._rerender) {
									const list = props._state.items as Todo[];
									const item = list.find((t) => t.id === todo.id);
									if (item) item.done = !item.done;
									props._rerender();
								}
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
								lineHeight: "16px",
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
							onClick={() => {
								if (props._state && props._rerender) {
									props._state.items = (props._state.items as Todo[]).filter(
										(t) => t.id !== todo.id,
									);
									props._rerender();
								}
							}}
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
						if (props._state && props._rerender) {
							// Read input value directly from DOM
							const input =
								typeof document !== "undefined"
									? document.querySelector<HTMLInputElement>("[data-todo-input]")
									: null;
							const text = input?.value?.trim() ?? "";
							if (text) {
								const list = props._state.items as Todo[];
								list.push({ id: nextId, text, done: false });
								props._state.nextId = nextId + 1;
								props._rerender();
							}
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
