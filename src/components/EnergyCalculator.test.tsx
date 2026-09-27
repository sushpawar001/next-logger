import { describe, expect, it } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/test/render";
import EnergyCalculator from "./EnergyCalculator";

// 30-year-old man, 180 cm, 80 kg: BMR = 1780 kcal.
const STATS = "?age=30&heightCm=180&weight=80";

describe("EnergyCalculator", () => {
    it("shows an empty state before the form is filled", () => {
        renderWithProviders(<EnergyCalculator variant="tdee" />);

        expect(
            screen.getByText(/enter your age, height and weight/i)
        ).toBeInTheDocument();
    });

    it("computes TDEE live from the URL", () => {
        renderWithProviders(<EnergyCalculator variant="tdee" />, {
            searchParams: `${STATS}&activity=light`,
        });

        // 1780 × 1.375 = 2447.5
        expect(screen.getAllByText("2,448 kcal").length).toBeGreaterThan(0);
        expect(screen.getByText("1,780 kcal")).toBeInTheDocument();
    });

    it("shows validation errors once the form is filled with bad values", () => {
        renderWithProviders(<EnergyCalculator variant="tdee" />, {
            searchParams: "?age=-4&heightCm=180&weight=80",
        });

        expect(screen.getByText(/valid age/i)).toBeInTheDocument();
    });

    it("links to the sibling calculators with the same numbers", () => {
        renderWithProviders(<EnergyCalculator variant="tdee" />, {
            searchParams: STATS,
        });

        const link = screen.getByRole("link", { name: /calorie deficit/i });
        expect(link.getAttribute("href")).toMatch(
            /^\/tools\/calorie-deficit-calculator\?/
        );
        expect(link.getAttribute("href")).toContain("weight=80");
        expect(
            screen.queryByRole("link", { name: /^tdee/i })
        ).not.toBeInTheDocument();
    });

    it("plans a deficit at the chosen pace", () => {
        renderWithProviders(<EnergyCalculator variant="deficit" />, {
            searchParams: `${STATS}&activity=moderate&pace=0.5&goalWeight=75`,
        });

        // TDEE 1780 × 1.465 = 2607.7; minus 550 = 2057.7
        expect(screen.getAllByText("2,058 kcal").length).toBeGreaterThan(0);
        expect(screen.getByText(/10 weeks/)).toBeInTheDocument();
    });

    it("warns when the target drops below the calorie floor", () => {
        renderWithProviders(<EnergyCalculator variant="deficit" />, {
            searchParams:
                "?age=60&gender=female&heightCm=155&weight=55&pace=1",
        });

        expect(screen.getByText(/common minimum/i)).toBeInTheDocument();
    });

    it("gives a maintenance range", () => {
        renderWithProviders(<EnergyCalculator variant="maintenance" />, {
            searchParams: STATS,
        });

        // TDEE 1780 × 1.2 = 2136 → 2036–2236
        expect(screen.getAllByText("2,036–2,236 kcal").length).toBeGreaterThan(0);
    });

    it("writes the activity level to the URL", async () => {
        const user = userEvent.setup();
        const updates: string[] = [];
        renderWithProviders(<EnergyCalculator variant="tdee" />, {
            onUrlUpdate: (e) => updates.push(e.queryString),
        });

        await user.click(screen.getByLabelText(/exercise 4-5 times/i));

        expect(updates.join(" ")).toContain("activity=moderate");
    });
});
