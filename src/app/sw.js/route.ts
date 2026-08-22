import { NextResponse } from "next/server";

/**
 * Serves the service worker at /sw.js from a route handler rather than
 * public/sw.js, so we can set Cache-Control and Service-Worker-Allowed without
 * touching next.config.js (repo rule: don't modify it unasked).
 *
 * /sw.js falls outside the Clerk middleware matcher (it excludes .js), so this
 * is reachable while signed out — which it must be, or registration fails.
 *
 * Caching policy is deliberately narrow. See docs/features/plan/pwa-installability.md §4.2:
 * glucose/insulin/weight/measurement values are encrypted at rest, so caching
 * decrypted /api responses would write plaintext health data to the device.
 */

const VERSION = "v1";

const SERVICE_WORKER = `
const VERSION = "${VERSION}";
const STATIC_CACHE = "fitdose-static-" + VERSION;
const PRECACHE = ["/offline", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then((cache) => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== STATIC_CACHE)
                        .map((key) => caches.delete(key))
                )
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    if (request.method !== "GET") return;

    const url = new URL(request.url);

    // Cross-origin (Clerk, GA, fonts) is never touched.
    if (url.origin !== self.location.origin) return;
    // NEVER cache health data. This is a hard rule, not an optimisation.
    if (url.pathname.startsWith("/api/")) return;
    if (url.pathname.startsWith("/_next/image")) return;

    // Hashed immutable build assets and our own icons: cache-first.
    if (
        url.pathname.startsWith("/_next/static/") ||
        url.pathname.startsWith("/icons/")
    ) {
        event.respondWith(
            caches.match(request).then(
                (hit) =>
                    hit ||
                    fetch(request).then((response) => {
                        if (response.ok) {
                            const copy = response.clone();
                            caches
                                .open(STATIC_CACHE)
                                .then((cache) => cache.put(request, copy));
                        }
                        return response;
                    })
            )
        );
        return;
    }

    // Page navigations: network-first with the offline page as fallback. The HTML
    // itself is never cached — dashboard pages are auth-gated and user-specific.
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() =>
                caches.match("/offline").then(
                    (hit) =>
                        hit ||
                        new Response("You are offline.", {
                            status: 503,
                            headers: { "Content-Type": "text/plain" },
                        })
                )
            )
        );
    }
});
`.trimStart();

export const dynamic = "force-static";

export async function GET() {
    return new NextResponse(SERVICE_WORKER, {
        headers: {
            "Content-Type": "application/javascript; charset=utf-8",
            // Must not be cached, or clients can pin a stale worker indefinitely.
            "Cache-Control": "public, max-age=0, must-revalidate",
            "Service-Worker-Allowed": "/",
        },
    });
}
