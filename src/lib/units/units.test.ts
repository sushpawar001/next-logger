import { describe, expect, it } from "vitest";
import {
    formatGlucosePair,
    mgdlToMmol,
    mmolToMgdl,
    roundGlucose,
    roundTo,
    toMgdl,
} from "./glucose";
import { cmToIn, inToCm, kgToLb, lbToKg } from "./body";

describe("glucose units", () => {
    // Thresholds clinicians quote in both units.
    it.each([
        [54, 3.0],
        [70, 3.9],
        [100, 5.6],
        [126, 7.0],
        [140, 7.8],
        [180, 10.0],
        [200, 11.1],
    ])("%i mg/dL is %f mmol/L", (mgdl, mmol) => {
        expect(roundGlucose(mgdlToMmol(mgdl), "mmol")).toBe(mmol);
    });

    it("round-trips between units", () => {
        expect(mgdlToMmol(mmolToMgdl(6.2))).toBeCloseTo(6.2, 10);
    });

    it("rounds exact halves up despite floating-point noise", () => {
        expect(28.7 * 6 - 46.7).toBeLessThan(125.5);
        expect(roundTo(28.7 * 6 - 46.7)).toBe(126);
        expect(roundTo(0.15, 1)).toBe(0.2);
    });

    it("rounds mg/dL to whole numbers", () => {
        expect(roundGlucose(125.6, "mgdl")).toBe(126);
    });

    it("normalises either unit to mg/dL", () => {
        expect(toMgdl(120, "mgdl")).toBe(120);
        expect(Math.round(toMgdl(7, "mmol"))).toBe(126);
    });

    it("formats a reading in both units", () => {
        expect(formatGlucosePair(126)).toEqual({ mgdl: 126, mmol: 7.0 });
    });
});

describe("body units", () => {
    it("converts inches and centimetres exactly", () => {
        expect(inToCm(10)).toBeCloseTo(25.4, 10);
        expect(cmToIn(inToCm(33))).toBeCloseTo(33, 10);
    });

    it("converts pounds and kilograms exactly", () => {
        expect(lbToKg(100)).toBeCloseTo(45.359237, 10);
        expect(kgToLb(lbToKg(180))).toBeCloseTo(180, 10);
    });
});
