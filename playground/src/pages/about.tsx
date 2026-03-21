import type { PageProps } from "virexjs";
import { Link, useHead } from "virexjs";
import Default from "../layouts/Default";

export default function About(_props: PageProps) {
	const head = useHead({
		title: "About — VirexJS",
		description: "The story behind VirexJS — why we built it and how it works.",
		og: {
			title: "About VirexJS",
			type: "website",
			image: "/api/og?title=About+VirexJS&subtitle=The+Story",
		},
	});

	const milestones = [
		{ label: "931", desc: "Tests" },
		{ label: "87", desc: "Source files" },
		{ label: "0", desc: "Dependencies" },
		{ label: "50", desc: "Commits" },
	];

	return (
		<Default>
			{head}

			<div style={{ maxWidth: "650px", margin: "0 auto" }}>
				<div style={{ textAlign: "center", padding: "32px 0 24px" }}>
					<h1 style={{ fontSize: "28px", margin: "0 0 12px" }}>About VirexJS</h1>
					<p style={{ color: "#6b7280", fontSize: "16px", margin: 0, lineHeight: "1.7" }}>
						A full-stack web framework that proves you don{"'"}t need React, webpack, or hundreds of
						npm packages to build production web applications.
					</p>
				</div>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(4, 1fr)",
						gap: "1px",
						background: "#e5e7eb",
						borderRadius: "12px",
						overflow: "hidden",
						margin: "0 0 32px",
					}}
				>
					{milestones.map((m) => (
						<div style={{ background: "#fff", padding: "16px", textAlign: "center" }}>
							<div style={{ fontSize: "24px", fontWeight: "700", color: "#0066cc" }}>{m.label}</div>
							<div style={{ fontSize: "12px", color: "#9ca3af" }}>{m.desc}</div>
						</div>
					))}
				</div>

				<section style={{ marginBottom: "32px" }}>
					<h2 style={{ fontSize: "20px", margin: "0 0 12px" }}>Philosophy</h2>
					<ul style={{ color: "#4b5563", lineHeight: "1.8", paddingLeft: "20px" }}>
						<li>
							<strong>Zero JavaScript by default</strong> — Pages are pure server-rendered HTML.
							Only island components ship JS.
						</li>
						<li>
							<strong>Zero dependencies</strong> — Everything built on Bun native APIs. No supply
							chain risk.
						</li>
						<li>
							<strong>Built-in everything</strong> — Auth, DB, validation, i18n, CORS, CSRF, rate
							limiting.
						</li>
						<li>
							<strong>Type-safe</strong> — TypeScript strict mode. defineConfig, defineLoader,
							defineRoute, defineEnv.
						</li>
					</ul>
				</section>

				<section style={{ marginBottom: "32px" }}>
					<h2 style={{ fontSize: "20px", margin: "0 0 12px" }}>Architecture</h2>
					<pre
						style={{
							background: "#1e1e1e",
							color: "#d4d4d4",
							padding: "16px",
							borderRadius: "8px",
							fontSize: "13px",
							lineHeight: "1.6",
						}}
					>
						{`packages/
  virexjs/     Core (CLI, server, renderer, auth, validation)
  router/      File-based routing (trie matcher)
  bundler/     HMR, SSG, island bundling, CSS engine
  db/          SQLite ORM + migrations
playground/    This demo (19 pages, 10 islands)`}
					</pre>
				</section>

				<section style={{ marginBottom: "32px" }}>
					<h2 style={{ fontSize: "20px", margin: "0 0 12px" }}>Tech Stack</h2>
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
						{[
							["Runtime", "Bun 1.2+"],
							["Language", "TypeScript 5.x"],
							["Server", "Bun.serve()"],
							["Database", "bun:sqlite"],
							["Tests", "bun:test (931)"],
							["Linter", "Biome 2.x"],
						].map(([label, value]) => (
							<div
								style={{
									padding: "10px 14px",
									border: "1px solid #e5e7eb",
									borderRadius: "8px",
									fontSize: "14px",
								}}
							>
								<span style={{ color: "#9ca3af" }}>{label}: </span>
								<strong>{value}</strong>
							</div>
						))}
					</div>
				</section>

				<div style={{ textAlign: "center", padding: "16px 0" }}>
					<Link
						href="/features"
						style={{
							display: "inline-block",
							padding: "12px 28px",
							background: "#0066cc",
							color: "#fff",
							borderRadius: "8px",
							fontWeight: "600",
						}}
					>
						Explore All Features
					</Link>
				</div>
			</div>
		</Default>
	);
}
