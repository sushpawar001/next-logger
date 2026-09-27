import { describe, expect, it } from "vitest";
import {
    bolusDose,
    carbRatio,
    correctionFactor,
    type BolusInput,
} from "./insulinDosing";

describe("correctionFactor", () => {
    it("uses the 1800 rule for rapid-acting insulin", () => {
        expect(correctionFactor(40, "rapid")!.mgdl).toBe(45);
    });

    it("uses the 1500 rule for regular insulin", () => {
        expect(correctionFactor(50, "regular")!.mgdl).toBe(30);
    });

    it("gives about the 100 rule in mmol/L", () => {
        // Whittington Health's worked example: 32 units a day → about 3 mmol/L.
        expect(correctionFactor(32, "rapid")!.mmol).toBeCloseTo(100 / 32, 1);
    });

    it.each([0, 1, 301, NaN])("rejects a total daily dose of %s", (tdd) => {
        expect(correctionFactor(tdd, "rapid")).toBeNull();
    });
});

describe("carbRatio", () => {
    it("uses the 500 rule for rapid-acting insulin", () => {
        expect(carbRatio(50, "rapid")!.grams).toBe(10);
    });

    it("uses the 450 rule for regular insulin", () => {
        expect(carbRatio(45, "regular")!.grams).toBe(10);
    });

    it("rejects an implausible total daily dose", () => {
        expect(carbRatio(-5, "rapid")).toBeNull();
    });
});

const bolus = (overrides: Partial<BolusInput> = {}): BolusInput => ({
    carbs: 60,
    carbRatio: 10,
    glucose: 200,
    target: 120,
    sensitivity: 40,
    onBoard: 0,
    unit: "mgdl",
    ...overrides,
});

describe("bolusDose", () => {
    it("adds a meal dose and a correction dose", () => {
        expect(bolusDose(bolus())).toEqual({
            status: "ok",
            meal: 6,
            correction: 2,
            onBoardUsed: 0,
            total: 8,
        });
    });

    it("lets insulin on board offset the correction only", () => {
        const result = bolusDose(bolus({ onBoard: 5 }));

        expect(result).toMatchObject({ onBoardUsed: 2, total: 6 });
    });

    it("reduces the dose when glucose is below target", () => {
        const result = bolusDose(bolus({ glucose: 100 }));

        expect(result).toMatchObject({ correction: -0.5, total: 5.5 });
    });

    it("never goes below zero", () => {
        const result = bolusDose(bolus({ carbs: 0, glucose: 90 }));

        expect(result).toMatchObject({ total: 0 });
    });

    it("refuses to dose for a low reading", () => {
        expect(bolusDose(bolus({ glucose: 65 }))).toEqual({ status: "low" });
        expect(bolusDose(bolus({ glucose: 3.5, target: 6, sensitivity: 2.5, unit: "mmol" }))).toEqual({
            status: "low",
        });
    });

    it("works in mmol/L", () => {
        const result = bolusDose(
            bolus({ glucose: 11, target: 6, sensitivity: 2.5, unit: "mmol" })
        );

        expect(result).toMatchObject({ meal: 6, correction: 2, total: 8 });
    });

    it.each([
        { carbRatio: 0 },
        { sensitivity: -1 },
        { glucose: NaN },
        { carbs: -10 },
        { onBoard: -1 },
    ])("rejects invalid input %o", (overrides) => {
        expect(bolusDose(bolus(overrides))).toBeNull();
    });
});
