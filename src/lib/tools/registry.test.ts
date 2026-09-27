import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
    CLUSTERS,
    getTool,
    homeTools,
    relatedTools,
    TOOLS,
    toolsByCluster,
    type ToolDef,
} from "./registry";

const tools = TOOLS as readonly ToolDef[];
const TOOLS_DIR = path.resolve(__dirname, "../../app/(Public)/tools");

describe("tools registry", () => {
    it("has unique slugs whose href matches the slug", () => {
        const slugs = tools.map((t) => t.slug);

        expect(new Set(slugs).size).toBe(slugs.length);
        for (const tool of tools) {
            expect(tool.href).toBe(`/tools/${tool.slug}`);
        }
    });

    // A page folder without a registry entry would be missing from the sitemap
    // and navigation; an entry without a folder would 404.
    it("matches the page folders under src/app/(Public)/tools", () => {
        const folders = readdirSync(TOOLS_DIR, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
            .sort();

        expect(folders).toEqual(tools.map((t) => t.slug).sort());
    });

    it.each(tools.map((t) => [t.slug, t] as const))(
        "%s links only to other existing tools",
        (slug, tool) => {
            expect(tool.related.length).toBeGreaterThanOrEqual(2);
            expect(tool.related).not.toContain(slug);
            for (const related of tool.related) {
                expect(() => getTool(related)).not.toThrow();
            }
        }
    );

    it.each(tools.map((t) => [t.slug, t] as const))(
        "%s has search-friendly title and description lengths",
        (_slug, tool) => {
            expect(tool.metaTitle.length).toBeLessThanOrEqual(60);
            expect(tool.metaDescription.length).toBeGreaterThanOrEqual(120);
            expect(tool.metaDescription.length).toBeLessThanOrEqual(160);
        }
    );

    it.each(tools.map((t) => [t.slug, t] as const))(
        "%s has a valid lastReviewed date",
        (_slug, tool) => {
            expect(tool.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(Number.isNaN(new Date(tool.lastReviewed).getTime())).toBe(
                false
            );
        }
    );

    it("belongs every tool to a known cluster", () => {
        const ids = CLUSTERS.map((c) => c.id);

        for (const tool of tools) {
            expect(ids).toContain(tool.cluster);
        }
    });

    // HomeTools' grid CSS (last:col-span-2, nth-child(n+4), xl:grid-cols-5)
    // only lays out correctly with exactly five tiles.
    it("features exactly five tools on the landing page, in order", () => {
        const featured = homeTools();

        expect(featured).toHaveLength(5);
        const orders = featured.map((t) => t.home!.order);
        expect(orders).toEqual([...orders].sort((a, b) => a - b));
    });
});

describe("registry helpers", () => {
    it("getTool throws on an unknown slug", () => {
        expect(() => getTool("nope")).toThrow(/unknown tool/i);
    });

    it("relatedTools resolves slugs to tool definitions", () => {
        const [first] = tools;

        expect(relatedTools(first.slug).map((t) => t.slug)).toEqual(
            first.related
        );
    });

    it("toolsByCluster covers every tool once and skips empty clusters", () => {
        const clusters = toolsByCluster();
        const listed = clusters.flatMap((c) => c.tools.map((t) => t.slug));

        expect(listed.sort()).toEqual(tools.map((t) => t.slug).sort());
        for (const cluster of clusters) {
            expect(cluster.tools.length).toBeGreaterThan(0);
        }
    });
});
