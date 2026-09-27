import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/test/render";
import { getTool } from "@/lib/tools/registry";

vi.mock("@/lib/pwa", () => ({ trackPwaEvent: vi.fn() }));

import { trackPwaEvent } from "@/lib/pwa";
import CalculatorLayout from "./CalculatorLayout";
import FormulaSource from "./FormulaSource";
import RelatedTools from "./RelatedTools";
import ToolCta from "./ToolCta";
import ToolDisclaimer from "./ToolDisclaimer";
import ToolFaq from "./ToolFaq";
import ToolPageShell from "./ToolPageShell";

const FAQS = [
    { q: "What is BMI?", a: "Weight divided by height squared." },
    { q: "Is BMI accurate for athletes?", a: "Not always." },
];

describe("ToolPageShell", () => {
    const renderShell = () =>
        renderWithProviders(
            <ToolPageShell
                slug="bmi-calculator"
                intro={<p>Intro copy</p>}
                faqs={FAQS}
                reference={<table aria-label="Reference" />}
                formula={{
                    formula: "BMI = kg / m²",
                    sources: [{ label: "WHO", href: "https://www.who.int/" }],
                }}
            >
                <div>calculator goes here</div>
            </ToolPageShell>
        );

    it("renders the registry heading, breadcrumb and calculator", () => {
        renderShell();

        expect(
            screen.getByRole("heading", {
                level: 1,
                name: getTool("bmi-calculator").h1,
            })
        ).toBeInTheDocument();
        const crumbs = screen.getByRole("navigation", { name: /breadcrumb/i });
        expect(crumbs).toHaveTextContent("Home");
        expect(crumbs).toHaveTextContent("Tools");
        expect(screen.getByText("calculator goes here")).toBeInTheDocument();
        expect(screen.getByRole("table", { name: "Reference" })).toBeInTheDocument();
    });

    it("emits JSON-LD whose FAQ matches the visible FAQ", () => {
        const { container } = renderShell();

        const script = container.querySelector(
            'script[type="application/ld+json"]'
        );
        const data = JSON.parse(script!.innerHTML);
        const faqNode = data["@graph"].find(
            (n: any) => n["@type"] === "FAQPage"
        );

        expect(faqNode.mainEntity.map((q: any) => q.name)).toEqual(
            FAQS.map((f) => f.q)
        );
        for (const { q } of FAQS) {
            expect(screen.getByText(q)).toBeInTheDocument();
        }
    });

    it("links related tools and the method section", () => {
        renderShell();

        for (const slug of getTool("bmi-calculator").related) {
            expect(
                screen.getByRole("link", { name: new RegExp(getTool(slug).title) })
            ).toHaveAttribute("href", getTool(slug).href);
        }
        expect(screen.getByText("BMI = kg / m²")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "WHO" })).toHaveAttribute(
            "rel",
            "noopener noreferrer"
        );
    });
});

describe("ToolFaq", () => {
    it("renders nothing without questions", () => {
        const { container } = renderWithProviders(<ToolFaq faqs={[]} />);

        expect(container).toBeEmptyDOMElement();
    });

    it("keeps answers in the markup while collapsed", () => {
        renderWithProviders(<ToolFaq faqs={FAQS} />);

        expect(screen.getByText(FAQS[0].a)).toBeInTheDocument();
    });
});

describe("RelatedTools", () => {
    it("links back to the tool's cluster on the index", () => {
        renderWithProviders(<RelatedTools slug="bmi-calculator" />);

        expect(
            screen.getByRole("link", { name: /all body composition tools/i })
        ).toHaveAttribute("href", "/tools#body");
    });
});

describe("ToolCta", () => {
    it("links to signup with the tool's copy and records the click", async () => {
        const user = userEvent.setup();
        const { cta } = getTool("bmi-calculator");
        renderWithProviders(<ToolCta slug="bmi-calculator" />);

        expect(screen.getByText(cta.heading)).toBeInTheDocument();
        const link = screen.getByRole("link", { name: new RegExp(cta.label) });
        expect(link).toHaveAttribute("href", "/signup");

        link.addEventListener("click", (e) => e.preventDefault());
        await user.click(link);

        expect(trackPwaEvent).toHaveBeenCalledWith("tool_cta_click", {
            tool: "bmi-calculator",
        });
    });
});

describe("FormulaSource", () => {
    it("shows the review date as a calendar date regardless of time zone", () => {
        renderWithProviders(
            <FormulaSource formula="x" sources={[]} lastReviewed="2026-01-01" />
        );

        const time = screen.getByText("1 January 2026");
        expect(time.tagName).toBe("TIME");
        expect(time).toHaveAttribute("dateTime", "2026-01-01");
    });
});

describe("ToolDisclaimer", () => {
    it("warns diabetes pages not to change medication", () => {
        renderWithProviders(<ToolDisclaimer variant="diabetes" />);

        expect(screen.getByRole("complementary")).toHaveTextContent(
            /insulin/i
        );
    });
});

describe("CalculatorLayout", () => {
    it("shows the empty message until there is a result", () => {
        const { rerender } = renderWithProviders(
            <CalculatorLayout
                form={<form aria-label="inputs" />}
                result={null}
                emptyMessage="Enter a value"
            />
        );

        expect(screen.getByText("Enter a value")).toBeInTheDocument();

        rerender(
            <CalculatorLayout
                form={<form aria-label="inputs" />}
                result={<p>42</p>}
                emptyMessage="Enter a value"
            />
        );

        expect(screen.queryByText("Enter a value")).not.toBeInTheDocument();
        expect(screen.getByText("42")).toBeInTheDocument();
    });
});
