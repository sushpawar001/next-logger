import { describe, expect, it } from "vitest";
import { renderWithProviders, screen, userEvent, within } from "@/test/render";

import BMICalculator from "./BMICalculator";
import BMRCalculator from "./BMRCalculator";
import IdealWeightCalculator from "./IdealWeightCalculator";
import WHRCalculator from "./WHRCalculator";
import WaterIntakeCalculator from "./WaterIntakeCalculator";

/**
 * The formulas themselves are unit-tested in src/lib/calculators/. These tests
 * cover the wiring: that inputs reach the maths, that results render, that
 * validation errors surface, and that inputs round-trip through the URL via
 * nuqs (which is what makes a result shareable).
 */

// Each calculator renders its form twice (desktop and mobile layouts), so
// every query below uses getAllBy*. WHR has no age field, hence the per-
// calculator seed parameter.
const CALCULATORS = [
    { name: "BMI", Component: BMICalculator, seed: "?age=42", seeded: "42" },
    { name: "BMR", Component: BMRCalculator, seed: "?age=42", seeded: "42" },
    {
        name: "Ideal weight",
        Component: IdealWeightCalculator,
        seed: "?age=42",
        seeded: "42",
    },
    { name: "WHR", Component: WHRCalculator, seed: "?waistCm=88", seeded: "88" },
    {
        name: "Water intake",
        Component: WaterIntakeCalculator,
        seed: "?age=42",
        seeded: "42",
    },
];

const calculateButton = () =>
    screen.getAllByRole("button", { name: /calculate/i })[0];

describe.each(CALCULATORS)("$name calculator", ({ Component, seed, seeded }) => {
    it("renders a form with a calculate action", () => {
        renderWithProviders(<Component />);

        expect(calculateButton()).toBeInTheDocument();
    });

    it("renders without a results panel until calculated", () => {
        renderWithProviders(<Component />);

        // The empty-state card invites the user to enter their details.
        expect(
            screen.getAllByText(/enter your (information|details|measurements)/i)
                .length
        ).toBeGreaterThan(0);
    });

    it("surfaces validation errors for an empty form", async () => {
        const user = userEvent.setup();
        renderWithProviders(<Component />);

        await user.click(calculateButton());

        expect(
            screen.getAllByText(/please enter a valid/i).length
        ).toBeGreaterThan(0);
    });

    it("reads its initial values from the URL", () => {
        renderWithProviders(<Component />, { searchParams: seed });

        expect(screen.getAllByDisplayValue(seeded).length).toBeGreaterThan(0);
    });
});

describe("BMI calculator", () => {
    /** Types into the first (desktop) copy of each field. */
    const fillMetric = async (user: ReturnType<typeof userEvent.setup>) => {
        await user.type(screen.getAllByPlaceholderText(/enter your age/i)[0], "30");
        await user.type(
            screen.getAllByPlaceholderText(/height in centimeters/i)[0],
            "180"
        );
        await user.type(
            screen.getAllByPlaceholderText(/weight in kilograms/i)[0],
            "75"
        );
    };

    it("computes and classifies a BMI", async () => {
        const user = userEvent.setup();
        renderWithProviders(<BMICalculator />, {
            searchParams: "?age=30&heightCm=180&weightKg=75",
        });

        await user.click(calculateButton());

        // 75kg at 1.8m -> 23.1, which is Normal
        expect(screen.getAllByText(/23\.1/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/normal/i).length).toBeGreaterThan(0);
    });

    it("classifies an obese BMI", async () => {
        const user = userEvent.setup();
        renderWithProviders(<BMICalculator />, {
            searchParams: "?age=30&heightCm=170&weightKg=95",
        });

        await user.click(calculateButton());

        expect(screen.getAllByText(/obesity/i).length).toBeGreaterThan(0);
    });

    it("writes inputs back to the URL so results are shareable", async () => {
        const user = userEvent.setup();
        const urlUpdates: string[] = [];
        renderWithProviders(<BMICalculator />, {
            onUrlUpdate: (e) => urlUpdates.push(e.queryString),
        });

        await user.type(screen.getAllByPlaceholderText(/enter your age/i)[0], "30");

        expect(urlUpdates.join("")).toContain("age=3");
    });

    it("switches to feet and inches", async () => {
        const user = userEvent.setup();
        renderWithProviders(<BMICalculator />);

        await user.click(screen.getAllByText(/feet & inches/i)[0]);

        expect(screen.getAllByPlaceholderText("5").length).toBeGreaterThan(0);
    });

    it("computes from imperial units", async () => {
        const user = userEvent.setup();
        renderWithProviders(<BMICalculator />, {
            searchParams:
                "?age=30&heightUnit=ft&heightFeet=5&heightInches=11&weightUnit=lbs&weightLbs=165",
        });

        await user.click(calculateButton());

        // 165lb at 5'11" -> ~23.0
        expect(screen.getAllByText(/2[23]\./).length).toBeGreaterThan(0);
    });
});

