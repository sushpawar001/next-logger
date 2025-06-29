import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        "https://fitdose.fitnationplus.com";

    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/api/",
                "/dashboard/",
                "/profile/",
                "/glucose/",
                "/insulin/",
                "/weight/",
                "/measurement/",
                "/charts/",
                "/stats/",
                "/load/",
                "/try/",
                "/verify/",
                "/reset-password/",
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
