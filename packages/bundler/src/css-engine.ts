import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

/**
 * Scan source files for CSS class names and generate utility CSS.
 * VirexJS's built-in "virex" CSS engine — a lightweight
 * utility-first CSS generator with zero dependencies.
 *
 * Supports: colors, spacing, typography, flex, grid, borders, shadows.
 */
export function generateUtilityCSS(srcDir: string): string {
	const classNames = new Set<string>();
	scanForClassNames(srcDir, classNames);

	const rules: string[] = [];
	for (const cls of classNames) {
		const rule = generateRule(cls);
		if (rule) {
			rules.push(rule);
		}
	}

	return rules.join("\n");
}

/** Scan .tsx/.ts files for className="..." usage */
function scanForClassNames(dir: string, classes: Set<string>): void {
	let entries: string[];
	try {
		entries = readdirSync(dir);
	} catch {
		return;
	}

	for (const entry of entries) {
		if (entry === "node_modules" || entry === "dist") continue;
		const fullPath = join(dir, entry);
		let stat;
		try {
			stat = statSync(fullPath);
		} catch {
			continue;
		}

		if (stat.isDirectory()) {
			scanForClassNames(fullPath, classes);
			continue;
		}

		const ext = extname(entry);
		if (ext !== ".tsx" && ext !== ".ts" && ext !== ".html") continue;

		try {
			const content = readFileSync(fullPath, "utf-8");
			// Match className="..." or class="..."
			const classPattern = /(?:className|class)\s*=\s*"([^"]+)"/g;
			let match = classPattern.exec(content);
			while (match !== null) {
				const value = match[1]!;
				for (const cls of value.split(/\s+/)) {
					if (cls) classes.add(cls);
				}
				match = classPattern.exec(content);
			}
		} catch {
			continue;
		}
	}
}

/** Spacing scale (in rem) */
const SPACING: Record<string, string> = {
	"0": "0", "1": "0.25rem", "2": "0.5rem", "3": "0.75rem", "4": "1rem",
	"5": "1.25rem", "6": "1.5rem", "8": "2rem", "10": "2.5rem", "12": "3rem",
	"16": "4rem", "20": "5rem", "24": "6rem", "32": "8rem", "64": "16rem",
	"px": "1px", "auto": "auto",
};

/** Color palette */
const COLORS: Record<string, string> = {
	white: "#fff", black: "#000", transparent: "transparent",
	gray: "#6b7280", red: "#ef4444", orange: "#f97316", yellow: "#eab308",
	green: "#22c55e", blue: "#3b82f6", indigo: "#6366f1", purple: "#a855f7", pink: "#ec4899",
};

const SHADES: Record<string, Record<string, string>> = {
	gray: { "50": "#f9fafb", "100": "#f3f4f6", "200": "#e5e7eb", "300": "#d1d5db", "400": "#9ca3af", "500": "#6b7280", "600": "#4b5563", "700": "#374151", "800": "#1f2937", "900": "#111827" },
	blue: { "50": "#eff6ff", "100": "#dbeafe", "200": "#bfdbfe", "300": "#93c5fd", "400": "#60a5fa", "500": "#3b82f6", "600": "#2563eb", "700": "#1d4ed8", "800": "#1e40af", "900": "#1e3a8a" },
	red: { "50": "#fef2f2", "100": "#fee2e2", "200": "#fecaca", "400": "#f87171", "500": "#ef4444", "600": "#dc2626", "700": "#b91c1c", "900": "#7f1d1d" },
	green: { "50": "#f0fdf4", "100": "#dcfce7", "200": "#bbf7d0", "400": "#4ade80", "500": "#22c55e", "600": "#16a34a", "700": "#15803d", "900": "#14532d" },
};

/** Text size map */
const TEXT_SIZES: Record<string, string> = {
	"text-xs": "0.75rem", "text-sm": "0.875rem", "text-base": "1rem",
	"text-lg": "1.125rem", "text-xl": "1.25rem", "text-2xl": "1.5rem",
	"text-3xl": "1.875rem", "text-4xl": "2.25rem", "text-5xl": "3rem",
};

