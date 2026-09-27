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
import A1cPage from "./(Public)/tools/a1c-calculator/page";
import BloodSugarPage from "./(Public)/tools/blood-sugar-converter/page";
import BodyFatPage from "./(Public)/tools/body-fat-calculator/page";
import TdeePage from "./(Public)/tools/tdee-calculator/page";
import DeficitPage from "./(Public)/tools/calorie-deficit-calculator/page";
import MaintenancePage from "./(Public)/tools/maintenance-calorie-calculator/page";
import PlatePage from "./(Public)/tools/plate-calculator/page";
import GmiPage from "./(Public)/tools/gmi-calculator/page";
import WhtrPage from "./(Public)/tools/waist-to-height-ratio-calculator/page";
import WeightLossPage from "./(Public)/tools/weight-loss-percentage-calculator/page";
import IsfPage from "./(Public)/tools/insulin-sensitivity-factor-calculator/page";
import CarbRatioPage from "./(Public)/tools/insulin-to-carb-ratio-calculator/page";
import BolusPage from "./(Public)/tools/bolus-calculator/page";
import DiabetesHubPage from "./(Public)/tools/diabetes/page";
import OneRepMaxPage from "./(Public)/tools/one-rep-max-calculator/page";
import PrivacyPolicyPage from "./(Public)/privacy-policy/page";
import TermsPage from "./(Public)/terms-service/page";
import ContactUsPage from "./(Public)/contact-us/page";
import robots from "./robots";
import sitemap from "./sitemap";
import { getHub, getTool, HUBS, TOOLS } from "@/lib/tools/registry";
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
    { name: "A1c", Page: A1cPage, heading: /a1c to average blood sugar/i },
    { name: "blood sugar", Page: BloodSugarPage, heading: /mg\/dl to mmol\/l/i },
    { name: "body fat", Page: BodyFatPage, heading: /body fat calculator/i },
    { name: "TDEE", Page: TdeePage, heading: /total daily energy expenditure/i },
    { name: "calorie deficit", Page: DeficitPage, heading: /calorie deficit calculator/i },
    { name: "maintenance", Page: MaintenancePage, heading: /maintenance calorie calculator/i },
    { name: "plate", Page: PlatePage, heading: /barbell plate calculator/i },
    { name: "GMI", Page: GmiPage, heading: /gmi and time in range/i },
    { name: "waist-to-height", Page: WhtrPage, heading: /waist-to-height ratio calculator/i },
    { name: "weight loss", Page: WeightLossPage, heading: /weight loss percentage/i },
    { name: "correction factor", Page: IsfPage, heading: /insulin sensitivity factor/i },
    { name: "carb ratio", Page: CarbRatioPage, heading: /insulin-to-carb ratio/i },
    { name: "bolus", Page: BolusPage, heading: /bolus insulin calculator/i },
    { name: "one rep max", Page: OneRepMaxPage, heading: /one rep max/i },
];

// Every registered tool page, keyed by slug. A test below fails if a tool is
// added to the registry without being added here.
const PAGES_BY_SLUG: Record<string, () => React.JSX.Element> = {
    "bmi-calculator": BmiPage,
    "bmr-calculator": BmrPage,
    "ideal-weight-calculator": IdealWeightPage,
    "water-intake-calculator": WaterIntakePage,
    "whr-calculator": WhrPage,
    "a1c-calculator": A1cPage,
    "blood-sugar-converter": BloodSugarPage,
    "body-fat-calculator": BodyFatPage,
    "tdee-calculator": TdeePage,
    "calorie-deficit-calculator": DeficitPage,
    "maintenance-calorie-calculator": MaintenancePage,
    "plate-calculator": PlatePage,
    "gmi-calculator": GmiPage,
    "waist-to-height-ratio-calculator": WhtrPage,
    "weight-loss-percentage-calculator": WeightLossPage,
    "insulin-sensitivity-factor-calculator": IsfPage,
    "insulin-to-carb-ratio-calculator": CarbRatioPage,
    "bolus-calculator": BolusPage,
    "one-rep-max-calculator": OneRepMaxPage,
};

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

