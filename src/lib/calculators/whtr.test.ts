import { describe, expect, it } from "vitest";
import { classifyWhtr, healthyWaistLimit, waistToHeight, WHTR_BANDS } from "./whtr";

describe("waistToHeight", () => {
    it("divides waist by height", () => {
        expect(waistToHeight(85, 170)).toBe(0.5);
    });

    it("works in any unit as long as both match", () => {
        expect(waistToHeight(34, 68)).toBe(waistToHeight(86.36, 172.72));
    });

    it.each([
        [0, 170],
        [85, 0],
        [NaN, 170],
        [300, 170],
        [10, 170],
    ])("rejects waist %s with height %s", (waist, height) => {
        expect(waistToHeight(waist, height)).toBeNull();
    });
});

describe("classifyWhtr", () => {
    it("has contiguous bands", () => {
        for (let i = 1; i < WHTR_BANDS.length; i++) {
            expect(WHTR_BANDS[i].min).toBe(WHTR_BANDS[i - 1].max);
        }
    });

    it.each([
        [0.35, "low"],
        [0.4, "healthy"],
        [0.49, "healthy"],
        [0.5, "increased"],
        [0.59, "increased"],
        [0.6, "high"],
        [0.75, "high"],
    ] as const)("classifies %s as %s", (ratio, category) => {
        expect(classifyWhtr(ratio)!.category).toBe(category);
    });

    it("classifies on the rounded value the user sees", () => {
        expect(classifyWhtr(0.4996)!.category).toBe("increased");
    });

    it("rejects NaN", () => {
        expect(classifyWhtr(NaN)).toBeNull();
    });
});

describe("healthyWaistLimit", () => {
    it("is half your height", () => {
        expect(healthyWaistLimit(176)).toBe(88);
    });
});
