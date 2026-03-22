"use client";
import { useIslandState } from "virexjs";

const ITEMS = [
	"File-based routing",
	"Islands architecture",
	"Server-side rendering",
	"Static site generation",
	"JWT authentication",
	"Form validation",
	"Internationalization",
	"WebSocket support",
	"Server-Sent Events",
	"SQLite database",
	"CORS middleware",
	"Rate limiting",
	"CSRF protection",
	"Security headers",
	"Error boundaries",
];

export default function SearchBox(props: { query?: string }) {
	const { get, set } = useIslandState(props, { query: "" });
	const query = get("query");

	const filtered = query
		? ITEMS.filter((item) => item.toLowerCase().includes(query.toLowerCase()))
		: ITEMS;

	return (
		<div
			style={{
				border: "1px solid #e5e7eb",
				borderRadius: "8px",
				overflow: "hidden",
				maxWidth: "350px",
			}}
		>
			<div style={{ padding: "8px", borderBottom: "1px solid #e5e7eb" }}>
				<input
					type="text"
					data-search-input="true"
					placeholder="Search features..."
					value={query}
					onInput={() => {
						const input =
							typeof document !== "undefined"
								? document.querySelector<HTMLInputElement>("[data-search-input]")
								: null;
						if (input) set("query", input.value);
					}}
					style={{
						width: "100%",
						padding: "8px 12px",
						border: "1px solid #d1d5db",
						borderRadius: "6px",
						fontSize: "14px",
						boxSizing: "border-box",
					}}
				/>
			</div>
			<div style={{ maxHeight: "200px", overflow: "auto" }}>
				{filtered.length > 0 ? (
					filtered.map((item) => (
						<div
							style={{
								padding: "8px 12px",
								borderBottom: "1px solid #f3f4f6",
								fontSize: "14px",
								color: "#374151",
							}}
						>
							{item}
						</div>
					))
				) : (
					<div style={{ padding: "16px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
						No results
					</div>
				)}
			</div>
			<div
				style={{ padding: "6px 12px", background: "#f9fafb", fontSize: "12px", color: "#9ca3af" }}
			>
				{filtered.length} / {ITEMS.length} features
			</div>
		</div>
	);
}
