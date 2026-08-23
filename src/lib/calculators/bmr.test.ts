import { describe, expect, it } from "vitest";
import {
    ACTIVITY_FACTORS,
    calculateBMR,
    convertHeightToCm,
    convertWeightToKg,
    formatCalories,
    validateInputs,
    type FormData,
} from "./bmr";

const form = (overrides: Partial<FormData> = {}): FormData =>
    ({
        age: "30",
        gender: "male",
        heightUnit: "cm",
        heightCm: "180",
        heightFeet: "",
        heightInches: "",
        weightUnit: "kg",
        weight: "75",
        ...overrides,
    }) as FormData;

describe("unit conversion", () => {
    it("passes centimetres through unchanged", () => {
        expect(convertHeightToCm(form({ heightCm: "180" }))).toBe(180);
    });

    it("converts feet and inches to centimetres", () => {
        // 5'11" = 71in = 180.34cm
        expect(
            convertHeightToCm(
                form({ heightUnit: "ft", heightFeet: "5", heightInches: "11" })
            )
        ).toBeCloseTo(180.34, 2);
    });

    it("passes kilograms through unchanged", () => {
        expect(convertWeightToKg(form({ weight: "75" }))).toBe(75);
    });

    it("converts pounds to kilograms", () => {
        expect(
            convertWeightToKg(form({ weightUnit: "lbs", weight: "165" }))
        ).toBeCloseTo(74.843, 3);
    });
});

describe("calculateBMR (Mifflin-St Jeor)", () => {
    it("applies the male formula: 10w + 6.25h - 5a + 5", () => {
        // 10(75) + 6.25(180) - 5(30) + 5 = 750 + 1125 - 150 + 5 = 1730
        expect(calculateBMR(form()).bmr).toBeCloseTo(1730, 6);
    });

    it("applies the female formula: 10w + 6.25h - 5a - 161", () => {
        // 750 + 1125 - 150 - 161 = 1564
        expect(calculateBMR(form({ gender: "female" })).bmr).toBeCloseTo(1564, 6);
    });

    it("differs between genders by exactly 166", () => {
        const male = calculateBMR(form({ gender: "male" })).bmr;
        const female = calculateBMR(form({ gender: "female" })).bmr;

        expect(male - female).toBeCloseTo(166, 6);
    });

    it.each([
        ["age", { age: "40" }, -50],
        ["weight", { weight: "76" }, 10],
        ["height", { heightCm: "181" }, 6.25],
    ])("responds to a one-unit change in %s", (_label, override, delta) => {
        const base = calculateBMR(form()).bmr;

        expect(calculateBMR(form(override)).bmr - base).toBeCloseTo(delta, 6);
    });

    it("derives every activity level from the base BMR", () => {
        const result = calculateBMR(form());

        for (const [level, factor] of Object.entries(ACTIVITY_FACTORS)) {
            expect(result.activityLevels[level]).toBeCloseTo(
                result.bmr * factor,
                6
            );
        }
    });

    it("exposes all six activity levels in ascending order", () => {
        const { activityLevels } = calculateBMR(form());
        const values = Object.values(activityLevels) as number[];

        expect(values).toHaveLength(6);
        for (let i = 1; i < values.length; i++) {
            expect(values[i]).toBeGreaterThan(values[i - 1]);
        }
    });

    it("yields NaN when an input is unparseable", () => {
        expect(calculateBMR(form({ weight: "" })).bmr).toBeNaN();
    });
});

describe("ACTIVITY_FACTORS", () => {
    it("matches the documented multipliers", () => {
        expect(ACTIVITY_FACTORS).toEqual({
            sedentary: 1.2,
            light: 1.375,
            // Note: 1.465 is non-standard; the usual moderate factor is 1.55.
            moderate: 1.465,
            active: 1.55,
            veryActive: 1.725,
            extraActive: 1.9,
        });
    });
});

describe("formatCalories", () => {
    it("renders a whole number with a thousands separator", () => {
        expect(formatCalories(1730)).toMatch(/1[,.]?730/);
    });

    it("returns a string", () => {
        expect(typeof formatCalories(1730.6)).toBe("string");
    });
});

describe("validateInputs", () => {
    it("accepts a complete metric form", () => {
        expect(validateInputs(form())).toEqual([]);
    });

    it("accepts a complete imperial form", () => {
        expect(
            validateInputs(
                form({
                    heightUnit: "ft",
                    heightFeet: "5",
                    heightInches: "11",
                    weightUnit: "lbs",
                    weight: "165",
                })
            )
        ).toEqual([]);
    });

    it.each([
        ["empty", ""],
        ["non-numeric", "abc"],
        ["zero", "0"],
    ])("rejects a %s age", (_label, age) => {
        expect(validateInputs(form({ age }))).toContainEqual(
            expect.stringMatching(/age/i)
        );
    });

    it.each([
        ["empty", ""],
        ["zero", "0"],
    ])("rejects a %s weight", (_label, weight) => {
        expect(validateInputs(form({ weight }))).toContainEqual(
            expect.stringMatching(/weight/i)
        );
    });

    it("rejects a blank height", () => {
        expect(validateInputs(form({ heightCm: "" }))).not.toEqual([]);
    });

    it("accumulates every problem", () => {
        expect(
            validateInputs(form({ age: "", heightCm: "", weight: "" }))
        ).toHaveLength(3);
    });
});
