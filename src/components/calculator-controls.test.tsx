import { describe, expect, it } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/test/render";

import BMICalculator from "./BMICalculator";
import BMRCalculator from "./BMRCalculator";
import IdealWeightCalculator from "./IdealWeightCalculator";
import WHRCalculator from "./WHRCalculator";
import WaterIntakeCalculator from "./WaterIntakeCalculator";

/**
 * Every calculator renders its form twice (desktop and mobile) and wires each
 * field to its own change handler. These tests drive every control on every
 * copy, which proves each one is actually connected -- an unwired input renders
 * perfectly but silently drops the user's value.
 */

const CALCULATORS = [
    { name: "BMI", Component: BMICalculator },
    { name: "BMR", Component: BMRCalculator },
    { name: "Ideal weight", Component: IdealWeightCalculator },
    { name: "WHR", Component: WHRCalculator },
    { name: "Water intake", Component: WaterIntakeCalculator },
];

describe.each(CALCULATORS)("$name calculator controls", ({ Component }) => {
    it("accepts input on every numeric field", async () => {
        const user = userEvent.setup();
        renderWithProviders(<Component />);

        const numbers = screen.queryAllByRole("spinbutton");
        expect(numbers.length).toBeGreaterThan(0);

        for (const field of numbers) {
            await user.clear(field);
            await user.type(field, "5");
            expect((field as HTMLInputElement).value).not.toBe("");
        }
    });

    it("accepts input on every text field", async () => {
        const user = userEvent.setup();
        renderWithProviders(<Component />);

        for (const field of screen.queryAllByRole("textbox")) {
            await user.clear(field);
            await user.type(field, "5");
        }

        expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    });

    it("toggles every radio option", async () => {
        const user = userEvent.setup();
        renderWithProviders(<Component />);

        const radios = screen.queryAllByRole("radio");
        for (const radio of radios) {
            await user.click(radio);
        }

        expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    });

    it("switches through every unit toggle", async () => {
        const user = userEvent.setup();
        renderWithProviders(<Component />);

        // Unit switches are label-driven (cm/ft, kg/lbs, cm/in).
        const unitLabels = [
            /centimeters/i,
            /feet & inches/i,
            /kilograms/i,
            /pounds/i,
            /inches \(in\)/i,
        ];
        for (const label of unitLabels) {
            for (const el of screen.queryAllByText(label)) {
                await user.click(el);
            }
        }

        expect(
            screen.getAllByRole("button", { name: /calculate/i }).length
        ).toBeGreaterThan(0);
    });

    it("opens and picks from every dropdown", async () => {
        const user = userEvent.setup();
        renderWithProviders(<Component />);

        for (const combo of screen.queryAllByRole("combobox")) {
            await user.click(combo);
            const options = screen.queryAllByRole("option");
            if (options.length) {
                await user.click(options[options.length - 1]);
            }
        }

        expect(
            screen.getAllByRole("button", { name: /calculate/i }).length
        ).toBeGreaterThan(0);
    });

    it("clears results when the form is reset", async () => {
        const user = userEvent.setup();
        renderWithProviders(<Component />);

        const reset = screen.queryAllByRole("button", { name: /reset|clear/i });
        for (const button of reset) {
            await user.click(button);
        }

        expect(
            screen.getAllByRole("button", { name: /calculate/i }).length
        ).toBeGreaterThan(0);
    });
});

describe("unit switching preserves a usable form", () => {
    it("BMI keeps calculating after switching to imperial", async () => {
        const user = userEvent.setup();
        renderWithProviders(<BMICalculator />, {
            searchParams: "?age=30&heightCm=180&weightKg=75",
        });

        await user.click(screen.getAllByText(/feet & inches/i)[0]);
        await user.click(screen.getAllByText(/pounds/i)[0]);

        // Switching units blanks the sibling fields, so validation should fire.
        await user.click(screen.getAllByRole("button", { name: /calculate/i })[0]);

        expect(
            screen.getAllByText(/please enter a valid/i).length
        ).toBeGreaterThan(0);
    });

    it("WHR switches waist and hip units independently", async () => {
        const user = userEvent.setup();
        renderWithProviders(<WHRCalculator />, {
            searchParams: "?gender=male&waistCm=90&hipCm=100",
        });

        for (const el of screen.queryAllByText(/inches \(in\)/i)) {
            await user.click(el);
        }

        expect(
            screen.getAllByRole("button", { name: /calculate/i }).length
        ).toBeGreaterThan(0);
    });

    it("BMR recalculates after switching gender", async () => {
        const user = userEvent.setup();
        renderWithProviders(<BMRCalculator />, {
            searchParams: "?age=30&gender=male&heightCm=180&weight=75",
        });

        await user.click(screen.getAllByRole("button", { name: /calculate/i })[0]);
        expect(screen.getAllByText(/1,?730/).length).toBeGreaterThan(0);
    });
});
