import { describe, expect, it } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/test/render";
import { getTool } from "@/lib/tools/registry";
import GmiCalculator from "./GmiCalculator";

const { cta } = getTool("gmi-calculator");

describe("GmiCalculator", () => {
    it("shows an empty state and no signup prompt before any input", () => {
        renderWithProviders(<GmiCalculator />);

        expect(screen.getByText(/paste your readings or enter an average/i)).toBeInTheDocument();
        expect(screen.queryByText(cta.heading)).not.toBeInTheDocument();
    });

    it("summarises readings from the URL", () => {
        // 10 readings: one very low, one low, six in range, one high, one very high.
        renderWithProviders(<GmiCalculator />, {
            searchParams: "?readings=50,60,100,150,200,300,120,140,160,170",
        });

        // Mean 145 mg/dL → GMI 3.31 + 0.02392 × 145 = 6.78
        expect(screen.getByText("6.8%")).toBeInTheDocument();
        expect(screen.getByText("145 mg/dL")).toBeInTheDocument();
        expect(screen.getByText(/from 10 readings/i)).toBeInTheDocument();
        expect(screen.getAllByText("60.0%").length).toBeGreaterThan(0);
        expect(
            screen.getByRole("link", { name: new RegExp(cta.label) })
        ).toHaveAttribute("href", "/signup");
    });

    it("marks targets as met or missed", () => {
        renderWithProviders(<GmiCalculator />, {
            searchParams: "?readings=50,60,100,150,200,300,120,140,160,170",
        });

        expect(screen.getAllByLabelText("Target not met").length).toBeGreaterThan(0);
        expect(screen.getAllByLabelText("Target met").length).toBeGreaterThan(0);
    });

    it("reports skipped values", () => {
        renderWithProviders(<GmiCalculator />, {
            searchParams: "?readings=100,abc,150",
        });

        expect(screen.getByText(/skipped 1 value/i)).toBeInTheDocument();
    });

    it("asks for at least two readings", () => {
        renderWithProviders(<GmiCalculator />, { searchParams: "?readings=120" });

        expect(screen.getByText(/at least two readings/i)).toBeInTheDocument();
        expect(screen.queryByText(cta.heading)).not.toBeInTheDocument();
    });

    it("computes GMI from an average in mmol/L", () => {
        renderWithProviders(<GmiCalculator />, {
            searchParams: "?mode=mean&mean=8.3&unit=mmol",
        });

        // 8.3 mmol/L ≈ 149.5 mg/dL → GMI ≈ 6.9
        expect(screen.getByText("6.9%")).toBeInTheDocument();
    });

    it("writes pasted readings to the URL", async () => {
        const user = userEvent.setup();
        const updates: string[] = [];
        renderWithProviders(<GmiCalculator />, {
            onUrlUpdate: (e) => updates.push(e.queryString),
        });

        await user.type(screen.getByRole("textbox", { name: /readings \(mg\/dl\)/i }), "1");

        expect(updates.join(" ")).toContain("readings=1");
    });
});
