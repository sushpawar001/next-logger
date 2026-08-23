import { describe, expect, it } from "vitest";
import {
    calculateBMI,
    getBMIClassification,
    getHeightInMeters,
    getWeightInKg,
    validateInputs,
    type FormData,
} from "./bmi";

const form = (overrides: Partial<FormData> = {}): FormData =>
    ({
        age: "30",
        gender: "male",
        heightUnit: "cm",
        heightCm: "180",
        heightFeet: "",
        heightInches: "",
        weightUnit: "kg",
        weightKg: "75",
        weightLbs: "",
        ...overrides,
    }) as FormData;

describe("getHeightInMeters", () => {
    it("converts centimetres to metres", () => {
        expect(getHeightInMeters(form({ heightCm: "180" }))).toBe(1.8);
    });

    it("converts feet and inches to metres", () => {
        // 5'11" = 71in = 1.8034m
        expect(
            getHeightInMeters(
                form({ heightUnit: "ft", heightFeet: "5", heightInches: "11" })
            )
        ).toBeCloseTo(1.8034, 4);
    });

    it("handles a whole number of feet", () => {
        expect(
            getHeightInMeters(
                form({ heightUnit: "ft", heightFeet: "6", heightInches: "0" })
            )
        ).toBeCloseTo(1.8288, 4);
    });

    it("yields NaN for a blank height", () => {
        expect(getHeightInMeters(form({ heightCm: "" }))).toBeNaN();
    });
});

describe("getWeightInKg", () => {
    it("passes kilograms through unchanged", () => {
        expect(getWeightInKg(form({ weightKg: "75" }))).toBe(75);
    });

    it("converts pounds to kilograms", () => {
        expect(
            getWeightInKg(form({ weightUnit: "lbs", weightLbs: "165" }))
        ).toBeCloseTo(74.843, 3);
    });

    it("yields NaN for a blank weight", () => {
        expect(getWeightInKg(form({ weightKg: "" }))).toBeNaN();
    });
});

describe("calculateBMI", () => {
    it("divides weight by height squared", () => {
        expect(calculateBMI(75, 1.8)).toBeCloseTo(23.148, 3);
    });

    it.each([
        [50, 1.8, 15.432],
        [75, 1.8, 23.148],
        [100, 1.8, 30.864],
        [60, 1.6, 23.437],
    ])("computes BMI for %ikg at %fm", (kg, m, expected) => {
        expect(calculateBMI(kg, m)).toBeCloseTo(expected, 3);
    });

    it("returns Infinity for zero height", () => {
        expect(calculateBMI(75, 0)).toBe(Infinity);
    });
});

describe("getBMIClassification", () => {
    it.each([
        [15, "Underweight", "underweight"],
        [18.4, "Underweight", "underweight"],
        [18.5, "Normal", "normal"],
        [22, "Normal", "normal"],
        [24.9, "Normal", "normal"],
        [25, "Overweight", "overweight"],
        [29.9, "Overweight", "overweight"],
        [30, "Obesity", "obesity"],
        [45, "Obesity", "obesity"],
    ])("classifies %f as %s", (bmi, label, category) => {
        const result = getBMIClassification(bmi);

        expect(result.classification).toBe(label);
        expect(result.category).toBe(category);
        expect(result.bmi).toBe(bmi);
    });

    it("treats boundaries as half-open [min, max)", () => {
        expect(getBMIClassification(18.5).category).toBe("normal");
        expect(getBMIClassification(18.4999).category).toBe("underweight");
        expect(getBMIClassification(25).category).toBe("overweight");
        expect(getBMIClassification(30).category).toBe("obesity");
    });

    it("classifies an extremely high BMI as obesity", () => {
        expect(getBMIClassification(1000).category).toBe("obesity");
    });

    /**
     * KNOWN BUG (docs/BUGS.md #23): the underweight band starts at min 0, so any
     * negative or NaN BMI matches no range and hits the `obesity` fallback --
     * a nonsensical input is reported as the most severe category rather than
     * as an error. Characterizing current behavior.
     */
    it.each([
        ["a negative BMI", -5],
        ["NaN", NaN],
    ])("reports %s as obesity via the fallback", (_label, bmi) => {
        expect(getBMIClassification(bmi).category).toBe("obesity");
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
                    weightLbs: "165",
                })
            )
        ).toEqual([]);
    });

    it.each([
        ["empty", ""],
        ["non-numeric", "abc"],
        ["zero", "0"],
        ["negative", "-1"],
    ])("rejects a %s age", (_label, age) => {
        expect(validateInputs(form({ age }))).toContainEqual(
            expect.stringMatching(/age/i)
        );
    });

    it.each([
        ["empty", ""],
        ["zero", "0"],
    ])("rejects a %s height in cm", (_label, heightCm) => {
        expect(validateInputs(form({ heightCm }))).toContainEqual(
            expect.stringMatching(/centimet/i)
        );
    });

    it("rejects inches outside 0-11", () => {
        const base = { heightUnit: "ft" as const, heightFeet: "5" };

        expect(
            validateInputs(form({ ...base, heightInches: "12" }))
        ).toContainEqual(expect.stringMatching(/inches/i));
        expect(
            validateInputs(form({ ...base, heightInches: "-1" }))
        ).toContainEqual(expect.stringMatching(/inches/i));
    });

    // "0" is a truthy string, so a whole number of feet validates cleanly.
    it('accepts "0" inches for a whole number of feet', () => {
        expect(
            validateInputs(
                form({ heightUnit: "ft", heightFeet: "6", heightInches: "0" })
            )
        ).toEqual([]);
    });

    it.each([
        ["empty", ""],
        ["zero", "0"],
    ])("rejects a %s weight in kg", (_label, weightKg) => {
        expect(validateInputs(form({ weightKg }))).toContainEqual(
            expect.stringMatching(/kilogram/i)
        );
    });

    it("rejects a blank weight in pounds", () => {
        expect(
            validateInputs(form({ weightUnit: "lbs", weightLbs: "" }))
        ).toContainEqual(expect.stringMatching(/pounds/i));
    });

    it("accumulates every problem", () => {
        expect(
            validateInputs(form({ age: "", heightCm: "", weightKg: "" }))
        ).toHaveLength(3);
    });
});
