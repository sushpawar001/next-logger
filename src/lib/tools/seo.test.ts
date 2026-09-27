import { describe, expect, it } from "vitest";
import {
    buildHubMetadata,
    buildIndexMetadata,
    buildToolMetadata,
    shareImage,
} from "./metadata";
import { existsSync } from "node:fs";
import path from "node:path";

const PUBLIC_DIR = path.resolve(__dirname, "../../../public");
import {
    breadcrumbLd,
    faqPageLd,
    hubGraph,
    itemListLd,
    serializeJsonLd,
    toolGraph,
    webApplicationLd,
} from "./jsonLd";
import { getHub, getTool, HUBS, TOOLS, type ToolDef } from "./registry";

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
            expect(meta.openGraph.images).toEqual([
                shareImage(slug, `${tool.title}: ${tool.description}`),
            ]);
            expect(meta.twitter.card).toBe("summary_large_image");
            expect(meta.twitter.images).toEqual([`/og/${slug}.png`]);
        }
    );

    it("throws for an unknown tool rather than emitting empty metadata", () => {
        expect(() => buildToolMetadata("missing")).toThrow();
    });

    it("builds hub metadata with a canonical and OG image", () => {
        const meta: any = buildHubMetadata("diabetes");

        expect(meta.alternates.canonical).toBe("/tools/diabetes");
        expect(meta.openGraph.images[0].url).toBe("/og/diabetes.png");
    });

    it("builds the tools index metadata the same way", () => {
        const meta: any = buildIndexMetadata();

        expect(meta.alternates.canonical).toBe("/tools");
        expect(meta.openGraph.images[0].url).toBe("/og/tools.png");
        expect(meta.title.absolute.length).toBeLessThanOrEqual(60);
    });
});

describe("share cards", () => {
    // scripts/og/build.js writes these; a new tool or hub needs a card added
    // there and the script re-run.
    it.each(["tools", ...tools.map((t) => t.slug), ...HUBS.map((h) => h.slug)])(
        "public/og/%s.png exists",
        (slug) => {
            expect(existsSync(path.join(PUBLIC_DIR, "og", `${slug}.png`))).toBe(true);
        }
    );
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

    it("routes a diabetes tool's breadcrumb through its hub", () => {
        const crumbs: any = breadcrumbLd(getTool("a1c-calculator"));

        expect(crumbs.itemListElement.map((c: any) => c.name)).toEqual([
            "Home",
            "Tools",
            "Diabetes",
            "A1c Calculator",
        ]);
        expect(crumbs.itemListElement[2].item).toMatch(/\/tools\/diabetes$/);
    });

    it("describes a hub as a CollectionPage of its tools", () => {
        const hub = getHub("diabetes");
        const graph: any = hubGraph(hub, [getTool("a1c-calculator")], []);

        expect(graph["@graph"].map((n: any) => n["@type"])).toEqual([
            "CollectionPage",
            "BreadcrumbList",
        ]);
        expect(graph["@graph"][0].mainEntity.itemListElement[0].url).toMatch(
            /\/tools\/a1c-calculator$/
        );
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
