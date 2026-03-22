"use island";
import { useIslandState } from "virexjs";

export default function CopyButton(props: { text?: string }) {
	const { get, set } = useIslandState(props, { copied: false });
	const copied = get("copied");

	return (
		<button
			type="button"
			onClick={() => {
				navigator.clipboard.writeText(props.text ?? "bun add virexjs");
				set("copied", true);
				setTimeout(() => set("copied", false), 2000);
			}}
			style={{
				padding: "10px 20px",
				background: copied ? "#16a34a" : "#1e293b",
				color: "#fff",
				border: "none",
				borderRadius: "8px",
				cursor: "pointer",
				fontSize: "14px",
				fontWeight: "600",
				fontFamily: "monospace",
				display: "inline-flex",
				alignItems: "center",
				gap: "8px",
				transition: "background 0.2s",
			}}
		>
			{copied ? "Copied!" : "$ bun add virexjs"}
		</button>
	);
}
