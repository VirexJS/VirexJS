"use client";
import { useIslandState } from "virexjs";

export default function Modal(props: { isOpen?: boolean }) {
	const { get, set } = useIslandState(props, { isOpen: false });
	const isOpen = get("isOpen");

	return (
		<div>
			<button
				type="button"
				onClick={() => set("isOpen", true)}
				style={{
					padding: "10px 20px",
					background: "#0066cc",
					color: "#fff",
					border: "none",
					borderRadius: "8px",
					fontSize: "14px",
					fontWeight: "500",
					cursor: "pointer",
				}}
			>
				Open Modal
			</button>

			{isOpen && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						background: "rgba(0,0,0,0.5)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 9999,
					}}
				>
					<div
						style={{
							background: "#fff",
							borderRadius: "12px",
							padding: "24px",
							maxWidth: "400px",
							width: "90%",
							boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
						}}
					>
						<h3 style={{ margin: "0 0 8px", fontSize: "18px" }}>VirexJS Modal</h3>
						<p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 16px" }}>
							This modal is an island. Server-renders as a button, hydrates on click. Zero JS until
							interaction.
						</p>
						<button
							type="button"
							onClick={() => set("isOpen", false)}
							style={{
								padding: "8px 20px",
								background: "#f3f4f6",
								border: "none",
								borderRadius: "6px",
								fontSize: "14px",
								cursor: "pointer",
							}}
						>
							Close
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
