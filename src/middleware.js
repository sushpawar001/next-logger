import { NextResponse } from "next/server";

export function middleware(request) {
    const path = request.nextUrl.pathname;
    const allowed = ["/load", "/"];

    const publicPaths = [
        "/login",
        "/signup",
        "/verify",
        "/forget-password",
        "/reset-password",
        "/privacy-policy",
        "/terms-service",
    ];
    const isPublicPath = publicPaths.includes(path);

    const token = request.cookies.get("token")?.value || "";
    console.log("isPublicPath", path, isPublicPath);

    if (allowed.includes(path)) {
        // allow public paths
        return;
    }

    if (isPublicPath && token) {
        // if user is logged in, redirect to home
        return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }

    if (!isPublicPath && !token) {
        // if user is not logged in, redirect to login
        return NextResponse.redirect(new URL("/login", request.nextUrl));
    }
}

// See "Matching Paths" below to learn more

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
        "/login",
        "/signup",
    ],
};
