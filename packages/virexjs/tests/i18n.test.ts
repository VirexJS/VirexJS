import { describe, expect, test } from "bun:test";
import { createI18n, defineTranslations, detectLocale } from "../src/i18n/index";

// ─── defineTranslations ─────────────────────────────────────────────────────

describe("defineTranslations", () => {
	test("returns translations as-is", () => {
		const en = defineTranslations({
			hello: "Hello",
			nav: { home: "Home" },
		});
		expect(en.hello).toBe("Hello");
		expect((en.nav as Record<string, string>).home).toBe("Home");
	});
});

// ─── createI18n / t() ───────────────────────────────────────────────────────

describe("createI18n", () => {
	const i18n = createI18n({
		defaultLocale: "en",
		locales: {
			en: {
				greeting: "Hello {name}",
				farewell: "Goodbye",
				nav: {
					home: "Home",
					about: "About Us",
				},
				items: { one: "1 item", other: "{count} items", zero: "No items" },
			},
			tr: {
				greeting: "Merhaba {name}",
				farewell: "Hoşçakal",
				nav: {
					home: "Ana Sayfa",
					about: "Hakkımızda",
				},
				items: { one: "1 öğe", other: "{count} öğe", zero: "Öğe yok" },
			},
		},
	});

	test("returns locale info", () => {
		expect(i18n.locale).toBe("en");
		expect(i18n.defaultLocale).toBe("en");
		expect(i18n.locales).toEqual(["en", "tr"]);
	});

	test("simple key lookup", () => {
		expect(i18n.t("farewell")).toBe("Goodbye");
	});

	test("dot notation for nested keys", () => {
		expect(i18n.t("nav.home")).toBe("Home");
		expect(i18n.t("nav.about")).toBe("About Us");
	});

	test("interpolation with params", () => {
		expect(i18n.t("greeting", { name: "World" })).toBe("Hello World");
	});

	test("missing key returns the key itself", () => {
		expect(i18n.t("nonexistent.key")).toBe("nonexistent.key");
	});

	test("missing interpolation param leaves placeholder", () => {
		expect(i18n.t("greeting")).toBe("Hello {name}");
	});
});

// ─── Pluralization ──────────────────────────────────────────────────────────

describe("pluralization", () => {
	const i18n = createI18n({
		defaultLocale: "en",
		locales: {
			en: {
				items: { one: "1 item", other: "{count} items", zero: "No items" },
				messages: { one: "1 message", other: "{count} messages" },
			},
		},
	});

	test("count=0 uses zero form", () => {
		expect(i18n.t("items", { count: 0 })).toBe("No items");
	});

	test("count=1 uses one form", () => {
		expect(i18n.t("items", { count: 1 })).toBe("1 item");
	});

	test("count>1 uses other form with interpolation", () => {
		expect(i18n.t("items", { count: 5 })).toBe("5 items");
	});

	test("no zero form falls back to other", () => {
		expect(i18n.t("messages", { count: 0 })).toBe("0 messages");
	});

	test("without count param uses other form", () => {
		expect(i18n.t("items")).toBe("{count} items");
	});
});

// ─── withLocale ─────────────────────────────────────────────────────────────

describe("withLocale", () => {
	const i18n = createI18n({
		defaultLocale: "en",
		locales: {
			en: { greeting: "Hello {name}", nav: { home: "Home" } },
			tr: { greeting: "Merhaba {name}", nav: { home: "Ana Sayfa" } },
			de: { greeting: "Hallo {name}" },
		},
	});

	test("switches locale", () => {
		const tr = i18n.withLocale("tr");
		expect(tr.locale).toBe("tr");
		expect(tr.t("greeting", { name: "Dünya" })).toBe("Merhaba Dünya");
	});

	test("nested keys work in switched locale", () => {
		const tr = i18n.withLocale("tr");
		expect(tr.t("nav.home")).toBe("Ana Sayfa");
	});

	test("falls back to default locale for missing keys", () => {
		const de = i18n.withLocale("de");
		expect(de.t("greeting", { name: "Welt" })).toBe("Hallo Welt");
		// "nav.home" missing in de → falls back to en
		expect(de.t("nav.home")).toBe("Home");
	});

	test("original instance unchanged", () => {
		i18n.withLocale("tr");
		expect(i18n.locale).toBe("en");
		expect(i18n.t("greeting", { name: "World" })).toBe("Hello World");
	});
});

// ─── detectLocale ───────────────────────────────────────────────────────────

describe("detectLocale", () => {
	const available = ["en", "tr", "de", "fr"];

	test("exact match", () => {
		expect(detectLocale("tr", available, "en")).toBe("tr");
	});

	test("base language match", () => {
		expect(detectLocale("de-AT", available, "en")).toBe("de");
	});

	test("quality-based preference", () => {
		expect(detectLocale("fr;q=0.5, de;q=0.9, en;q=0.1", available, "en")).toBe("de");
	});

	test("first preferred wins when equal quality", () => {
		expect(detectLocale("tr, de", available, "en")).toBe("tr");
	});

	test("complex Accept-Language header", () => {
		expect(detectLocale("en-US,en;q=0.9,tr;q=0.8", available, "en")).toBe("en");
	});

	test("no match returns default", () => {
		expect(detectLocale("ja, zh", available, "en")).toBe("en");
	});

	test("null header returns default", () => {
		expect(detectLocale(null, available, "en")).toBe("en");
	});

	test("empty header returns default", () => {
		expect(detectLocale("", available, "en")).toBe("en");
	});
});

// ─── Integration ────────────────────────────────────────────────────────────

describe("integration", () => {
	test("middleware-style locale detection", () => {
		const i18n = createI18n({
			defaultLocale: "en",
			locales: {
				en: { welcome: "Welcome to {site}" },
				tr: { welcome: "{site}'e hoş geldiniz" },
			},
		});

		// Simulate middleware detecting locale from request
		const acceptLang = "tr-TR,tr;q=0.9,en;q=0.5";
		const detectedLocale = detectLocale(acceptLang, i18n.locales, i18n.defaultLocale);
		const localizedI18n = i18n.withLocale(detectedLocale);

		expect(localizedI18n.locale).toBe("tr");
		expect(localizedI18n.t("welcome", { site: "VirexJS" })).toBe("VirexJS'e hoş geldiniz");
	});
});
