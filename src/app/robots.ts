import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = getSiteUrl();

    return {
        rules: {
            userAgent: "*",
            allow: "/",
            // No trailing slashes: robots.txt matches by prefix, so "/load/"
            // would not block "/load" itself.
            disallow: [
                "/api",
                "/dashboard",
                "/profile",
                "/glucose",
                "/insulin",
                "/weight",
                "/measurement",
                "/charts",
                "/stats",
                "/load",
                "/try",
                "/verify",
                "/reset-password",
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
