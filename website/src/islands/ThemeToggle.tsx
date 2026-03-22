"use island";
import { useSharedStore } from "virexjs";

export default function ThemeToggle(props: Record<string, unknown>) {
	const store = useSharedStore(props);
	store.subscribe("theme");

	const dark = store.get("theme") === "dark";

	return (
		<button
			type="button"
			onClick={() => {
				const newTheme = store.get("theme") === "dark" ? "light" : "dark";
				store.set("theme", newTheme);
				document.body.style.background = newTheme === "dark" ? "#0f172a" : "#fff";
				document.body.style.color = newTheme === "dark" ? "#e2e8f0" : "#1a1a2e";
			}}
			style={{
				padding: "6px 14px",
				background: dark ? "#334155" : "#f1f5f9",
				color: dark ? "#e2e8f0" : "#1e293b",
				border: "none",
				borderRadius: "6px",
				cursor: "pointer",
				fontSize: "14px",
				fontWeight: "500",
			}}
		>
			{dark ? "Light" : "Dark"}
		</button>
	);
}
