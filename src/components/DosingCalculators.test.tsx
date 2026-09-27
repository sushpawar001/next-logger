import { beforeEach, describe, expect, it } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/test/render";
import { getTool } from "@/lib/tools/registry";
import { DOSING_ACK_KEY } from "@/components/tools/DosingGate";
import {
    BolusCalculator,
    CarbRatioCalculator,
    CorrectionFactorCalculator,
} from "./DosingCalculators";

beforeEach(() => {
    sessionStorage.clear();
});

const acknowledge = () => sessionStorage.setItem(DOSING_ACK_KEY, "1");

describe("DosingGate", () => {
    it("hides the calculator until the visitor acknowledges the warning", async () => {
        const user = userEvent.setup();
        renderWithProviders(<CorrectionFactorCalculator />, {
            searchParams: "?tdd=40",
        });

        expect(screen.getByText(/before you use this calculator/i)).toBeInTheDocument();
        expect(screen.queryByText("45")).not.toBeInTheDocument();
        const show = screen.getByRole("button", { name: /show the calculator/i });
        expect(show).toBeDisabled();

        await user.click(screen.getByRole("checkbox", { name: /education only/i }));
        await user.click(show);

        expect(screen.getByText("45")).toBeInTheDocument();
        expect(sessionStorage.getItem(DOSING_ACK_KEY)).toBe("1");
    });

    it("remembers the acknowledgement for the session", () => {
        acknowledge();
        renderWithProviders(<CarbRatioCalculator />, { searchParams: "?tdd=50" });

        expect(screen.queryByText(/before you use this calculator/i)).not.toBeInTheDocument();
        expect(screen.getByText("1 : 10")).toBeInTheDocument();
    });
});

describe("CorrectionFactorCalculator", () => {
    beforeEach(acknowledge);

    it("shows the 1800-rule factor in both units", () => {
        renderWithProviders(<CorrectionFactorCalculator />, {
            searchParams: "?tdd=40",
        });

        expect(screen.getByText("45")).toBeInTheDocument();
        expect(screen.getByText("2.5")).toBeInTheDocument();
        expect(
            screen.getByRole("link", {
                name: new RegExp(getTool("insulin-sensitivity-factor-calculator").cta.label),
            })
        ).toHaveAttribute("href", "/signup");
    });

    it("uses the 1500 rule for regular insulin", () => {
        renderWithProviders(<CorrectionFactorCalculator />, {
            searchParams: "?tdd=50&insulin=regular",
        });

        expect(screen.getByText("30")).toBeInTheDocument();
    });

    it("explains an implausible daily dose", () => {
        renderWithProviders(<CorrectionFactorCalculator />, {
            searchParams: "?tdd=900",
        });

        expect(screen.getByText(/between 2 and 300 units/i)).toBeInTheDocument();
    });
});

describe("BolusCalculator", () => {
    beforeEach(acknowledge);
    const SETTINGS = "ratio=10&target=120&sensitivity=40";

    it("adds the meal and correction doses", () => {
        renderWithProviders(<BolusCalculator />, {
            searchParams: `?carbs=60&glucose=200&${SETTINGS}`,
        });

        expect(screen.getByText("8.0 units")).toBeInTheDocument();
        expect(screen.getByText("6.0 units")).toBeInTheDocument();
        expect(screen.getByText("2.0 units")).toBeInTheDocument();
    });

    it("subtracts insulin on board from the correction", () => {
        renderWithProviders(<BolusCalculator />, {
            searchParams: `?carbs=60&glucose=200&onBoard=1.5&${SETTINGS}`,
        });

        expect(screen.getByText("6.5 units")).toBeInTheDocument();
        expect(screen.getByText("−1.5 units")).toBeInTheDocument();
    });

    it("refuses to show a dose for a low reading", () => {
        renderWithProviders(<BolusCalculator />, {
            searchParams: `?carbs=60&glucose=62&${SETTINGS}`,
        });

        expect(screen.getByText(/your blood sugar is low/i)).toBeInTheDocument();
        expect(screen.getByText(/15-15 rule/i)).toBeInTheDocument();
        expect(screen.queryByText(/^\d+\.\d units$/)).not.toBeInTheDocument();
        expect(screen.queryByText(/estimated mealtime dose/i)).not.toBeInTheDocument();
    });

    it("shows nothing until every required field is filled", () => {
        renderWithProviders(<BolusCalculator />, {
            searchParams: "?carbs=60&glucose=200",
        });

        expect(screen.getByText(/enter your meal, reading and settings/i)).toBeInTheDocument();
    });

    it("writes the meal to the URL", async () => {
        const user = userEvent.setup();
        const updates: string[] = [];
        renderWithProviders(<BolusCalculator />, {
            onUrlUpdate: (e) => updates.push(e.queryString),
        });

        await user.type(screen.getByLabelText(/carbohydrate in the meal/i), "4");

        expect(updates.join(" ")).toContain("carbs=4");
    });
});
