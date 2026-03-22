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
				padding: "12px 24px",
				background: copied ? "rgba(34,197,94,0.15)" : "#3b82f6",
				color: copied ? "#4ade80" : "#fff",
				border: "none",
				borderRadius: "10px",
				cursor: "pointer",
				fontSize: "14px",
				fontWeight: "600",
				fontFamily: "'JetBrains Mono',monospace",
				display: "inline-flex",
				alignItems: "center",
				gap: "10px",
				transition: "all 0.2s",
			}}
		>
			{copied ? "Copied!" : `$ ${props.text ?? "bun add virexjs"}`}
		</button>
	);
}
