import { describe, expect, it } from "vitest";
import {
    calculateIBW,
    formatWeight,
    getHeightInInches,
    validateInputs,
    type FormData,
} from "./idealWeight";

const form = (overrides: Partial<FormData> = {}): FormData =>
    ({
        age: "30",
        gender: "male",
        heightUnit: "cm",
        heightCm: "180",
        heightFeet: "",
        heightInches: "",
        ...overrides,
    }) as FormData;

describe("getHeightInInches", () => {
    it("converts centimetres to inches", () => {
        expect(getHeightInInches(form({ heightCm: "180" }))).toBeCloseTo(
            70.866,
            3
        );
    });

    it("adds feet and inches", () => {
        expect(
            getHeightInInches(
                form({ heightUnit: "ft", heightFeet: "5", heightInches: "11" })
            )
        ).toBe(71);
    });

    it("yields NaN for a blank height", () => {
        expect(getHeightInInches(form({ heightCm: "" }))).toBeNaN();
    });
});

describe("calculateIBW", () => {
    // At exactly 5 feet, every formula returns its own base constant.
    it("returns the base constants for a 60-inch male", () => {
        expect(calculateIBW(60, "male")).toEqual({
            robinson: 52,
            miller: 56.2,
            devine: 50,
            hamwi: 48,
        });
    });

    it("returns the base constants for a 60-inch female", () => {
        expect(calculateIBW(60, "female")).toEqual({
            robinson: 49,
            miller: 53.1,
            devine: 45.5,
            hamwi: 45.5,
        });
    });

    it("applies the male per-inch coefficients above 5 feet", () => {
        // 71in -> 11 inches over 5 feet
        const result = calculateIBW(71, "male");

        expect(result.robinson).toBeCloseTo(52 + 1.9 * 11, 6);
        expect(result.miller).toBeCloseTo(56.2 + 1.41 * 11, 6);
        expect(result.devine).toBeCloseTo(50 + 2.3 * 11, 6);
        expect(result.hamwi).toBeCloseTo(48 + 2.7 * 11, 6);
    });

    it("applies the female per-inch coefficients above 5 feet", () => {
        const result = calculateIBW(71, "female");

        expect(result.robinson).toBeCloseTo(49 + 1.7 * 11, 6);
        expect(result.miller).toBeCloseTo(53.1 + 1.36 * 11, 6);
        expect(result.devine).toBeCloseTo(45.5 + 2.2 * 11, 6);
        expect(result.hamwi).toBeCloseTo(45.5 + 2.2 * 11, 6);
    });

    /**
     * KNOWN BUG (docs/BUGS.md #24): the female Devine and Hamwi formulas are
     * identical (45.5 + 2.2/inch). The published Hamwi female formula is
     * 45.5 + 2.2/inch and Devine female is 45.5 + 2.3/inch, so `devine` is
     * understated for women. The male pair differ as expected.
     * Characterizing current behavior.
     */
    it("returns identical female Devine and Hamwi values", () => {
        const female = calculateIBW(71, "female");
        const male = calculateIBW(71, "male");

        expect(female.devine).toBe(female.hamwi);
        expect(male.devine).not.toBe(male.hamwi);
    });

    it("clamps heights below 5 feet to the base constants", () => {
        expect(calculateIBW(50, "male")).toEqual(calculateIBW(60, "male"));
        expect(calculateIBW(0, "female")).toEqual(calculateIBW(60, "female"));
    });

    it("gives men a higher ideal weight than women at the same height", () => {
        const male = calculateIBW(71, "male");
        const female = calculateIBW(71, "female");

        for (const key of ["robinson", "miller", "devine", "hamwi"] as const) {
            expect(male[key]).toBeGreaterThan(female[key]);
        }
    });

    it("increases monotonically with height", () => {
        const shorter = calculateIBW(65, "male");
        const taller = calculateIBW(75, "male");

        for (const key of ["robinson", "miller", "devine", "hamwi"] as const) {
            expect(taller[key]).toBeGreaterThan(shorter[key]);
        }
    });

    it("propagates NaN from an unparseable height", () => {
        expect(calculateIBW(NaN, "male").devine).toBeNaN();
    });
});

describe("formatWeight", () => {
    it("renders one decimal place with a kg suffix", () => {
        expect(formatWeight(72.456)).toBe("72.5 kg");
    });

    it("keeps a trailing zero", () => {
        expect(formatWeight(72)).toBe("72.0 kg");
    });
});

describe("validateInputs", () => {
    it("accepts a complete metric form", () => {
        expect(validateInputs(form())).toEqual([]);
    });

    it("accepts a complete imperial form", () => {
        expect(
            validateInputs(
                form({ heightUnit: "ft", heightFeet: "5", heightInches: "11" })
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

    it("rejects a blank height in cm", () => {
        expect(validateInputs(form({ heightCm: "" }))).toContainEqual(
            expect.stringMatching(/centimet/i)
        );
    });

    it("rejects inches of 12 or more", () => {
        expect(
            validateInputs(
                form({ heightUnit: "ft", heightFeet: "5", heightInches: "12" })
            )
        ).toContainEqual(expect.stringMatching(/inches/i));
    });

    it("accumulates every problem", () => {
        expect(validateInputs(form({ age: "", heightCm: "" }))).toHaveLength(2);
    });
});
