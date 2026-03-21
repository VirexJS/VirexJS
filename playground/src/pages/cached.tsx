"use cache";

import type { LoaderContext, PageProps } from "virexjs";
import { useHead } from "virexjs";
import LikeButton from "../islands/LikeButton";
import Default from "../layouts/Default";

/** ISR revalidation — page re-renders every 30 seconds */
export const revalidate = 30;

interface CachedData {
	randomNumber: number;
	generatedAt: string;
	fact: string;
}

export async function loader(_ctx: LoaderContext) {
	// Simulate expensive data fetch
	const facts = [
		"VirexJS ships 0 KB of JavaScript by default.",
		"Bun is 3-5x faster than Node.js for HTTP serving.",
		"Islands architecture only hydrates interactive components.",
		"VirexJS has 864+ tests with zero external dependencies.",
		"The ISR cache serves stale content while revalidating in background.",
		"File-based routing supports dynamic [params] and catch-all [...rest].",
		"VirexJS supports JWT auth, sessions, CSRF, and rate limiting built-in.",
	];

	return {
		randomNumber: Math.floor(Math.random() * 1000),
		generatedAt: new Date().toISOString(),
		fact: facts[Math.floor(Math.random() * facts.length)]!,
	};
}

export default function CachedPage(props: PageProps<CachedData>) {
	const { randomNumber, generatedAt, fact } = props.data;

	const head = useHead({
		title: "Cached Page — VirexJS",
		description: "ISR demo — this page is cached and revalidated every 30 seconds.",
	});

	return (
		<Default>
			{head}

			<div style={{ maxWidth: "600px", margin: "0 auto" }}>
				<div style={{ textAlign: "center", padding: "32px 0" }}>
					<span
						style={{
							display: "inline-block",
							padding: "4px 12px",
							background: "#fef3c7",
							color: "#b45309",
							borderRadius: "16px",
							fontSize: "13px",
							fontWeight: "500",
							marginBottom: "16px",
						}}
					>
						ISR — Revalidates every 30s
					</span>
					<h1 style={{ fontSize: "28px", margin: "0 0 8px" }}>Cached Page</h1>
					<p style={{ color: "#6b7280", margin: 0 }}>
						This page uses <code>{'"use cache"'}</code> directive + <code>revalidate = 30</code>
					</p>
				</div>

				<div
					style={{
						padding: "20px",
						background: "#f9fafb",
						borderRadius: "12px",
						border: "1px solid #e5e7eb",
						marginBottom: "16px",
					}}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: "12px",
						}}
					>
						<strong>Random Number</strong>
						<span style={{ fontSize: "32px", fontWeight: "700", color: "#0066cc" }}>
							{randomNumber}
						</span>
					</div>
					<p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>
						Generated at: {generatedAt}
					</p>
				</div>

				<div
					style={{
						padding: "16px",
						background: "#f0f7ff",
						borderRadius: "8px",
						fontSize: "14px",
						color: "#1e40af",
						marginBottom: "16px",
					}}
				>
					<strong>Fun fact:</strong> {fact}
				</div>

				<div style={{ textAlign: "center", marginBottom: "16px" }}>
					<p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 12px" }}>
						{'This is a "use client" component on a cached page:'}
					</p>
					<LikeButton />
				</div>

				<div
					style={{
						padding: "16px",
						background: "#f9fafb",
						borderRadius: "8px",
						fontSize: "13px",
						color: "#6b7280",
					}}
				>
					<strong>How ISR works:</strong>
					<ol style={{ margin: "8px 0 0", paddingLeft: "20px", lineHeight: "1.8" }}>
						<li>First visit: page renders fresh (X-VirexJS-Cache: MISS)</li>
						<li>Next visits within 30s: cached HTML served instantly (HIT)</li>
						<li>After 30s: stale HTML served, background re-render triggered (STALE)</li>
						<li>Next visit after revalidation: fresh cached content (HIT)</li>
					</ol>
				</div>
			</div>
		</Default>
	);
}
