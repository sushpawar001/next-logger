import { describe, expect, it } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/test/render";
import { getTool } from "@/lib/tools/registry";
import BloodSugarConverter from "./BloodSugarConverter";

const { cta } = getTool("blood-sugar-converter");

describe("BloodSugarConverter", () => {
    it("shows an empty state and no signup prompt before any input", () => {
        renderWithProviders(<BloodSugarConverter />);

        expect(
            screen.getByText(/enter a blood glucose reading/i)
        ).toBeInTheDocument();
        expect(screen.queryByText(cta.heading)).not.toBeInTheDocument();
    });

    it("converts mg/dL from the URL into both units", () => {
        renderWithProviders(<BloodSugarConverter />, {
            searchParams: "?value=126",
        });

        expect(screen.getByText("126")).toBeInTheDocument();
        expect(screen.getByText("7.0")).toBeInTheDocument();
        expect(screen.getByText(/within the 70–180 mg\/dL target/i)).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: new RegExp(cta.label) })
        ).toHaveAttribute("href", "/signup");
    });

    it("converts mmol/L and applies the fasting ranges", () => {
        renderWithProviders(<BloodSugarConverter />, {
            searchParams: "?value=7&unit=mmol&context=fasting",
        });

        expect(screen.getByText("126")).toBeInTheDocument();
        expect(screen.getByText("Diabetes range")).toBeInTheDocument();
    });

    it("flags a low reading", () => {
        renderWithProviders(<BloodSugarConverter />, {
            searchParams: "?value=50",
        });

        expect(screen.getByText(/level 2 low/i)).toBeInTheDocument();
        expect(screen.getByText(/this is low/i)).toBeInTheDocument();
    });

    it("explains an implausible value", () => {
        renderWithProviders(<BloodSugarConverter />, {
            searchParams: "?value=5000",
        });

        expect(screen.getByText(/between 10 and 1000 mg\/dL/i)).toBeInTheDocument();
        expect(screen.queryByText(cta.heading)).not.toBeInTheDocument();
    });

    it("writes the reading to the URL", async () => {
        const user = userEvent.setup();
        const updates: string[] = [];
        renderWithProviders(<BloodSugarConverter />, {
            onUrlUpdate: (e) => updates.push(e.queryString),
        });

        await user.type(screen.getByLabelText("Blood glucose"), "9");
        await user.click(screen.getByLabelText("Fasting"));

        expect(updates.join(" ")).toContain("value=9");
        expect(updates.join(" ")).toContain("context=fasting");
    });
});
