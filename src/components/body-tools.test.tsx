import { describe, expect, it } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/test/render";
import { getTool } from "@/lib/tools/registry";
import WhtrCalculator from "./WhtrCalculator";
import WeightLossCalculator from "./WeightLossCalculator";

describe("WhtrCalculator", () => {
    const { cta } = getTool("waist-to-height-ratio-calculator");

    it("shows an empty state and no signup prompt before any input", () => {
        renderWithProviders(<WhtrCalculator />);

        expect(screen.getByText(/enter your waist and height/i)).toBeInTheDocument();
        expect(screen.queryByText(cta.heading)).not.toBeInTheDocument();
    });

    it("computes the ratio and band from the URL", () => {
        renderWithProviders(<WhtrCalculator />, {
            searchParams: "?waist=90&height=170",
        });

        expect(screen.getByText("0.53")).toBeInTheDocument();
        expect(screen.getByText("Increased health risk")).toBeInTheDocument();
        expect(screen.getByText("85.0 cm")).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: new RegExp(cta.label) })
        ).toHaveAttribute("href", "/signup");
    });

    it("works in inches", () => {
        renderWithProviders(<WhtrCalculator />, {
            searchParams: "?units=imperial&waist=30&height=68",
        });

        expect(screen.getByText("0.44")).toBeInTheDocument();
        expect(screen.getByText("Healthy")).toBeInTheDocument();
        expect(screen.getByText("34.0 in")).toBeInTheDocument();
    });

    it("flags mismatched units", () => {
        renderWithProviders(<WhtrCalculator />, {
            searchParams: "?waist=90&height=5.8",
        });

        expect(screen.getByText(/same unit/i)).toBeInTheDocument();
    });

    it("writes inputs to the URL", async () => {
        const user = userEvent.setup();
        const updates: string[] = [];
        renderWithProviders(<WhtrCalculator />, {
            onUrlUpdate: (e) => updates.push(e.queryString),
        });

        await user.type(screen.getByLabelText("Waist"), "8");

        expect(updates.join(" ")).toContain("waist=8");
    });
});

describe("WeightLossCalculator", () => {
    const { cta } = getTool("weight-loss-percentage-calculator");

    it("shows an empty state and no signup prompt before any input", () => {
        renderWithProviders(<WeightLossCalculator />);

        expect(screen.getByText(/enter your starting and current weight/i)).toBeInTheDocument();
        expect(screen.queryByText(cta.heading)).not.toBeInTheDocument();
    });

    it("shows the percentage lost and goal progress", () => {
        renderWithProviders(<WeightLossCalculator />, {
            searchParams: "?start=100&current=92&goal=80",
        });

        expect(screen.getByText("8.0%")).toBeInTheDocument();
        expect(screen.getByText("8.0 kg")).toBeInTheDocument();
        expect(screen.getByText("40%")).toBeInTheDocument();
        expect(screen.getByText("12.0 kg to go")).toBeInTheDocument();
        expect(screen.getByText(/5% milestone: 95.0 kg/)).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: new RegExp(cta.label) })
        ).toHaveAttribute("href", "/signup");
    });

    it("reports a gain", () => {
        renderWithProviders(<WeightLossCalculator />, {
            searchParams: "?unit=lb&start=180&current=189",
        });

        expect(screen.getByText("Gained")).toBeInTheDocument();
        expect(screen.getByText("9.0 lb")).toBeInTheDocument();
    });

    it("projects a goal date from a start date", () => {
        renderWithProviders(<WeightLossCalculator />, {
            searchParams: "?start=100&current=96&goal=90&startDate=2020-01-01",
        });

        expect(screen.getByText(/a week/)).toBeInTheDocument();
    });

    it("writes the start date to the URL", async () => {
        const user = userEvent.setup();
        const updates: string[] = [];
        renderWithProviders(<WeightLossCalculator />, {
            onUrlUpdate: (e) => updates.push(e.queryString),
        });

        await user.type(screen.getByLabelText(/start date/i), "2026-01-05");

        expect(updates.join(" ")).toContain("startDate=2026-01-05");
    });
});
