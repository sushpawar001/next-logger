import { describe, expect, it } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/test/render";
import { getTool } from "@/lib/tools/registry";
import A1cCalculator from "./A1cCalculator";

/**
 * The maths is covered in src/lib/calculators/a1c.test.ts. These tests cover
 * the wiring: the result is derived live from the URL, so a shared link shows
 * the answer without clicking anything.
 */
const { cta } = getTool("a1c-calculator");

describe("A1cCalculator", () => {
    it("shows an empty state and no signup prompt before any input", () => {
        renderWithProviders(<A1cCalculator />);

        expect(
            screen.getByText(/enter an a1c or an average glucose/i)
        ).toBeInTheDocument();
        expect(screen.queryByText(cta.heading)).not.toBeInTheDocument();
    });

    it("converts an A1c from the URL into every unit", () => {
        renderWithProviders(<A1cCalculator />, { searchParams: "?a1c=7" });

        expect(screen.getByText("7.0%")).toBeInTheDocument();
        expect(screen.getByText("53 mmol/mol")).toBeInTheDocument();
        expect(screen.getByText("154 mg/dL")).toBeInTheDocument();
        expect(screen.getByText("8.6 mmol/L")).toBeInTheDocument();
        expect(screen.getByText("Diabetes range")).toBeInTheDocument();
    });

    it("shows the signup prompt once there is a result", () => {
        renderWithProviders(<A1cCalculator />, { searchParams: "?a1c=5.4" });

        expect(screen.getByText("Normal")).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: new RegExp(cta.label) })
        ).toHaveAttribute("href", "/signup");
    });

    it("estimates A1c from an average glucose in mmol/L", () => {
        renderWithProviders(<A1cCalculator />, {
            searchParams: "?mode=eag&glucose=8.6&unit=mmol",
        });

        expect(screen.getByText("7.0%")).toBeInTheDocument();
        expect(screen.getByLabelText(/average blood glucose/i)).toHaveValue(8.6);
    });

    it("accepts A1c in mmol/mol", () => {
        renderWithProviders(<A1cCalculator />, {
            searchParams: "?a1c=48&a1cUnit=mmolmol",
        });

        expect(screen.getByText("6.5%")).toBeInTheDocument();
    });

    it("explains an out-of-range value instead of showing a result", () => {
        renderWithProviders(<A1cCalculator />, { searchParams: "?a1c=25" });

        expect(screen.getByText(/between 3% and 20%/i)).toBeInTheDocument();
        expect(screen.getByLabelText("A1c")).toHaveAttribute(
            "aria-invalid",
            "true"
        );
        expect(screen.queryByText(cta.heading)).not.toBeInTheDocument();
    });

    it("writes typed input to the URL so the result is shareable", async () => {
        const user = userEvent.setup();
        const updates: string[] = [];
        renderWithProviders(<A1cCalculator />, {
            onUrlUpdate: (e) => updates.push(e.queryString),
        });

        await user.type(screen.getByLabelText("A1c"), "6");

        expect(updates.join(" ")).toContain("a1c=6");
    });

    it("switches to average-glucose mode", async () => {
        const user = userEvent.setup();
        const updates: string[] = [];
        renderWithProviders(<A1cCalculator />, {
            onUrlUpdate: (e) => updates.push(e.queryString),
        });

        await user.click(screen.getByLabelText("Average glucose"));

        expect(updates.join(" ")).toContain("mode=eag");
    });
});
