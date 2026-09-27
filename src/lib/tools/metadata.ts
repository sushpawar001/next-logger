import type { Metadata } from "next";
import { getTool } from "./registry";

/**
 * The site-wide social card (src/app/opengraph-image.png). Next merges
 * metadata shallowly: a page that sets `openGraph` or `twitter` without
 * `images` loses the file-based default, so every builder passes it explicitly.
 */
export const DEFAULT_OG_IMAGE = {
    url: "/opengraph-image.png",
    width: 1200,
    height: 630,
    alt: "FitDose",
};

interface PageSeo {
    path: string;
    title: string;
    description: string;
}

function buildMetadata({ path, title, description }: PageSeo): Metadata {
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
            images: [DEFAULT_OG_IMAGE],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [DEFAULT_OG_IMAGE.url],
        },
    };
}

export function buildToolMetadata(slug: string): Metadata {
    const tool = getTool(slug);
    return buildMetadata({
        path: tool.href,
        title: tool.metaTitle,
        description: tool.metaDescription,
    });
}

export function buildIndexMetadata(): Metadata {
    return buildMetadata({
        path: "/tools",
        title: "Free Health & Fitness Calculators | FitDose",
        description:
            "Free calculators for blood sugar, body composition, calorie needs and hydration. Every calculation runs in your browser and nothing is stored.",
    });
}
