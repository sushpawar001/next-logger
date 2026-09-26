import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Middleware decides which routes bypass Clerk. Getting this wrong either locks
 * users out of the public marketing/tools surface or exposes health data, so
 * the public matcher is asserted route by route.
 *
 * The global mock in setup.node.ts stubs clerkMiddleware/createRouteMatcher, so
 * this file re-mocks them with real behaviour captured from the module.
 */
vi.mock("@clerk/nextjs/server", () => {
    const createRouteMatcher = (patterns: string[]) => {
        const regexes = patterns.map(
            (p) => new RegExp(`^${p.replace(/\(\.\*\)/g, "(?:/.*)?")}$`)
        );
        return (req: { nextUrl: { pathname: string } }) =>
            regexes.some((r) => r.test(req.nextUrl.pathname));
    };
    return {
        createRouteMatcher,
        clerkMiddleware: (handler: any) => handler,
        auth: vi.fn(),
        currentUser: vi.fn(),
        clerkClient: { users: {} },
    };
});

import middleware, { config } from "./proxy";

const protect = vi.fn();
const auth = Object.assign(() => ({ protect }), { protect });
const request = (pathname: string) => ({ nextUrl: { pathname } }) as any;

const run = (pathname: string) => {
    protect.mockClear();
    (middleware as any)(auth, request(pathname));
    return protect.mock.calls.length > 0;
};

beforeEach(() => protect.mockClear());

describe("public routes", () => {
    it.each([
        ["the landing page", "/"],
        ["sign-up", "/signup"],
        ["a Clerk sign-up catch-all", "/signup/step-one"],
        ["login", "/login"],
        ["a Clerk sign-in catch-all", "/login/factor-one"],
        ["the Clerk webhook", "/api/webhooks/user"],
        ["the seed endpoint", "/api/seed/65a000000000000000000001"],
        ["the barbell calculator", "/load"],
        ["the offline fallback", "/offline"],
        ["the privacy policy", "/privacy-policy"],
        ["the terms of service", "/terms-service"],
        ["the tools index", "/tools"],
        ["a tools calculator", "/tools/bmi-calculator"],
        ["the sitemap", "/sitemap.xml"],
    ])("does not protect %s", (_label, pathname) => {
        expect(run(pathname)).toBe(false);
    });
});

describe("protected routes", () => {
    it.each([
        ["the dashboard", "/dashboard"],
        ["glucose", "/glucose"],
        ["a glucose entry", "/glucose/65b000000000000000000abc"],
        ["insulin", "/insulin"],
        ["weight", "/weight"],
        ["measurement", "/measurement"],
        ["charts", "/charts"],
        ["stats", "/stats"],
        ["profile", "/profile"],
        ["a glucose API route", "/api/glucose/get/7"],
        ["a delete API route", "/api/weight/delete/abc"],
        ["the subscription API", "/api/users/subscription"],
    ])("protects %s", (_label, pathname) => {
        expect(run(pathname)).toBe(true);
    });

    /**
     * Worth knowing: the contact page and its API are NOT in the public list,
     * so a signed-out visitor cannot reach a page that looks public.
     * Characterizing current behavior.
     */
    it.each(["/contact-us", "/api/contact-us/add"])(
        "protects %s despite it looking public",
        (pathname) => {
            expect(run(pathname)).toBe(true);
        }
    );

    it("protects a path that merely starts like a public one", () => {
        expect(run("/loading-secrets")).toBe(true);
    });
});

describe("matcher config", () => {
    it("always runs for API routes", () => {
        expect(config.matcher).toContain("/(api|trpc)(.*)");
    });

    it("skips Next internals and static assets", () => {
        const [assetMatcher] = config.matcher;

        expect(assetMatcher).toContain("_next");
        expect(assetMatcher).toContain("webmanifest");
    });

    /**
     * /sw.js is deliberately excluded by the `.js` extension rule so the
     * service worker is served without an auth round-trip.
     */
    it("excludes .js files, which is what lets /sw.js be served", () => {
        const matcher = new RegExp(config.matcher[0]);

        expect(matcher.test("/sw.js")).toBe(false);
        expect(matcher.test("/dashboard")).toBe(true);
    });

    it("does not exclude .json, only .js", () => {
        const matcher = new RegExp(config.matcher[0]);

        expect(matcher.test("/data.json")).toBe(true);
    });
});
