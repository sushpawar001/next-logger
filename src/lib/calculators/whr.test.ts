import { describe, expect, it } from "vitest";
import {
    calculateWHR,
    getHipInCm,
    getWaistInCm,
    getWHRClassification,
    validateInputs,
    type FormData,
} from "./whr";

const form = (overrides: Partial<FormData> = {}): FormData =>
    ({
        gender: "male",
        waistUnit: "cm",
        waistCm: "90",
        waistIn: "",
        hipUnit: "cm",
        hipCm: "100",
        hipIn: "",
        ...overrides,
    }) as FormData;

describe("unit conversion", () => {
    it("passes centimetres through unchanged", () => {
        expect(getWaistInCm(form({ waistCm: "90" }))).toBe(90);
        expect(getHipInCm(form({ hipCm: "100" }))).toBe(100);
    });

    it("converts inches to centimetres", () => {
        expect(getWaistInCm(form({ waistUnit: "in", waistIn: "10" }))).toBeCloseTo(
            25.4,
            10
        );
        expect(getHipInCm(form({ hipUnit: "in", hipIn: "10" }))).toBeCloseTo(
            25.4,
            10
        );
    });

    it("yields NaN for a non-numeric measurement", () => {
        expect(getWaistInCm(form({ waistCm: "" }))).toBeNaN();
    });
});

describe("calculateWHR", () => {
    it("divides waist by hip", () => {
        expect(calculateWHR(90, 100)).toBe(0.9);
    });

    it("is unit-agnostic as long as both sides match", () => {
        expect(calculateWHR(25.4, 50.8)).toBe(calculateWHR(10, 20));
    });

    it("returns Infinity for a zero hip measurement", () => {
        expect(calculateWHR(90, 0)).toBe(Infinity);
    });
});

describe("getWHRClassification (male)", () => {
    it.each([
        [0, "Low Risk"],
        [0.5, "Low Risk"],
        [0.89, "Low Risk"],
        [0.9, "Moderate Risk"],
        [0.95, "Moderate Risk"],
        [0.98, "Moderate Risk"],
        [1.0, "High Risk"],
        [1.5, "High Risk"],
    ])("classifies %f as %s", (whr, expected) => {
        expect(getWHRClassification(whr, "male").classification).toBe(expected);
    });

    it("treats range boundaries as half-open [min, max)", () => {
        expect(getWHRClassification(0.9, "male").category).toBe("moderate");
        expect(getWHRClassification(0.8999, "male").category).toBe("low");
    });

    /**
     * KNOWN BUG (docs/BUGS.md #22): male `moderate` ends at 0.99 but `high` starts at
     * 1.0, so 0.99 <= whr < 1.0 matches no range and falls through to the
     * `high` fallback. The table's intent is clearly Moderate up to 1.0, so
     * these values are over-reported as High Risk.
     * Characterizing current behavior.
     */
    it.each([0.99, 0.995, 0.9999])(
        "reports %f as High Risk because it falls in the range gap",
        (whr) => {
            const result = getWHRClassification(whr, "male");

            expect(result.classification).toBe("High Risk");
            expect(result.category).toBe("high");
        }
    );

    it("echoes the input ratio and a risk level back", () => {
        const result = getWHRClassification(0.85, "male");

        expect(result.whr).toBe(0.85);
        expect(result.riskLevel).toBe("Low cardiovascular risk");
    });
});

describe("getWHRClassification (female)", () => {
    it.each([
        [0, "Low Risk"],
        [0.79, "Low Risk"],
        [0.8, "Moderate Risk"],
        [0.83, "Moderate Risk"],
        [0.85, "High Risk"],
        [1.2, "High Risk"],
    ])("classifies %f as %s", (whr, expected) => {
        expect(getWHRClassification(whr, "female").classification).toBe(expected);
    });

    // KNOWN BUG (docs/BUGS.md #22): the same gap exists at [0.84, 0.85).
    it.each([0.84, 0.845])(
        "reports %f as High Risk because it falls in the range gap",
        (whr) => {
            expect(getWHRClassification(whr, "female").category).toBe("high");
        }
    );

    it("uses lower thresholds than the male table", () => {
        expect(getWHRClassification(0.85, "female").category).toBe("high");
        expect(getWHRClassification(0.85, "male").category).toBe("low");
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
                    waistUnit: "in",
                    waistIn: "35",
                    hipUnit: "in",
                    hipIn: "40",
                })
            )
        ).toEqual([]);
    });

    it.each([
        ["empty", ""],
        ["non-numeric", "abc"],
        ["zero", "0"],
        ["negative", "-5"],
    ])("rejects a %s waist measurement", (_label, waistCm) => {
        expect(validateInputs(form({ waistCm }))).toContainEqual(
            expect.stringMatching(/waist/i)
        );
    });

    it.each([
        ["empty", ""],
        ["non-numeric", "abc"],
        ["zero", "0"],
    ])("rejects a %s hip measurement", (_label, hipCm) => {
        expect(validateInputs(form({ hipCm }))).toContainEqual(
            expect.stringMatching(/hip/i)
        );
    });

    it("reports both problems at once", () => {
        expect(validateInputs(form({ waistCm: "", hipCm: "" }))).toHaveLength(2);
    });

    it("validates the imperial fields when the unit is inches", () => {
        // The metric fields are blank but irrelevant in imperial mode
        expect(
            validateInputs(
                form({ waistUnit: "in", waistIn: "", hipUnit: "in", hipIn: "40" })
            )
        ).toHaveLength(1);
    });
});
