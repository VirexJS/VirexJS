import type { PageProps } from "virexjs";
import { useHead } from "virexjs";
import Default from "../layouts/Default";

/**
 * Streaming demo — this page uses an async loader.
 * Because _loading.tsx exists, VirexJS sends the loading shell
 * instantly while data loads (Suspense-like streaming).
 */

interface StreamingData {
	items: { id: number; name: string; delay: number }[];
	loadTime: number;
}

export async function loader() {
	const start = performance.now();

	// Simulate slow data loading (database, external API, etc.)
	await new Promise((r) => setTimeout(r, 200));

	return {
		items: [
			{ id: 1, name: "Database query completed", delay: 50 },
			{ id: 2, name: "External API fetched", delay: 120 },
			{ id: 3, name: "Cache warmed", delay: 30 },
			{ id: 4, name: "Aggregations computed", delay: 200 },
		],
		loadTime: Math.round(performance.now() - start),
	};
}

export function meta() {
	return {
		title: "Async Streaming — VirexJS",
		description: "Suspense-like async streaming without React",
	};
}

export default function Streaming(props: PageProps<StreamingData>) {
	const { items, loadTime } = props.data;

	const head = useHead({
		title: "Async Streaming — VirexJS",
		description: "Suspense-like streaming demo",
	});

	return (
		<Default>
			{head}
			<h1 style={{ margin: "0 0 8px" }}>Async Streaming</h1>
			<p style={{ color: "#6b7280", margin: "0 0 24px" }}>
				This page uses <code>renderPageAsync()</code> — the loading spinner was shown instantly
				while data loaded in {loadTime}ms.
			</p>

			<div
				style={{
					background: "#f0fdf4",
					border: "1px solid #bbf7d0",
					borderRadius: "8px",
					padding: "16px",
					marginBottom: "24px",
				}}
			>
				<strong style={{ color: "#16a34a" }}>How it works:</strong>
				<ol style={{ margin: "8px 0 0", paddingLeft: "20px", color: "#374151", fontSize: "14px" }}>
					<li>Browser requests this page</li>
					<li>
						Server sends <code>&lt;head&gt;</code> + loading shell instantly (fast TTFB)
					</li>
					<li>Server awaits async data (loader function)</li>
					<li>Server streams rendered HTML and swaps out loading shell</li>
					<li>No client JavaScript required!</li>
				</ol>
			</div>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: "12px",
					marginBottom: "24px",
				}}
			>
				{items.map((item) => (
					<div
						style={{
							padding: "16px",
							background: "#fff",
							border: "1px solid #e5e7eb",
							borderRadius: "8px",
						}}
					>
						<div style={{ display: "flex", justifyContent: "space-between" }}>
							<strong style={{ fontSize: "14px" }}>{item.name}</strong>
							<span
								style={{
									fontSize: "12px",
									color: "#9ca3af",
									background: "#f3f4f6",
									padding: "2px 8px",
									borderRadius: "4px",
								}}
							>
								{item.delay}ms
							</span>
						</div>
					</div>
				))}
			</div>

			<pre
				style={{
					background: "#1e1e1e",
					color: "#d4d4d4",
					padding: "16px",
					borderRadius: "8px",
					fontSize: "12px",
					overflow: "auto",
				}}
			>
				{`// src/pages/streaming.tsx
export async function loader() {
  // This runs on the server — loading shell shows while it runs
  await new Promise(r => setTimeout(r, 200));
  return { items: await db.select("tasks").all() };
}

// src/pages/_loading.tsx
export default function Loading() {
  return <div class="spinner">Loading...</div>;
}`}
			</pre>
		</Default>
	);
}
