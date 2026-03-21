"use client";

interface LikeButtonProps {
	count?: number;
	liked?: boolean;
	_state?: Record<string, unknown>;
	_rerender?: () => void;
}

export default function LikeButton(props: LikeButtonProps) {
	const count = (props.count as number) ?? 0;
	const liked = (props.liked as boolean) ?? false;

	if (props._state) {
		if (props._state.count === undefined) props._state.count = 0;
		if (props._state.liked === undefined) props._state.liked = false;
	}

	return (
		<button
			type="button"
			onClick={() => {
				if (props._state && props._rerender) {
					props._state.liked = !liked;
					props._state.count = liked ? count - 1 : count + 1;
					props._rerender();
				}
			}}
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
			}}
		>
			{liked ? "\u2764" : "\u2661"} {count}
		</button>
	);
}
