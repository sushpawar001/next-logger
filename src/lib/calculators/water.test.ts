import { describe, expect, it } from "vitest";
import {
    ACTIVITY_LEVELS,
    calculateWaterIntake,
    cmToInches,
    formatWaterIntake,
    getHeightInCm,
    getWeightInKg,
    inchesToCm,
    kgToLbs,
    lbsToKg,
    validateInputs,
    type FormData,
} from "./water";

const form = (overrides: Partial<FormData> = {}): FormData =>
    ({
        age: "30",
        gender: "male",
        weightUnit: "kg",
        weight: "70",
        heightUnit: "cm",
        heightCm: "170",
        heightFeet: "",
        heightInches: "",
        activityLevel: "sedentary",
        ...overrides,
    }) as FormData;

describe("unit conversion", () => {
    it("round-trips kilograms and pounds", () => {
        expect(lbsToKg(kgToLbs(70))).toBeCloseTo(70, 10);
    });

    it("round-trips centimetres and inches", () => {
        expect(inchesToCm(cmToInches(170))).toBeCloseTo(170, 10);
    });

    it.each([
        [1, 2.20462],
        [70, 154.3234],
    ])("converts %ikg to %f lbs", (kg, lbs) => {
        expect(kgToLbs(kg)).toBeCloseTo(lbs, 4);
    });

    it("converts 2.54cm to 1 inch", () => {
        expect(cmToInches(2.54)).toBeCloseTo(1, 10);
    });

    it("reads weight in the selected unit", () => {
        expect(getWeightInKg(form({ weight: "70" }))).toBe(70);
        expect(
            getWeightInKg(form({ weightUnit: "lbs", weight: "154.3234" }))
        ).toBeCloseTo(70, 4);
    });

    it("reads height in the selected unit", () => {
        expect(getHeightInCm(form({ heightCm: "170" }))).toBe(170);
        expect(
            getHeightInCm(
                form({ heightUnit: "ft", heightFeet: "5", heightInches: "7" })
            )
        ).toBeCloseTo(170.18, 2);
    });
});

describe("calculateWaterIntake", () => {
    /**
     * Baseline: 70kg male, age 30, 170cm, sedentary.
     * multiplier = 32 (base) + 1 (male) = 33
     * heightAdjustment = max(0, (170-170)/10) * 0.1 = 0
     * base = (70 * 33 / 1000) * 1 = 2.31 L, activity adjustment 0
     */
    it("computes the documented baseline", () => {
        const result = calculateWaterIntake(form());

        expect(result.baseIntake).toBeCloseTo(2.31, 10);
        expect(result.activityAdjustment).toBe(0);
        expect(result.totalIntake).toBeCloseTo(2.31, 10);
    });

    it("adds 1 ml/kg for men", () => {
        const male = calculateWaterIntake(form({ gender: "male" }));
        const female = calculateWaterIntake(form({ gender: "female" }));

        // 70kg * 1 ml = 70ml = 0.07 L
        expect(male.baseIntake - female.baseIntake).toBeCloseTo(0.07, 10);
    });

    it("adds 2 ml/kg for under-18s", () => {
        const young = calculateWaterIntake(form({ age: "17" }));
        const adult = calculateWaterIntake(form({ age: "18" }));

        expect(young.baseIntake - adult.baseIntake).toBeCloseTo(0.14, 10);
    });

    it("subtracts 2 ml/kg for over-65s", () => {
        const older = calculateWaterIntake(form({ age: "66" }));
        const adult = calculateWaterIntake(form({ age: "65" }));

        expect(adult.baseIntake - older.baseIntake).toBeCloseTo(0.14, 10);
    });

    it("treats 18 and 65 as ordinary adult ages", () => {
        const base = calculateWaterIntake(form({ age: "30" })).baseIntake;

        expect(calculateWaterIntake(form({ age: "18" })).baseIntake).toBeCloseTo(
            base,
            10
        );
        expect(calculateWaterIntake(form({ age: "65" })).baseIntake).toBeCloseTo(
            base,
            10
        );
    });

    it("scales up with height above 170cm", () => {
        // 180cm -> heightAdjustment = (180-170)/10 * 0.1 = 0.1 -> +10%
        const result = calculateWaterIntake(form({ heightCm: "180" }));

        expect(result.baseIntake).toBeCloseTo(2.31 * 1.1, 10);
    });

    it("does not scale down below 170cm", () => {
        const short = calculateWaterIntake(form({ heightCm: "150" }));
        const baseline = calculateWaterIntake(form({ heightCm: "170" }));

        expect(short.baseIntake).toBeCloseTo(baseline.baseIntake, 10);
    });

    it.each(Object.keys(ACTIVITY_LEVELS))(
        "adds the %s activity adjustment",
        (level) => {
            const result = calculateWaterIntake(
                form({ activityLevel: level as any })
            );

            expect(result.activityAdjustment).toBe(
                ACTIVITY_LEVELS[level].adjustment
            );
            expect(result.totalIntake).toBeCloseTo(
                result.baseIntake + result.activityAdjustment,
                10
            );
        }
    );

    it("exposes ounces and cups derived from litres", () => {
        const result = calculateWaterIntake(form());

        expect(result.totalIntakeOz).toBeCloseTo(result.totalIntake * 33.814, 10);
        expect(result.totalIntakeCups).toBeCloseTo(result.totalIntakeOz / 8, 10);
    });

    it("scales linearly with body weight", () => {
        const light = calculateWaterIntake(form({ weight: "50" }));
        const heavy = calculateWaterIntake(form({ weight: "100" }));

        expect(heavy.baseIntake / light.baseIntake).toBeCloseTo(2, 10);
    });

    it("yields NaN when the weight is unparseable", () => {
        expect(calculateWaterIntake(form({ weight: "" })).totalIntake).toBeNaN();
    });
});

describe("ACTIVITY_LEVELS", () => {
    it("increases the adjustment with intensity", () => {
        const adjustments = Object.values(ACTIVITY_LEVELS).map(
            (l: any) => l.adjustment
        );

        expect(adjustments).toEqual([0, 0.5, 1.0, 1.5, 2.0]);
    });

    it("gives every level a label and description", () => {
        for (const level of Object.values(ACTIVITY_LEVELS) as any[]) {
            expect(level.label).toBeTruthy();
            expect(level.description).toBeTruthy();
        }
    });
});

describe("formatWaterIntake", () => {
    it("returns a string for a whole number of litres", () => {
        expect(typeof formatWaterIntake(2)).toBe("string");
    });

    it("includes the numeric value", () => {
        expect(formatWaterIntake(2.31)).toMatch(/2\.3|2310|2,310/);
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
                    weightUnit: "lbs",
                    weight: "154",
                    heightUnit: "ft",
                    heightFeet: "5",
                    heightInches: "7",
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
            validateInputs(form({ age: "", weight: "", heightCm: "" }))
        ).toHaveLength(3);
    });
});