describe("BMR calculator", () => {
    it("computes a BMR and its activity levels", async () => {
        const user = userEvent.setup();
        renderWithProviders(<BMRCalculator />, {
            searchParams: "?age=30&gender=male&heightCm=180&weight=75",
        });

        await user.click(calculateButton());

        // 10(75) + 6.25(180) - 5(30) + 5 = 1730
        expect(screen.getAllByText(/1,?730/).length).toBeGreaterThan(0);
    });

    it("produces a lower BMR for women at the same measurements", async () => {
        const user = userEvent.setup();
        renderWithProviders(<BMRCalculator />, {
            searchParams: "?age=30&gender=female&heightCm=180&weight=75",
        });

        await user.click(calculateButton());

        expect(screen.getAllByText(/1,?564/).length).toBeGreaterThan(0);
    });
});

describe("Ideal weight calculator", () => {
    it("shows all four formula results", async () => {
        const user = userEvent.setup();
        renderWithProviders(<IdealWeightCalculator />, {
            searchParams: "?age=30&gender=male&heightCm=180",
        });

        await user.click(calculateButton());

        for (const formula of [/robinson/i, /miller/i, /devine/i, /hamwi/i]) {
            expect(screen.getAllByText(formula).length).toBeGreaterThan(0);
        }
    });

    it("gives women a lower ideal weight at the same height", async () => {
        const user = userEvent.setup();
        const { unmount } = renderWithProviders(<IdealWeightCalculator />, {
            searchParams: "?age=30&gender=female&heightCm=180",
        });

        await user.click(calculateButton());

        // Female Devine at 70.87in -> 45.5 + 2.2 * 10.87 = 69.4kg
        expect(screen.getAllByText(/69\.\d/).length).toBeGreaterThan(0);
        unmount();
    });
});

describe("WHR calculator", () => {
    it("computes a ratio and classifies the risk", async () => {
        const user = userEvent.setup();
        renderWithProviders(<WHRCalculator />, {
            searchParams: "?gender=male&waistCm=90&hipCm=100",
        });

        await user.click(calculateButton());

        expect(screen.getAllByText(/0\.9/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/moderate risk/i).length).toBeGreaterThan(0);
    });

    it("reports low risk for a small ratio", async () => {
        const user = userEvent.setup();
        renderWithProviders(<WHRCalculator />, {
            searchParams: "?gender=male&waistCm=80&hipCm=100",
        });

        await user.click(calculateButton());

        expect(screen.getAllByText(/low risk/i).length).toBeGreaterThan(0);
    });

    it("applies the stricter female thresholds", async () => {
        const user = userEvent.setup();
        renderWithProviders(<WHRCalculator />, {
            searchParams: "?gender=female&waistCm=85&hipCm=100",
        });

        await user.click(calculateButton());

        expect(screen.getAllByText(/high risk/i).length).toBeGreaterThan(0);
    });
});

describe("Water intake calculator", () => {
    it("computes a daily intake in litres", async () => {
        const user = userEvent.setup();
        renderWithProviders(<WaterIntakeCalculator />, {
            searchParams:
                "?age=30&gender=male&weight=70&heightCm=170&activityLevel=sedentary",
        });

        await user.click(calculateButton());

        // 70kg * 33ml = 2.31 L
        expect(screen.getAllByText(/2\.3/).length).toBeGreaterThan(0);
    });

    it("adds the activity adjustment", async () => {
        const user = userEvent.setup();
        renderWithProviders(<WaterIntakeCalculator />, {
            searchParams:
                "?age=30&gender=male&weight=70&heightCm=170&activityLevel=very-active",
        });

        await user.click(calculateButton());

        // very-active adds 1.5 L (extremely-active is the 2.0 one): 2.31 + 1.5
        expect(screen.getAllByText(/3\.8/).length).toBeGreaterThan(0);
    });
});
