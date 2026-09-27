import { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { HUBS, TOOLS, type ToolDef } from "@/lib/tools/registry";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
        { url: absoluteUrl("/tools"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
        { url: absoluteUrl("/contact-us"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
        { url: absoluteUrl("/privacy-policy"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
        { url: absoluteUrl("/terms-service"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    ];

    // lastModified comes from each tool's lastReviewed date, so the sitemap
    // only reports a change when the content actually changed.
    const toolRoutes: MetadataRoute.Sitemap = (TOOLS as readonly ToolDef[]).map(
        (tool) => ({
            url: absoluteUrl(tool.href),
            lastModified: new Date(tool.lastReviewed),
            changeFrequency: "monthly",
            priority: tool.home ? 0.8 : 0.7,
        })
    );

    const hubRoutes: MetadataRoute.Sitemap = HUBS.map((hub) => ({
        url: absoluteUrl(hub.href),
        lastModified: new Date(hub.lastReviewed),
        changeFrequency: "monthly",
        priority: 0.9,
    }));

    // Auth routes (lower priority since they're not meant for SEO)
    const authRoutes: MetadataRoute.Sitemap = [
        { url: absoluteUrl("/signup"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
        { url: absoluteUrl("/login"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    ];

    return [...staticRoutes, ...hubRoutes, ...toolRoutes, ...authRoutes];
}
