import type { Metadata } from "next";
import { getHub, getTool } from "./registry";

/**
 * Per-page share card in public/og, built by scripts/og/build.js; the slug is
 * a tool or hub slug, or "tools" for the index. Next merges metadata
 * shallowly, so a page that sets `openGraph` must always pass `images` or it
 * loses the root default card (src/app/opengraph-image.png).
 */
export function shareImage(slug: string, alt: string) {
    return { url: `/og/${slug}.png`, width: 1200, height: 630, alt };
}

interface PageSeo {
    path: string;
    title: string;
    description: string;
    image: { url: string; width: number; height: number; alt: string };
}

function buildMetadata({ path, title, description, image }: PageSeo): Metadata {
    return {
        title: { absolute: title },
        description,
        // Self-referencing canonical: nuqs puts every input in the query
        // string, so without this each shared result is a separate URL.
        alternates: { canonical: path },
        openGraph: {
            type: "website",
            siteName: "FitDose",
            url: path,
            title,
            description,
            images: [image],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image.url],
        },
    };
}

export function buildToolMetadata(slug: string): Metadata {
    const tool = getTool(slug);
    return buildMetadata({
        path: tool.href,
        title: tool.metaTitle,
        description: tool.metaDescription,
        image: shareImage(tool.slug, `${tool.title}: ${tool.description}`),
    });
}

export function buildHubMetadata(slug: string): Metadata {
    const hub = getHub(slug);
    return buildMetadata({
        path: hub.href,
        title: hub.metaTitle,
        description: hub.metaDescription,
        image: shareImage(hub.slug, hub.metaDescription),
    });
}

export function buildIndexMetadata(): Metadata {
    return buildMetadata({
        path: "/tools",
        title: "Free Health & Fitness Calculators | FitDose",
        description:
            "Free calculators for blood sugar, body composition, calorie needs and hydration. Every calculation runs in your browser and nothing is stored.",
        image: shareImage("tools", "FitDose free health calculators"),
    });
}
