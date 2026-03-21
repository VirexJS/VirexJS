import type { PageProps } from "virexjs";
import { ErrorBoundary, useHead } from "virexjs";
import Accordion from "../islands/Accordion";
import ColorPicker from "../islands/ColorPicker";
import Counter from "../islands/Counter";
import LikeButton from "../islands/LikeButton";
import Tabs from "../islands/Tabs";
import Timer from "../islands/Timer";
import TodoList from "../islands/TodoList";
import Toggle from "../islands/Toggle";
import Default from "../layouts/Default";

export default function Islands(_props: PageProps) {
	const head = useHead({
		title: "Islands — VirexJS",
		description: "Interactive island components — each one independently hydrated.",
	});

	return (
		<Default>
			{head}

			<div style={{ textAlign: "center", padding: "24px 0 16px" }}>
				<h1 style={{ fontSize: "28px", margin: "0 0 8px" }}>Island Components</h1>
				<p style={{ color: "#666", margin: "0 0 8px" }}>
					Each island below is server-rendered as static HTML, then independently hydrated on the
					client. Only island JavaScript is shipped — the rest of the page is pure HTML.
				</p>
				<p style={{ color: "#999", fontSize: "13px", margin: 0 }}>
					8 islands on this page, each with its own bundle.
				</p>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
				<section>
					<h2 style={{ fontSize: "18px", margin: "0 0 12px", color: "#333" }}>Counter</h2>
					<p style={{ color: "#666", fontSize: "14px", margin: "0 0 12px" }}>
						Increment/decrement a number. Basic state management.
					</p>
					<ErrorBoundary fallback={(err) => <p style={{ color: "red" }}>{err.message}</p>}>
						<Counter initial={0} />
					</ErrorBoundary>
				</section>

				<section>
					<h2 style={{ fontSize: "18px", margin: "0 0 12px", color: "#333" }}>Tabs</h2>
					<p style={{ color: "#666", fontSize: "14px", margin: "0 0 12px" }}>
						Switch between content panels. Index-based state.
					</p>
					<ErrorBoundary fallback={(err) => <p style={{ color: "red" }}>{err.message}</p>}>
						<Tabs />
					</ErrorBoundary>
				</section>

				<section>
					<h2 style={{ fontSize: "18px", margin: "0 0 12px", color: "#333" }}>Color Picker</h2>
					<p style={{ color: "#666", fontSize: "14px", margin: "0 0 12px" }}>
						Select a color from palette. Visual state feedback.
					</p>
					<ErrorBoundary fallback={(err) => <p style={{ color: "red" }}>{err.message}</p>}>
						<ColorPicker />
					</ErrorBoundary>
				</section>

				<section>
					<h2 style={{ fontSize: "18px", margin: "0 0 12px", color: "#333" }}>Todo List</h2>
					<p style={{ color: "#666", fontSize: "14px", margin: "0 0 12px" }}>
						Add, toggle, remove items. Complex array state with input handling.
					</p>
					<ErrorBoundary fallback={(err) => <p style={{ color: "red" }}>{err.message}</p>}>
						<TodoList />
					</ErrorBoundary>
				</section>

				<section>
					<h2 style={{ fontSize: "18px", margin: "0 0 12px", color: "#333" }}>Timer</h2>
					<p style={{ color: "#666", fontSize: "14px", margin: "0 0 12px" }}>
						Stopwatch with start/stop/reset. Interval-based state updates.
					</p>
					<ErrorBoundary fallback={(err) => <p style={{ color: "red" }}>{err.message}</p>}>
						<Timer />
					</ErrorBoundary>
				</section>

				<section>
					<h2 style={{ fontSize: "18px", margin: "0 0 12px", color: "#333" }}>Toggle</h2>
					<p style={{ color: "#666", fontSize: "14px", margin: "0 0 12px" }}>
						Show/hide content. Boolean state toggle.
					</p>
					<ErrorBoundary fallback={(err) => <p style={{ color: "red" }}>{err.message}</p>}>
						<Toggle label="Click to toggle" open={true} />
					</ErrorBoundary>
				</section>

				<section>
					<h2 style={{ fontSize: "18px", margin: "0 0 12px", color: "#333" }}>Accordion</h2>
					<p style={{ color: "#666", fontSize: "14px", margin: "0 0 12px" }}>
						Expandable FAQ sections. Click to open/close panels.
					</p>
					<ErrorBoundary fallback={(err) => <p style={{ color: "red" }}>{err.message}</p>}>
						<Accordion />
					</ErrorBoundary>
				</section>

				<section>
					<h2 style={{ fontSize: "18px", margin: "0 0 12px", color: "#333" }}>
						Like Button <code style={{ fontSize: "12px", color: "#9ca3af" }}>{'"use client"'}</code>
					</h2>
					<p style={{ color: "#666", fontSize: "14px", margin: "0 0 12px" }}>
						Uses the Next.js-compatible {'"use client"'} directive. Toggle like state.
					</p>
					<ErrorBoundary fallback={(err) => <p style={{ color: "red" }}>{err.message}</p>}>
						<LikeButton />
					</ErrorBoundary>
				</section>
			</div>

			<div
				style={{
					marginTop: "32px",
					padding: "16px",
					background: "#f0f7ff",
					borderRadius: "8px",
					fontSize: "14px",
					color: "#555",
				}}
			>
				<strong>How islands work:</strong>
				<ol style={{ margin: "8px 0 0", paddingLeft: "20px", lineHeight: "1.8" }}>
					<li>
						Place component in <code>src/islands/</code> or add <code>{'// "use island"'}</code>{" "}
						directive
					</li>
					<li>Server renders static HTML with hydration markers</li>
					<li>Client runtime discovers markers, loads island JS bundles</li>
					<li>
						Each island is independently hydrated based on strategy (visible, interaction, idle,
						immediate)
					</li>
					<li>
						State is managed via <code>_state</code> + <code>_rerender</code> pattern
					</li>
				</ol>
			</div>
		</Default>
	);
}
