import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
    "/",
    "/signup(.*)",
    "/login(.*)",
    "/api/webhooks/user(.*)",
    "/api/seed(.*)",
    "/api/contact-us/add",
    "/contact-us",
    "/load",
    "/offline",
    "/privacy-policy",
    "/terms-service",
    "/tools(.*)",
    "/sitemap.xml",
    // .txt is not in the matcher's static-file skip list, so robots.txt must be
    // listed here or crawlers get an auth redirect instead of the file.
    "/robots.txt",
]);

export default clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
        await auth.protect();
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
