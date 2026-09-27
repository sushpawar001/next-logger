import { describe, expect, it } from "vitest";
import {
    BODY_FAT_CATEGORIES,
    classifyBodyFat,
    fatAndLeanMass,
    navyBodyFat,
} from "./bodyFat";

describe("navyBodyFat", () => {
    it("matches a hand-worked male example", () => {
        // 495 / (1.0324 − 0.19077·log10(48) + 0.15456·log10(178)) − 450
        const pct = navyBodyFat({
            sex: "male",
            heightCm: 178,
            neckCm: 38,
            waistCm: 86,
        });

        expect(pct).toBeCloseTo(17.2, 1);
    });

    it("matches a hand-worked female example", () => {
        // 495 / (1.29579 − 0.35004·log10(143) + 0.221·log10(165)) − 450
        const pct = navyBodyFat({
            sex: "female",
            heightCm: 165,
            neckCm: 33,
            waistCm: 76,
            hipCm: 100,
        });

        expect(pct).toBeCloseTo(29.9, 1);
    });

    it("rises as the waist grows", () => {
        const base = { sex: "male" as const, heightCm: 180, neckCm: 39 };

        expect(navyBodyFat({ ...base, waistCm: 100 })!).toBeGreaterThan(
            navyBodyFat({ ...base, waistCm: 85 })!
        );
    });

    it("ignores the hip measurement for men", () => {
        const input = { sex: "male" as const, heightCm: 180, neckCm: 39, waistCm: 90 };

        expect(navyBodyFat({ ...input, hipCm: 120 })).toBe(navyBodyFat(input));
    });

    it("needs a hip measurement for women", () => {
        expect(
            navyBodyFat({ sex: "female", heightCm: 165, neckCm: 33, waistCm: 76 })
        ).toBeNull();
    });

    it("rejects a waist no larger than the neck", () => {
        expect(
            navyBodyFat({ sex: "male", heightCm: 180, neckCm: 40, waistCm: 40 })
        ).toBeNull();
    });

    it.each([NaN, 0, -170])("rejects height %s", (heightCm) => {
        expect(
            navyBodyFat({ sex: "male", heightCm, neckCm: 38, waistCm: 86 })
        ).toBeNull();
    });

    it("rejects results outside the equations' plausible range", () => {
        // A waist barely above the neck gives a negative percentage.
        expect(
            navyBodyFat({ sex: "male", heightCm: 200, neckCm: 40, waistCm: 45 })
        ).toBeNull();
    });
});

describe("classifyBodyFat", () => {
    it.each(["male", "female"] as const)("%s bands are contiguous", (sex) => {
        const bands = BODY_FAT_CATEGORIES[sex];

        expect(bands[0].min).toBe(0);
        for (let i = 1; i < bands.length; i++) {
            expect(bands[i].min).toBe(bands[i - 1].max);
        }
        expect(bands.at(-1)!.max).toBe(Infinity);
    });

    it.each([
        [4, "essential"],
        [10, "athletes"],
        [15, "fitness"],
        [20, "average"],
        [24.9, "average"],
        [25, "obese"],
    ] as const)("classifies a man at %s%% as %s", (pct, category) => {
        expect(classifyBodyFat(pct, "male")!.category).toBe(category);
    });

    it.each([
        [12, "essential"],
        [18, "athletes"],
        [22, "fitness"],
        [28, "average"],
        [32, "obese"],
    ] as const)("classifies a woman at %s%% as %s", (pct, category) => {
        expect(classifyBodyFat(pct, "female")!.category).toBe(category);
    });

    it("classifies on the rounded value the user sees", () => {
        expect(classifyBodyFat(13.96, "male")!.category).toBe("fitness");
    });

    it("rejects NaN", () => {
        expect(classifyBodyFat(NaN, "male")).toBeNull();
    });
});

describe("fatAndLeanMass", () => {
    it("splits body weight by the percentage", () => {
        expect(fatAndLeanMass(20, 80)).toEqual({ fatKg: 16, leanKg: 64 });
    });
});
