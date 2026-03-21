/**
 * VirexJS i18n — lightweight server-side internationalization.
 *
 * Features:
 * - Define translations as plain objects
 * - Nested key lookup with dot notation: t("nav.home")
 * - Interpolation: t("greeting", { name: "World" }) → "Hello World"
 * - Pluralization: { one: "1 item", other: "{count} items" }
 * - Locale detection from Accept-Language header
 * - Type-safe with defineTranslations()
 */

/** Translation value: string, pluralized object, or nested translations */
export type TranslationValue =
	| string
	| { one: string; other: string; zero?: string }
	| { [key: string]: TranslationValue };

/** A translations object for a single locale */
export type Translations = Record<string, TranslationValue>;

/** All locales mapped to their translations */
export type LocaleMap = Record<string, Translations>;

/** Interpolation parameters */
export type InterpolationParams = Record<string, string | number>;

/**
 * i18n instance — holds translations and provides lookup.
 */
export interface I18n {
	/** Current locale */
	locale: string;
	/** Default locale (fallback) */
	defaultLocale: string;
	/** Available locales */
	locales: string[];
	/** Translate a key with optional interpolation */
	t: (key: string, params?: InterpolationParams) => string;
	/** Switch locale and return a new i18n instance */
	withLocale: (locale: string) => I18n;
}

/**
 * Create an i18n instance from a locale map.
 *
 * Usage:
 *   const i18n = createI18n({
 *     defaultLocale: "en",
 *     locales: {
 *       en: { greeting: "Hello {name}", items: { one: "1 item", other: "{count} items" } },
 *       tr: { greeting: "Merhaba {name}", items: { one: "1 öğe", other: "{count} öğe" } },
 *     },
 *   });
 *
 *   i18n.t("greeting", { name: "World" }); // "Hello World"
 *   i18n.withLocale("tr").t("greeting", { name: "Dünya" }); // "Merhaba Dünya"
 */
export function createI18n(options: {
	defaultLocale: string;
	locales: LocaleMap;
	locale?: string;
}): I18n {
	const { defaultLocale, locales, locale: currentLocale } = options;
	const locale = currentLocale ?? defaultLocale;
	const availableLocales = Object.keys(locales);

	function t(key: string, params?: InterpolationParams): string {
		// Look up in current locale, fall back to default
		const value = lookupKey(locales[locale], key) ?? lookupKey(locales[defaultLocale], key);

		if (value === undefined) {
			return key;
		}

		// Handle pluralization
		if (typeof value === "object" && value !== null && ("one" in value || "other" in value)) {
			const plural = value as { one: string; other: string; zero?: string };
			const count = params?.count !== undefined ? Number(params.count) : undefined;
			let template: string;
			if (count === 0 && plural.zero !== undefined) {
				template = plural.zero;
			} else if (count === 1) {
				template = plural.one;
			} else {
				template = plural.other;
			}
			return interpolate(template, params);
		}

		if (typeof value === "string") {
			return interpolate(value, params);
		}

		// Nested object without pluralization — return key
		return key;
	}

	function withLocale(newLocale: string): I18n {
		return createI18n({
			defaultLocale,
			locales,
			locale: newLocale,
		});
	}

	return {
		locale,
		defaultLocale,
		locales: availableLocales,
		t,
		withLocale,
	};
}

/**
 * Helper to define translations with type safety.
 * Usage:
 *   const en = defineTranslations({
 *     nav: { home: "Home", about: "About" },
 *     greeting: "Hello {name}",
 *   });
 */
export function defineTranslations<T extends Translations>(translations: T): T {
	return translations;
}

/**
 * Detect the best locale from an Accept-Language header.
 * Returns the best match from available locales, or the default.
 *
 * Usage:
 *   const locale = detectLocale(request.headers.get("Accept-Language"), ["en", "tr", "de"], "en");
 */
export function detectLocale(
	acceptLanguage: string | null,
	availableLocales: string[],
	defaultLocale: string,
): string {
	if (!acceptLanguage) {
		return defaultLocale;
	}

	const parsed = parseAcceptLanguage(acceptLanguage);

	for (const { lang } of parsed) {
		// Exact match: "en-US" in available
		if (availableLocales.includes(lang)) {
			return lang;
		}

		// Base language match: "en-US" → try "en"
		const base = lang.split("-")[0]!;
		if (availableLocales.includes(base)) {
			return base;
		}

		// Check if any available locale starts with the base
		const prefixMatch = availableLocales.find((l) => l.startsWith(`${base}-`));
		if (prefixMatch) {
			return prefixMatch;
		}
	}

	return defaultLocale;
}

// ─── Internal helpers ───────────────────────────────────────────────────────

/** Look up a dot-notation key in a translations object */
function lookupKey(
	translations: Translations | undefined,
	key: string,
): TranslationValue | undefined {
	if (!translations) return undefined;

	const parts = key.split(".");
	let current: TranslationValue | undefined = translations;

	for (const part of parts) {
		if (typeof current !== "object" || current === null || Array.isArray(current)) {
			return undefined;
		}
		current = (current as Record<string, TranslationValue>)[part];
	}

	return current;
}

/** Replace {key} placeholders with values */
function interpolate(template: string, params?: InterpolationParams): string {
	if (!params) return template;
	return template.replace(/\{(\w+)\}/g, (match, key: string) => {
		const value = params[key];
		return value !== undefined ? String(value) : match;
	});
}

/** Parse Accept-Language header into sorted language entries */
function parseAcceptLanguage(header: string): Array<{ lang: string; q: number }> {
	return header
		.split(",")
		.map((part) => {
			const trimmed = part.trim();
			const parts = trimmed.split(";");
			const lang = parts[0] ?? "";
			const rest = parts.slice(1);
			let q = 1;
			for (const param of rest) {
				const match = param.trim().match(/^q=(\d*\.?\d+)$/);
				if (match) {
					q = Number.parseFloat(match[1]!);
				}
			}
			return { lang: lang.trim(), q };
		})
		.sort((a, b) => b.q - a.q);
}
