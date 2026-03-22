/**
 * Loading shell — shown instantly while async data loads.
 * When a page uses an async loader and _loading.tsx exists,
 * VirexJS sends this shell first (fast TTFB) then swaps
 * in the real content when data is ready.
 */
export default function Loading() {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "300px",
				gap: "16px",
			}}
		>
			<div
				style={{
					width: "32px",
					height: "32px",
					border: "3px solid #e5e7eb",
					borderTop: "3px solid #3b82f6",
					borderRadius: "50%",
					animation: "vrx-spin 0.8s linear infinite",
				}}
			/>
			<p style={{ color: "#9ca3af", fontSize: "14px" }}>Loading...</p>
			<style>
				{`@keyframes vrx-spin { to { transform: rotate(360deg) } }`}
			</style>
		</div>
	);
}
