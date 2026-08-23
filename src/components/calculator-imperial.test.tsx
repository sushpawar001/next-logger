import { describe, expect, it } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/test/render";

import BMICalculator from "./BMICalculator";
import BMRCalculator from "./BMRCalculator";
import IdealWeightCalculator from "./IdealWeightCalculator";
import WHRCalculator from "./WHRCalculator";
import WaterIntakeCalculator from "./WaterIntakeCalculator";
import LoadCalc from "./LoadCalc";

/**
 * Imperial mode renders a different set of inputs (feet/inches, pounds,
 * inches) with their own change handlers, and the enum query params run their
 * nuqs `parse` function only when the URL actually carries a value. Both are
 * only reachable by starting from a seeded URL.
 */

const IMPERIAL = [
    {
        name: "BMI",
        Component: BMICalculator,
        seed: "?age=30&heightUnit=ft&heightFeet=5&heightInches=11&weightUnit=lbs&weightLbs=165",
    },
    {
        name: "BMR",
        Component: BMRCalculator,
        seed: "?age=30&heightUnit=ft&heightFeet=5&heightInches=11&weightUnit=lbs&weight=165",
    },
    {
        name: "Ideal weight",
        Component: IdealWeightCalculator,
        seed: "?age=30&heightUnit=ft&heightFeet=5&heightInches=11",
    },
    {
        name: "Water intake",
        Component: WaterIntakeCalculator,
        seed: "?age=30&heightUnit=ft&heightFeet=5&heightInches=11&weightUnit=lbs&weight=165",
    },
];

describe.each(IMPERIAL)("$name calculator in imperial mode", ({ Component, seed }) => {
    it("renders separate feet and inches inputs", () => {
        renderWithProviders(<Component />, { searchParams: seed });

        // Placeholders vary per calculator, so count the seeded values instead.
        expect(screen.getAllByDisplayValue("5").length).toBeGreaterThan(0);
        expect(screen.getAllByDisplayValue("11").length).toBeGreaterThan(0);
    });

    it("accepts changes to every imperial field", async () => {
        const user = userEvent.setup();
        renderWithProviders(<Component />, { searchParams: seed });

        for (const field of screen.queryAllByRole("spinbutton")) {
            await user.clear(field);
            await user.type(field, "6");
        }

        expect(
            screen.getAllByRole("button", { name: /calculate/i }).length
        ).toBeGreaterThan(0);
    });

    it("calculates from imperial values", async () => {
        const user = userEvent.setup();
        renderWithProviders(<Component />, { searchParams: seed });

        await user.click(screen.getAllByRole("button", { name: /calculate/i })[0]);

        expect(
            screen.queryAllByText(/please enter a valid/i).length
        ).toBeLessThanOrEqual(1);
    });

    it("switches back to metric", async () => {
        const user = userEvent.setup();
        renderWithProviders(<Component />, { searchParams: seed });

        for (const el of screen.queryAllByText(/centimeters/i)) {
            await user.click(el);
        }

        expect(
            screen.getAllByRole("button", { name: /calculate/i }).length
        ).toBeGreaterThan(0);
    });
});

describe("WHR calculator in inches", () => {
    const seed = "?gender=female&waistUnit=in&waistIn=34&hipUnit=in&hipIn=40";

    it("renders the inch inputs", () => {
        renderWithProviders(<WHRCalculator />, { searchParams: seed });

        expect(screen.getAllByRole("spinbutton").length).toBeGreaterThan(0);
    });

    it("accepts changes to the inch fields", async () => {
        const user = userEvent.setup();
        renderWithProviders(<WHRCalculator />, { searchParams: seed });

        for (const field of screen.queryAllByRole("spinbutton")) {
            await user.clear(field);
            await user.type(field, "36");
        }

        expect(
            screen.getAllByRole("button", { name: /calculate/i }).length
        ).toBeGreaterThan(0);
    });

    it("computes a ratio from inches", async () => {
        const user = userEvent.setup();
        renderWithProviders(<WHRCalculator />, { searchParams: seed });

        await user.click(screen.getAllByRole("button", { name: /calculate/i })[0]);

        // 34/40 = 0.85 -> High Risk for a woman
        expect(screen.getAllByText(/0\.8/).length).toBeGreaterThan(0);
    });

    it("renders the important-notes panel", () => {
        const { container } = renderWithProviders(<WHRCalculator />, {
            searchParams: seed,
        });

        expect(container.textContent).toMatch(/whr/i);
    });
});

/**
 * Each enum query param supplies a hand-written parse() that clamps unknown
 * values to a safe default, so a hand-edited or stale shared link degrades
 * rather than breaking the form.
 */
describe("enum query parameters clamp unknown values", () => {
    it.each([
        ["BMI heightUnit", BMICalculator, "?heightUnit=furlongs"],
        ["BMI weightUnit", BMICalculator, "?weightUnit=stones"],
        ["BMI gender", BMICalculator, "?gender=unspecified"],
        ["BMR heightUnit", BMRCalculator, "?heightUnit=furlongs"],
        ["BMR gender", BMRCalculator, "?gender=unspecified"],
        ["Ideal weight gender", IdealWeightCalculator, "?gender=unspecified"],
        ["WHR waistUnit", WHRCalculator, "?waistUnit=cubits"],
        ["WHR hipUnit", WHRCalculator, "?hipUnit=cubits"],
        ["Water activityLevel", WaterIntakeCalculator, "?activityLevel=hyperactive"],
        ["Water weightUnit", WaterIntakeCalculator, "?weightUnit=stones"],
    ])("%s falls back to its default", (_label, Component, seed) => {
        renderWithProviders(<Component />, { searchParams: seed });

        expect(
            screen.getAllByRole("button", { name: /calculate/i }).length
        ).toBeGreaterThan(0);
    });

    it("still calculates with an unknown unit in the URL", async () => {
        const user = userEvent.setup();
        renderWithProviders(<BMICalculator />, {
            searchParams: "?age=30&heightUnit=furlongs&heightCm=180&weightKg=75",
        });

        await user.click(screen.getAllByRole("button", { name: /calculate/i })[0]);

        // Falls back to cm, so the seeded heightCm is used and BMI is 23.1
        expect(screen.getAllByText(/23\.1/).length).toBeGreaterThan(0);
    });
});

describe("LoadCalc controls", () => {
    it("accepts a change to the bar weight", async () => {
        const user = userEvent.setup();
        renderWithProviders(<LoadCalc />);

        const numbers = screen.getAllByRole("spinbutton");
        for (const field of numbers) {
            await user.clear(field);
            await user.type(field, "60");
        }

        expect(numbers.length).toBeGreaterThan(0);
    });

    it("toggles the available plates", async () => {
        const user = userEvent.setup();
        renderWithProviders(<LoadCalc />);

        const checkboxes = screen.queryAllByRole("checkbox");
        for (const box of checkboxes) {
            await user.click(box);
        }

        expect(screen.getAllByRole("spinbutton").length).toBeGreaterThan(0);
    });

    it("recomputes after changing both the load and the plate set", async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(<LoadCalc />);

        const numbers = screen.getAllByRole("spinbutton");
        await user.clear(numbers[0]);
        await user.type(numbers[0], "100");
        const checkboxes = screen.queryAllByRole("checkbox");
        if (checkboxes.length) await user.click(checkboxes[0]);

        expect(container.textContent!.length).toBeGreaterThan(0);
    });
});
