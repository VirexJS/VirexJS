"use client";
import { useIslandState } from "virexjs";

export default function LikeButton(props: { count?: number; liked?: boolean }) {
	const { get, set, update } = useIslandState(props, { count: 0, liked: false });
	const count = get("count");
	const liked = get("liked");

	return (
		<button
			type="button"
			onClick={() => update({ liked: !liked, count: liked ? count - 1 : count + 1 })}
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: "6px",
				padding: "8px 16px",
				border: liked ? "2px solid #ef4444" : "2px solid #e5e7eb",
				borderRadius: "20px",
				background: liked ? "#fef2f2" : "#fff",
				color: liked ? "#ef4444" : "#6b7280",
				cursor: "pointer",
				fontSize: "14px",
				fontWeight: "500",
			}}
		>
			{liked ? "\u2764" : "\u2661"} {count}
		</button>
	);
}
