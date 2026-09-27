import { describe, expect, it } from "vitest";
import { buildIndexMetadata, buildToolMetadata, DEFAULT_OG_IMAGE } from "./metadata";
import {
    breadcrumbLd,
    faqPageLd,
    itemListLd,
    serializeJsonLd,
    toolGraph,
    webApplicationLd,
} from "./jsonLd";
import { getTool, TOOLS, type ToolDef } from "./registry";

const tools = TOOLS as readonly ToolDef[];

describe("buildToolMetadata", () => {
    it.each(tools.map((t) => [t.slug, t] as const))(
        "%s gets a canonical, an OG image and a twitter card",
        (slug, tool) => {
            const meta: any = buildToolMetadata(slug);

            expect(meta.title).toEqual({ absolute: tool.metaTitle });
            expect(meta.description).toBe(tool.metaDescription);
            expect(meta.alternates.canonical).toBe(tool.href);
            expect(meta.openGraph.url).toBe(tool.href);
            // Must be explicit: a child openGraph without images drops the
            // root's file-based default card.
            expect(meta.openGraph.images).toEqual([DEFAULT_OG_IMAGE]);
            expect(meta.twitter.card).toBe("summary_large_image");
            expect(meta.twitter.images).toEqual([DEFAULT_OG_IMAGE.url]);
        }
    );

    it("throws for an unknown tool rather than emitting empty metadata", () => {
        expect(() => buildToolMetadata("missing")).toThrow();
    });

    it("builds the tools index metadata the same way", () => {
        const meta: any = buildIndexMetadata();

        expect(meta.alternates.canonical).toBe("/tools");
        expect(meta.openGraph.images).toEqual([DEFAULT_OG_IMAGE]);
        expect(meta.title.absolute.length).toBeLessThanOrEqual(60);
    });
});

describe("JSON-LD builders", () => {
    const tool = getTool("bmi-calculator");
    const faqs = [
        { q: "What is BMI?", a: "A ratio of weight to height squared." },
        { q: "Is it accurate?", a: "It is a screening tool." },
    ];

    it("describes the tool as a free web application with absolute URLs", () => {
        const app: any = webApplicationLd(tool);

        expect(app["@type"]).toBe("WebApplication");
        expect(app.url).toMatch(/^https?:\/\/.+\/tools\/bmi-calculator$/);
        expect(app.offers.price).toBe("0");
        expect(app.dateModified).toBe(tool.lastReviewed);
        expect(app).not.toHaveProperty("aggregateRating");
    });

    it("builds a Home > Tools > tool breadcrumb", () => {
        const crumbs: any = breadcrumbLd(tool);

        expect(crumbs.itemListElement.map((c: any) => c.name)).toEqual([
            "Home",
            "Tools",
            tool.title,
        ]);
        expect(crumbs.itemListElement.map((c: any) => c.position)).toEqual([
            1, 2, 3,
        ]);
        for (const crumb of crumbs.itemListElement) {
            expect(crumb.item).toMatch(/^https?:\/\//);
        }
    });

    it("emits one Question per FAQ entry", () => {
        const faq: any = faqPageLd(faqs);

        expect(faq.mainEntity).toHaveLength(faqs.length);
        expect(faq.mainEntity[0]).toEqual({
            "@type": "Question",
            name: faqs[0].q,
            acceptedAnswer: { "@type": "Answer", text: faqs[0].a },
        });
    });

    it("omits FAQPage from the graph when a page has no FAQs", () => {
        const withFaq: any = toolGraph(tool, faqs);
        const without: any = toolGraph(tool, []);

        expect(withFaq["@context"]).toBe("https://schema.org");
        expect(withFaq["@graph"].map((n: any) => n["@type"])).toContain(
            "FAQPage"
        );
        expect(without["@graph"].map((n: any) => n["@type"])).not.toContain(
            "FAQPage"
        );
    });

    it("lists tools in order for the index page", () => {
        const list: any = itemListLd(tools);

        expect(list.itemListElement).toHaveLength(tools.length);
        expect(list.itemListElement[0].position).toBe(1);
    });

    it("escapes < so data cannot close the script tag", () => {
        const out = serializeJsonLd({ text: "</script><script>alert(1)" });

        expect(out).not.toContain("<");
        expect(JSON.parse(out).text).toBe("</script><script>alert(1)");
    });
});
