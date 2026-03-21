import type { MetaData } from "virexjs";
import Default from "../layouts/Default";

export function meta(): MetaData {
	return {
		title: "About — VirexJS",
		description: "Learn about VirexJS and its philosophy.",
	};
}

/** Static about page — no loader needed */
export default function About() {
	return (
		<Default>
			<h1>About VirexJS</h1>
			<p style={{ color: "#666", fontSize: "18px", lineHeight: "1.6" }}>
				VirexJS is a next-generation web framework that ships HTML, not JavaScript. Built on Bun
				runtime, it delivers blazing-fast performance with zero client-side JavaScript by default.
			</p>

			<h2>Core Principles</h2>
			<ul style={{ lineHeight: "1.8", color: "#444" }}>
				<li>Zero JavaScript shipped to client by default</li>
				<li>Islands architecture for selective hydration</li>
				<li>Server-side rendering with streaming HTML</li>
				<li>File-based routing with dynamic params</li>
				<li>Built on Bun — no Node.js required</li>
				<li>Zero external npm dependencies</li>
			</ul>

			<h2>Tech Stack</h2>
			<ul style={{ lineHeight: "1.8", color: "#444" }}>
				<li>Runtime: Bun 1.2+</li>
				<li>Language: TypeScript 5.x (strict mode)</li>
				<li>Database: bun:sqlite</li>
				<li>Test Runner: bun:test</li>
			</ul>
		</Default>
	);
}
