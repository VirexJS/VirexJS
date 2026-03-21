/**
 * Draft Mode — bypass ISR cache for CMS preview.
 *
 * Like Next.js draftMode() but simpler:
 * - Set a cookie to enable draft mode
 * - ISR cache is bypassed when draft mode is active
 * - Preview unpublished content from your CMS
 *
 * Usage:
 *   // Enable draft mode (e.g., from a CMS webhook)
 *   import { enableDraftMode, disableDraftMode, isDraftMode } from "virexjs";
 *
 *   // In API route:
 *   export const GET = defineAPIRoute(({ request }) => {
 *     enableDraftMode(response);
 *     return redirect("/preview-page");
 *   });
 *
 *   // In loader:
 *   export async function loader(ctx) {
 *     const draft = isDraftMode(ctx.request);
 *     const posts = await cms.getPosts({ preview: draft });
 *     return { posts };
 *   }
 */

const DRAFT_COOKIE = "vrx_draft";
const DRAFT_SECRET = "vrx-draft-mode-token";

/** Check if draft mode is enabled for this request */
export function isDraftMode(request: Request): boolean {
	const cookie = request.headers.get("Cookie") ?? "";
	return cookie.includes(`${DRAFT_COOKIE}=${DRAFT_SECRET}`);
}

/** Enable draft mode by setting a cookie on the response */
export function enableDraftMode(response: Response): Response {
	response.headers.append(
		"Set-Cookie",
		`${DRAFT_COOKIE}=${DRAFT_SECRET}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`,
	);
	return response;
}

/** Disable draft mode by clearing the cookie */
export function disableDraftMode(response: Response): Response {
	response.headers.append("Set-Cookie", `${DRAFT_COOKIE}=; Path=/; HttpOnly; Max-Age=0`);
	return response;
}
