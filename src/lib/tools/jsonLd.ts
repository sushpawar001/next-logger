import { absoluteUrl } from "@/lib/site";
import type { ToolDef } from "./registry";

/**
 * schema.org builders for the tool pages. Plain objects rather than schema-dts
 * types: three small builders don't justify a dependency. Never add ratings or
 * review counts here unless they come from real reviews.
 */
export type JsonLdObject = Record<string, unknown>;

/** One FAQ entry. The same array feeds the visible FAQ and FAQPage markup. */
export interface Faq {
    q: string;
    a: string;
}

const publisher = () => ({
    "@type": "Organization",
    name: "FitDose",
    url: absoluteUrl("/"),
});

export function webApplicationLd(tool: ToolDef): JsonLdObject {
    return {
        "@type": "WebApplication",
        "@id": `${absoluteUrl(tool.href)}#app`,
        name: tool.title,
        url: absoluteUrl(tool.href),
        description: tool.metaDescription,
        applicationCategory: "HealthApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        dateModified: tool.lastReviewed,
        publisher: publisher(),
    };
}

export function breadcrumbLd(tool: ToolDef): JsonLdObject {
    const crumbs = [
        { name: "Home", url: absoluteUrl("/") },
        { name: "Tools", url: absoluteUrl("/tools") },
        { name: tool.title, url: absoluteUrl(tool.href) },
    ];
    return {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((crumb, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: crumb.name,
            item: crumb.url,
        })),
    };
}

export function faqPageLd(faqs: Faq[]): JsonLdObject {
    return {
        "@type": "FAQPage",
        mainEntity: faqs.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
        })),
    };
}

/** Everything a tool page emits, as one @graph. */
export function toolGraph(tool: ToolDef, faqs: Faq[]): JsonLdObject {
    const graph = [webApplicationLd(tool), breadcrumbLd(tool)];
    if (faqs.length > 0) graph.push(faqPageLd(faqs));
    return { "@context": "https://schema.org", "@graph": graph };
}

export function itemListLd(tools: readonly ToolDef[]): JsonLdObject {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: tools.map((tool, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: tool.title,
            url: absoluteUrl(tool.href),
        })),
    };
}

/**
 * Serialises for a <script type="application/ld+json"> body. Escaping `<`
 * stops a string such as "</script>" in the data from closing the tag.
 */
export function serializeJsonLd(data: JsonLdObject): string {
    return JSON.stringify(data).replace(/</g, "\\u003c");
}
