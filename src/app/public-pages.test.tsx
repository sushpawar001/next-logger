import { describe, expect, it } from "vitest";
import { renderWithProviders, screen } from "@/test/render";

import HomePage from "./page";
import OfflinePage from "./offline/page";
import ToolsIndexPage from "./(Public)/tools/page";
import BmiPage from "./(Public)/tools/bmi-calculator/page";
import BmrPage from "./(Public)/tools/bmr-calculator/page";
import IdealWeightPage from "./(Public)/tools/ideal-weight-calculator/page";
import WaterIntakePage from "./(Public)/tools/water-intake-calculator/page";
import WhrPage from "./(Public)/tools/whr-calculator/page";
import PrivacyPolicyPage from "./(Public)/privacy-policy/page";
import TermsPage from "./(Public)/terms-service/page";
import ContactUsPage from "./(Public)/contact-us/page";
import robots from "./robots";
import sitemap from "./sitemap";
import manifest from "./manifest";

/**
 * The public surface is statically rendered and needs no Clerk session, so
 * these pages can be rendered directly. They are the SEO acquisition funnel,
 * and a render failure here is invisible until a crawler hits it.
 */

const TOOL_PAGES = [
    { name: "tools index", Page: ToolsIndexPage, heading: /calculator|tool/i },
    { name: "BMI", Page: BmiPage, heading: /body mass index/i },
    { name: "BMR", Page: BmrPage, heading: /basal metabolic rate|bmr/i },
    { name: "ideal weight", Page: IdealWeightPage, heading: /ideal body weight/i },
    { name: "water intake", Page: WaterIntakePage, heading: /water intake/i },
    { name: "WHR", Page: WhrPage, heading: /waist.to.hip|whr/i },
];

describe.each(TOOL_PAGES)("$name page", ({ Page, heading }) => {
    it("renders its heading", () => {
        renderWithProviders(<Page />);

        expect(
            screen.getAllByRole("heading", { name: heading }).length
        ).toBeGreaterThan(0);
    });

    it("renders without crashing and produces content", () => {
        const { container } = renderWithProviders(<Page />);

        expect(container.textContent!.length).toBeGreaterThan(100);
    });
});

describe("calculator pages carry their calculator", () => {
    it.each([
        ["BMI", BmiPage],
        ["BMR", BmrPage],
        ["ideal weight", IdealWeightPage],
        ["water intake", WaterIntakePage],
        ["WHR", WhrPage],
    ])("%s page renders a calculate button", (_name, Page) => {
        renderWithProviders(<Page />);

        expect(
            screen.getAllByRole("button", { name: /calculate/i }).length
        ).toBeGreaterThan(0);
    });

    it.each([
        ["BMI", BmiPage],
        ["BMR", BmrPage],
        ["water intake", WaterIntakePage],
        ["WHR", WhrPage],
    ])("%s page tells the user their data stays local", (_name, Page) => {
        const { container } = renderWithProviders(<Page />);

        expect(container.textContent).toMatch(/never stored|locally|your device/i);
    });
});

describe("legal pages", () => {
    it("renders the privacy policy", () => {
        const { container } = renderWithProviders(<PrivacyPolicyPage />);

        expect(
            screen.getAllByRole("heading", { name: /privacy/i }).length
        ).toBeGreaterThan(0);
        expect(container.textContent!.length).toBeGreaterThan(1000);
    });

    it("renders the terms of service", () => {
        const { container } = renderWithProviders(<TermsPage />);

        expect(
            screen.getAllByRole("heading", { name: /terms/i }).length
        ).toBeGreaterThan(0);
        expect(container.textContent!.length).toBeGreaterThan(500);
    });
});

describe("home page", () => {
    it("composes the marketing sections", () => {
        const { container } = renderWithProviders(<HomePage />);

        expect(container.textContent!.length).toBeGreaterThan(200);
    });

    it("renders at least one call to action", () => {
        renderWithProviders(<HomePage />);

        expect(
            screen.getAllByRole("link").length + screen.queryAllByRole("button").length
        ).toBeGreaterThan(0);
    });
});

describe("offline fallback", () => {
    it("tells the user they are offline", () => {
        const { container } = renderWithProviders(<OfflinePage />);

        expect(container.textContent).toMatch(/offline/i);
    });

    it("exports metadata for the precached page", async () => {
        const { metadata } = await import("./offline/page");

        expect(metadata.title).toMatch(/offline/i);
    });
});

describe("contact page", () => {
    it("renders a contact form", () => {
        renderWithProviders(<ContactUsPage />);

        expect(
            screen.getAllByRole("button", { name: /send|submit/i }).length
        ).toBeGreaterThan(0);
    });
});

describe("metadata routes", () => {
    it("robots.txt allows crawling and points at the sitemap", () => {
        const result = robots();

        expect(result.sitemap).toMatch(/sitemap\.xml$/);
        expect(result.rules).toBeDefined();
    });

    it("robots.txt disallows the authenticated app", () => {
        const rules: any = robots().rules;
        const disallow = (Array.isArray(rules) ? rules : [rules]).flatMap(
            (r: any) => r.disallow ?? []
        );

        expect(disallow.join(" ")).toMatch(/api|dashboard/i);
    });

    it("the sitemap lists the public tools funnel", () => {
        const urls = sitemap().map((entry: any) => entry.url);

        expect(urls.some((u: string) => u.endsWith("/tools"))).toBe(true);
        for (const tool of [
            "bmi-calculator",
            "bmr-calculator",
            "ideal-weight-calculator",
            "water-intake-calculator",
            "whr-calculator",
        ]) {
            expect(urls.some((u: string) => u.includes(tool))).toBe(true);
        }
    });

    it("the sitemap does not expose authenticated routes", () => {
        const urls = sitemap().map((entry: any) => entry.url);

        for (const route of ["/glucose", "/insulin", "/stats", "/profile"]) {
            expect(urls.some((u: string) => u.endsWith(route))).toBe(false);
        }
    });

    it("every sitemap entry is an absolute URL", () => {
        for (const entry of sitemap() as any[]) {
            expect(entry.url).toMatch(/^https?:\/\//);
        }
    });

    it("the manifest describes an installable PWA", () => {
        const result = manifest();

        expect(result.name).toBeTruthy();
        expect(result.start_url).toBeTruthy();
        expect(result.display).toBe("standalone");
        expect(result.icons!.length).toBeGreaterThan(0);
    });
});
