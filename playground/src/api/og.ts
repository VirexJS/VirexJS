import { defineAPIRoute, generateOGImage } from "virexjs";

/** Dynamic OG image generator — /api/og?title=Hello */
export const GET = defineAPIRoute(({ request }) => {
	const url = new URL(request.url);
	const title = url.searchParams.get("title") ?? "VirexJS";
	const subtitle = url.searchParams.get("subtitle") ?? "Ship HTML, not JavaScript";

	return generateOGImage({ title, subtitle });
});
