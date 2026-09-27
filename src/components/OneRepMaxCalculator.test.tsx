import { describe, expect, it } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/test/render";
import { getTool } from "@/lib/tools/registry";
import OneRepMaxCalculator from "./OneRepMaxCalculator";

const { cta } = getTool("one-rep-max-calculator");

describe("OneRepMaxCalculator", () => {
    it("shows an empty state and no signup prompt before any input", () => {
        renderWithProviders(<OneRepMaxCalculator />);

        expect(screen.getByText(/enter the weight you lifted/i)).toBeInTheDocument();
        expect(screen.queryByText(cta.heading)).not.toBeInTheDocument();
    });

    it("estimates 1RM from the URL with each formula", () => {
        renderWithProviders(<OneRepMaxCalculator />, {
            searchParams: "?weight=100&reps=5",
        });

        // Epley 116.7, Brzycki 112.5, Lombardi 117.5 → average 115.5
        expect(screen.getByText("116.7 kg")).toBeInTheDocument();
        expect(screen.getByText("112.5 kg")).toBeInTheDocument();
        expect(screen.getByText("117.5 kg")).toBeInTheDocument();
        expect(screen.getAllByText("115.5 kg").length).toBeGreaterThan(0);
        expect(
            screen.getByRole("link", { name: new RegExp(cta.label) })
        ).toHaveAttribute("href", "/signup");
    });

    it("shows training loads from the NSCA chart", () => {
        renderWithProviders(<OneRepMaxCalculator />, {
            searchParams: "?weight=200&reps=1&unit=lb",
        });

        // 1RM 200 lb: 87% for 5 reps is 174 lb.
        expect(screen.getByText("174.0 lb")).toBeInTheDocument();
    });

    it("warns that high-rep estimates are less reliable", () => {
        renderWithProviders(<OneRepMaxCalculator />, {
            searchParams: "?weight=60&reps=12",
        });

        expect(screen.getByText(/less reliable/i)).toBeInTheDocument();
    });

    it("explains invalid reps", () => {
        renderWithProviders(<OneRepMaxCalculator />, {
            searchParams: "?weight=100&reps=20",
        });

        expect(screen.getByText(/whole number of reps from 1 to 12/i)).toBeInTheDocument();
    });

    it("writes inputs to the URL", async () => {
        const user = userEvent.setup();
        const updates: string[] = [];
        renderWithProviders(<OneRepMaxCalculator />, {
            onUrlUpdate: (e) => updates.push(e.queryString),
        });

        await user.type(screen.getByLabelText("Reps completed"), "5");

        expect(updates.join(" ")).toContain("reps=5");
    });
});
