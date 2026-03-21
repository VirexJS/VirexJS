import { h } from "./jsx";
import { Head } from "./head";
import type { VNode } from "./jsx";

/**
 * Common JSON-LD structured data types for SEO.
 */
export interface ArticleLD {
	"@type": "Article" | "BlogPosting" | "NewsArticle";
	headline: string;
	author?: string | { "@type": "Person"; name: string };
	datePublished?: string;
	dateModified?: string;
	description?: string;
	image?: string | string[];
	publisher?: { "@type": "Organization"; name: string; logo?: string };
}

export interface WebSiteLD {
	"@type": "WebSite";
	name: string;
	url: string;
	description?: string;
	potentialAction?: {
		"@type": "SearchAction";
		target: string;
		"query-input": string;
	};
}

export interface BreadcrumbLD {
	"@type": "BreadcrumbList";
	itemListElement: Array<{
		"@type": "ListItem";
		position: number;
		name: string;
		item?: string;
	}>;
}

export interface OrganizationLD {
	"@type": "Organization";
	name: string;
	url?: string;
	logo?: string;
	sameAs?: string[];
}

export interface ProductLD {
	"@type": "Product";
	name: string;
	description?: string;
	image?: string;
	offers?: {
		"@type": "Offer";
		price: string;
		priceCurrency: string;
		availability?: string;
	};
}

export interface FAQLD {
	"@type": "FAQPage";
	mainEntity: Array<{
		"@type": "Question";
		name: string;
		acceptedAnswer: {
			"@type": "Answer";
			text: string;
		};
	}>;
}

export type StructuredData = ArticleLD | WebSiteLD | BreadcrumbLD | OrganizationLD | ProductLD | FAQLD;

/**
 * Render JSON-LD structured data into a `<Head>` script tag.
 *
 * The JSON-LD content is generated from a typed object (not user input),
 * so the use of raw HTML injection is safe here — the data is serialized
 * via JSON.stringify which escapes all special characters.
 *
 * Usage:
 *   import { JsonLd } from "virexjs";
 *
 *   function BlogPost(props) {
 *     return (
 *       <>
 *         <JsonLd data={{
 *           "@type": "BlogPosting",
 *           headline: props.title,
 *           datePublished: props.date,
 *           author: { "@type": "Person", name: "Author" },
 *         }} />
 *         <article>...</article>
 *       </>
 *     );
 *   }
 */
export function JsonLd(props: { data: StructuredData }): VNode {
	const jsonLd = {
		"@context": "https://schema.org",
		...props.data,
	};

	// JSON.stringify escapes </script> and all special chars, preventing injection.
	// The script type="application/ld+json" is not executed by browsers.
	const safeJson = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

	return h(Head, {
		children: h("script", {
			type: "application/ld+json",
			dangerouslySetInnerHTML: { __html: safeJson },
		}),
	});
}

/**
 * Create breadcrumb structured data from a path.
 *
 * Usage:
 *   const breadcrumbs = createBreadcrumbs("https://example.com", [
 *     { name: "Home", path: "/" },
 *     { name: "Blog", path: "/blog" },
 *     { name: "My Post", path: "/blog/my-post" },
 *   ]);
 *   <JsonLd data={breadcrumbs} />
 */
export function createBreadcrumbs(
	baseUrl: string,
	items: Array<{ name: string; path: string }>,
): BreadcrumbLD {
	const base = baseUrl.replace(/\/$/, "");
	return {
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem" as const,
			position: index + 1,
			name: item.name,
			item: index < items.length - 1 ? `${base}${item.path}` : undefined,
		})),
	};
}

/**
 * Create FAQ structured data.
 *
 * Usage:
 *   const faq = createFAQ([
 *     { question: "What is VirexJS?", answer: "A web framework." },
 *   ]);
 *   <JsonLd data={faq} />
 */
export function createFAQ(
	items: Array<{ question: string; answer: string }>,
): FAQLD {
	return {
		"@type": "FAQPage",
		mainEntity: items.map((item) => ({
			"@type": "Question" as const,
			name: item.question,
			acceptedAnswer: {
				"@type": "Answer" as const,
				text: item.answer,
			},
		})),
	};
}
