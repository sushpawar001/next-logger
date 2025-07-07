import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
    "/",
    "/signup(.*)",
    "/login(.*)",
    "/api/webhooks/user(.*)",
    "/api/seed(.*)",
    "/load",
    "/privacy-policy",
    "/terms-service",
    "/tools(.*)",
    "/sitemap.xml",
]);

export default clerkMiddleware((auth, request) => {
    if (!isPublicRoute(request)) {
        auth().protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