describe("calculator pages carry SEO content", () => {
    it("covers every registered tool", () => {
        expect(Object.keys(PAGES_BY_SLUG).sort()).toEqual(
            TOOLS.map((t) => t.slug).sort()
        );
    });

    it.each(Object.entries(PAGES_BY_SLUG))(
        "%s renders a FAQ, a method section and JSON-LD",
        (_slug, Page) => {
            const { container } = renderWithProviders(<Page />);

            expect(
                screen.getByRole("heading", {
                    name: /frequently asked questions/i,
                })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("heading", { name: /how it.s calculated/i })
            ).toBeInTheDocument();
            const script = container.querySelector(
                'script[type="application/ld+json"]'
            );
            const types = JSON.parse(script!.innerHTML)["@graph"].map(
                (n: any) => n["@type"]
            );
            expect(types).toEqual([
                "WebApplication",
                "BreadcrumbList",
                "FAQPage",
            ]);
        }
    );
});

describe("diabetes hub", () => {
    const hub = getHub("diabetes");

    it("links every diabetes tool and the related weight tools", () => {
        renderWithProviders(<DiabetesHubPage />);

        const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
        const diabetes = TOOLS.filter((t) => t.cluster === "diabetes");
        expect(diabetes.length).toBeGreaterThan(0);
        for (const tool of diabetes) expect(hrefs).toContain(tool.href);
        for (const slug of hub.alsoUseful) expect(hrefs).toContain(getTool(slug).href);
    });

    it("renders its heading, key numbers, FAQ and a signup prompt", () => {
        renderWithProviders(<DiabetesHubPage />);

        expect(screen.getByRole("heading", { level: 1, name: hub.h1 })).toBeInTheDocument();
        expect(screen.getByText("Normal fasting glucose")).toBeInTheDocument();
        expect(screen.getByText("Below 100 mg/dL (5.6 mmol/L)")).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { name: /frequently asked questions/i })
        ).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /start logging free/i })).toHaveAttribute(
            "href",
            "/signup"
        );
    });

    it("emits a CollectionPage listing the diabetes tools", () => {
        const { container } = renderWithProviders(<DiabetesHubPage />);

        const data = JSON.parse(
            container.querySelector('script[type="application/ld+json"]')!.innerHTML
        );
        const types = data["@graph"].map((n: any) => n["@type"]);
        expect(types).toEqual(["CollectionPage", "BreadcrumbList", "FAQPage"]);
        const items = data["@graph"][0].mainEntity.itemListElement;
        expect(items).toHaveLength(TOOLS.filter((t) => t.cluster === "diabetes").length);
    });

    it("is in the sitemap", () => {
        const urls = sitemap().map((entry: any) => entry.url);

        for (const h of HUBS) expect(urls.some((u: string) => u.endsWith(h.href))).toBe(true);
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

    it("shows the wordmark logo in the header, linking home", () => {
        renderWithProviders(<HomePage />);

        // The header's wordmark comes first; the footer repeats it unlinked.
        const logo = screen.getAllByRole("img", { name: "FitDose" })[0];
        expect(logo).toHaveAttribute("src", "/brand/svg/fitdose-wordmark.svg");
        expect(logo.closest("a")).toHaveAttribute("href", "/");
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

    it("shows the wordmark logo", () => {
        renderWithProviders(<OfflinePage />);

        expect(screen.getByRole("img", { name: "FitDose" })).toHaveAttribute(
            "src",
            "/brand/svg/fitdose-wordmark.svg"
        );
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

    // robots.txt matches by prefix, so "/load/" would not block "/load".
    it("robots.txt disallow entries have no trailing slash", () => {
        const rules: any = robots().rules;
        const disallow: string[] = (
            Array.isArray(rules) ? rules : [rules]
        ).flatMap((r: any) => r.disallow ?? []);

        expect(disallow).toContain("/load");
        for (const path of disallow) {
            expect(path.endsWith("/")).toBe(false);
        }
    });

    it("the sitemap lists every registered tool", () => {
        const urls = sitemap().map((entry: any) => entry.url);

        expect(urls.some((u: string) => u.endsWith("/tools"))).toBe(true);
        for (const tool of TOOLS) {
            expect(urls.some((u: string) => u.endsWith(tool.href))).toBe(true);
        }
    });

    it("dates each tool entry by its lastReviewed date", () => {
        for (const tool of TOOLS) {
            const entry: any = sitemap().find((e: any) =>
                e.url.endsWith(tool.href)
            );

            expect(entry.lastModified).toEqual(new Date(tool.lastReviewed));
        }
    });

    it("the sitemap drops the retired password-reset page", () => {
        const urls = sitemap().map((entry: any) => entry.url);

        expect(urls.some((u: string) => u.includes("forget-password"))).toBe(
            false
        );
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

    it("the manifest uses the Aubergine & Oat brand colours", () => {
        const result = manifest();

        expect(result.theme_color).toBe("#4A3470");
        expect(result.background_color).toBe("#FAF7F2");
    });
});
