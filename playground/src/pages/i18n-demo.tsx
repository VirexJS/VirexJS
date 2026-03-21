import type { PageProps, LoaderContext } from "virexjs";
import { useHead, createI18n, defineTranslations, detectLocale } from "virexjs";
import Default from "../layouts/Default";

const en = defineTranslations({
	title: "i18n Demo",
	greeting: "Hello {name}!",
	description: "This page demonstrates VirexJS's built-in internationalization.",
	items: { one: "1 item in cart", other: "{count} items in cart", zero: "Cart is empty" },
	nav: { home: "Home", about: "About", blog: "Blog" },
	features: {
		interpolation: "String interpolation with {curly} braces",
		pluralization: "Automatic pluralization (zero / one / other)",
		nesting: "Dot-notation nested keys: nav.home, nav.about",
		detection: "Accept-Language header detection",
	},
});

const tr = defineTranslations({
	title: "i18n Demo",
	greeting: "Merhaba {name}!",
	description: "Bu sayfa VirexJS'in dahili uluslararasilastirma sistemini gosteriyor.",
	items: { one: "Sepette 1 urun", other: "Sepette {count} urun", zero: "Sepet bos" },
	nav: { home: "Ana Sayfa", about: "Hakkimizda", blog: "Blog" },
	features: {
		interpolation: "{suslu} parantezlerle metin araya ekleme",
		pluralization: "Otomatik cogul yonetimi (sifir / tekil / cogul)",
		nesting: "Noktali erisim: nav.home, nav.about",
		detection: "Accept-Language basligini otomatik algilama",
	},
});

const i18n = createI18n({ defaultLocale: "en", locales: { en, tr } });

interface I18nDemoData {
	locale: string;
}

export async function loader(ctx: LoaderContext) {
	const locale = detectLocale(
		ctx.request.headers.get("Accept-Language"),
		i18n.locales,
		i18n.defaultLocale,
	);
	return { locale };
}

export default function I18nDemo(props: PageProps<I18nDemoData>) {
	const { locale } = props.data;
	const t = i18n.withLocale(locale).t;

	const head = useHead({
		title: `${t("title")} — VirexJS`,
		description: t("description"),
	});

	return (
		<Default>
			{head}
			<h1>{t("title")}</h1>
			<p style={{ color: "#666", fontSize: "16px" }}>
				Detected locale: <strong>{locale}</strong>
			</p>

			<section style={{ marginTop: "24px" }}>
				<h2>Interpolation</h2>
				<p>{t("greeting", { name: "VirexJS" })}</p>
			</section>

			<section style={{ marginTop: "24px" }}>
				<h2>Pluralization</h2>
				<ul style={{ listStyle: "none", padding: "0" }}>
					<li>{t("items", { count: 0 })}</li>
					<li>{t("items", { count: 1 })}</li>
					<li>{t("items", { count: 5 })}</li>
				</ul>
			</section>

			<section style={{ marginTop: "24px" }}>
				<h2>Nested Keys</h2>
				<p>nav.home = {t("nav.home")}</p>
				<p>nav.about = {t("nav.about")}</p>
				<p>nav.blog = {t("nav.blog")}</p>
			</section>

			<section style={{ marginTop: "24px" }}>
				<h2>Features</h2>
				<ul>
					<li>{t("features.interpolation", { curly: "{}", suslu: "{}" })}</li>
					<li>{t("features.pluralization")}</li>
					<li>{t("features.nesting")}</li>
					<li>{t("features.detection")}</li>
				</ul>
			</section>
		</Default>
	);
}
