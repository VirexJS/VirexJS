/** Loading state for /admin/* pages — shown while data loads.
 * Uses trusted static CSS animation — no user content. */
export default function AdminLoading() {
	// Static trusted CSS — no user input involved
	const spinCSS = "@keyframes vrx-spin { to { transform: rotate(360deg); } }";

	return (
		<div style={{ padding: "48px", textAlign: "center" }}>
			<div
				style={{
					width: "32px",
					height: "32px",
					border: "3px solid #e5e7eb",
					borderTop: "3px solid #0066cc",
					borderRadius: "50%",
					margin: "0 auto 16px",
					animation: "vrx-spin 0.8s linear infinite",
				}}
			/>
			<p style={{ color: "#9ca3af", fontSize: "14px", margin: 0 }}>Loading admin data...</p>
			<style dangerouslySetInnerHTML={{ __html: spinCSS }} />
		</div>
	);
}