/** Generate a CSS rule for a utility class name */
function generateRule(cls: string): string | null {
	// Static rules
	const staticRules: Record<string, string> = {
		"block": "display:block", "inline-block": "display:inline-block", "inline": "display:inline",
		"flex": "display:flex", "inline-flex": "display:inline-flex", "grid": "display:grid", "hidden": "display:none",
		"flex-row": "flex-direction:row", "flex-col": "flex-direction:column",
		"flex-wrap": "flex-wrap:wrap", "flex-1": "flex:1 1 0%", "flex-none": "flex:none",
		"items-center": "align-items:center", "items-start": "align-items:flex-start", "items-end": "align-items:flex-end",
		"justify-center": "justify-content:center", "justify-between": "justify-content:space-between",
		"justify-start": "justify-content:flex-start", "justify-end": "justify-content:flex-end",
		"relative": "position:relative", "absolute": "position:absolute", "fixed": "position:fixed", "sticky": "position:sticky",
		"w-full": "width:100%", "h-full": "height:100%", "w-screen": "width:100vw", "h-screen": "height:100vh", "min-h-screen": "min-height:100vh",
		"text-left": "text-align:left", "text-center": "text-align:center", "text-right": "text-align:right",
		"font-bold": "font-weight:700", "font-semibold": "font-weight:600", "font-medium": "font-weight:500", "font-normal": "font-weight:400",
		"italic": "font-style:italic", "uppercase": "text-transform:uppercase", "lowercase": "text-transform:lowercase",
		"underline": "text-decoration:underline", "no-underline": "text-decoration:none",
		"truncate": "overflow:hidden;text-overflow:ellipsis;white-space:nowrap",
		"rounded": "border-radius:0.25rem", "rounded-md": "border-radius:0.375rem", "rounded-lg": "border-radius:0.5rem",
		"rounded-xl": "border-radius:0.75rem", "rounded-full": "border-radius:9999px", "rounded-none": "border-radius:0",
		"border": "border-width:1px;border-style:solid", "border-0": "border-width:0", "border-2": "border-width:2px;border-style:solid",
		"shadow": "box-shadow:0 1px 3px rgba(0,0,0,0.1),0 1px 2px rgba(0,0,0,0.06)",
		"shadow-md": "box-shadow:0 4px 6px rgba(0,0,0,0.1),0 2px 4px rgba(0,0,0,0.06)",
		"shadow-lg": "box-shadow:0 10px 15px rgba(0,0,0,0.1),0 4px 6px rgba(0,0,0,0.05)",
		"shadow-none": "box-shadow:none",
		"overflow-hidden": "overflow:hidden", "overflow-auto": "overflow:auto",
		"cursor-pointer": "cursor:pointer", "cursor-not-allowed": "cursor:not-allowed",
		"max-w-sm": "max-width:24rem", "max-w-md": "max-width:28rem", "max-w-lg": "max-width:32rem",
		"max-w-xl": "max-width:36rem", "max-w-2xl": "max-width:42rem", "max-w-4xl": "max-width:56rem", "max-w-full": "max-width:100%",
		"leading-none": "line-height:1", "leading-tight": "line-height:1.25", "leading-normal": "line-height:1.5", "leading-relaxed": "line-height:1.625",
	};

	if (staticRules[cls]) return `.${escapeCls(cls)}{${staticRules[cls]}}`;
	if (TEXT_SIZES[cls]) return `.${escapeCls(cls)}{font-size:${TEXT_SIZES[cls]}}`;

	// Spacing: p-{n}, m-{n}, px-{n}, py-{n}, pt/pr/pb/pl, mt/mr/mb/ml
	const spacingMatch = cls.match(/^(p|m)(x|y|t|r|b|l)?-(.+)$/);
	if (spacingMatch) {
		const prop = spacingMatch[1] === "p" ? "padding" : "margin";
		const dir = spacingMatch[2];
		const size = SPACING[spacingMatch[3]!];
		if (!size) return null;
		const c = escapeCls(cls);
		if (!dir) return `.${c}{${prop}:${size}}`;
		if (dir === "x") return `.${c}{${prop}-left:${size};${prop}-right:${size}}`;
		if (dir === "y") return `.${c}{${prop}-top:${size};${prop}-bottom:${size}}`;
		const dirMap: Record<string, string> = { t: "top", r: "right", b: "bottom", l: "left" };
		return `.${c}{${prop}-${dirMap[dir]!}:${size}}`;
	}

	// Gap
	const gapMatch = cls.match(/^gap-(.+)$/);
	if (gapMatch && SPACING[gapMatch[1]!]) {
		return `.${escapeCls(cls)}{gap:${SPACING[gapMatch[1]!]}}`;
	}

	// Opacity
	const opacityMatch = cls.match(/^opacity-(\d+)$/);
	if (opacityMatch) return `.${cls}{opacity:${Number(opacityMatch[1]) / 100}}`;

	// Text colors
	const textColorMatch = cls.match(/^text-([\w]+)(?:-(\d+))?$/);
	if (textColorMatch && !TEXT_SIZES[cls]) {
		const color = resolveColor(textColorMatch[1]!, textColorMatch[2]);
		if (color) return `.${escapeCls(cls)}{color:${color}}`;
	}

	// Background colors
	const bgMatch = cls.match(/^bg-([\w]+)(?:-(\d+))?$/);
	if (bgMatch) {
		const color = resolveColor(bgMatch[1]!, bgMatch[2]);
		if (color) return `.${escapeCls(cls)}{background-color:${color}}`;
	}

	// Border colors
	const borderMatch = cls.match(/^border-([\w]+)(?:-(\d+))?$/);
	if (borderMatch && borderMatch[1] !== "0" && borderMatch[1] !== "2") {
		const color = resolveColor(borderMatch[1]!, borderMatch[2]);
		if (color) return `.${escapeCls(cls)}{border-color:${color}}`;
	}

	return null;
}

function resolveColor(name: string, shade?: string): string | null {
	if (shade && SHADES[name]) return SHADES[name]![shade] ?? null;
	return COLORS[name] ?? null;
}

function escapeCls(cls: string): string {
	return cls.replace(/\./g, "\\.").replace(/\//g, "\\/");
}
