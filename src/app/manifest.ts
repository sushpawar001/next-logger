import type { MetadataRoute } from "next";

// Served at /manifest.webmanifest. The Clerk middleware matcher already excludes
// .webmanifest, so this stays reachable while signed out.
export default function manifest(): MetadataRoute.Manifest {
    return {
        // Explicit id: without it Chrome derives app identity from start_url, so a
        // later start_url change would orphan every existing install.
        id: "/dashboard",
        name: "FitDose — Health Logger",
        short_name: "FitDose",
        description:
            "Log blood glucose, insulin, weight and body measurements.",
        // An installed user is a signed-in user — skip the marketing landing page.
        // ?source=pwa gives GA an attribution signal for icon launches.
        start_url: "/dashboard?source=pwa",
        scope: "/",
        display: "standalone",
        // No orientation lock: /charts is materially more readable in landscape.
        background_color: "#FAFAFA",
        theme_color: "#5E4AE3",
        categories: ["health", "medical", "lifestyle"],
        icons: [
            {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/icon-maskable-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
        // Android surfaces at most 4 long-press shortcuts, most-used first.
        shortcuts: [
            { name: "Log Glucose", short_name: "Glucose", url: "/glucose?quick=1" },
            { name: "Log Insulin", short_name: "Insulin", url: "/insulin?quick=1" },
            { name: "Log Weight", short_name: "Weight", url: "/weight?quick=1" },
            {
                name: "Log Measurement",
                short_name: "Measure",
                url: "/measurement?quick=1",
            },
        ],
    };
}
