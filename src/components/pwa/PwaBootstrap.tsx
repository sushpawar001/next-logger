"use client";

import { useEffect } from "react";
import { isStandalone, trackPwaEvent } from "@/lib/pwa";

/**
 * Registers the service worker and reports standalone launches. Mounted once in
 * the root layout; renders nothing.
 *
 * Registration is production-only on purpose — a service worker caching
 * /_next/static during dev HMR makes for a very confusing debugging session.
 */
export default function PwaBootstrap() {
    useEffect(() => {
        // pwa_launch vs. total sessions is how we tell whether installs happened
        // and whether people actually come back through the icon.
        if (isStandalone()) {
            trackPwaEvent("pwa_launch");
        }

        if (process.env.NODE_ENV !== "production") return;
        if (!("serviceWorker" in navigator)) return;

        navigator.serviceWorker
            .register("/sw.js", { scope: "/", updateViaCache: "none" })
            .catch((error) => {
                console.error("Service worker registration failed:", error);
            });
    }, []);

    return null;
}
