import { describe, expect, it } from "vitest";
import {
    getDailyInsulinValues,
    getHba1cValue,
    simpleMovingAverage,
} from "./statsHelpers";
import type { insulin } from "@/types/models";

const dose = (createdAt: string, units: number): insulin =>
    ({ createdAt: new Date(createdAt), units, name: "Lantus" }) as insulin;

describe("getDailyInsulinValues", () => {
    it("sums doses that fall on the same calendar day", () => {
        const values = getDailyInsulinValues([
            dose("2026-01-30T08:00:00", 10),
            dose("2026-01-30T21:00:00", 12),
            dose("2026-01-31T08:00:00", 8),
        ]);

        expect(values).toEqual([22, 8]);
    });

    it("keeps one bucket per day, in first-seen order", () => {
        const values = getDailyInsulinValues([
            dose("2026-01-31T08:00:00", 5),
            dose("2026-01-30T08:00:00", 7),
            dose("2026-01-31T20:00:00", 3),
        ]);

        expect(values).toEqual([8, 7]);
    });

    it("returns an empty array for no doses", () => {
        expect(getDailyInsulinValues([])).toEqual([]);
    });

    it("handles a single dose", () => {
        expect(getDailyInsulinValues([dose("2026-01-30T08:00:00", 14)])).toEqual([
            14,
        ]);
    });
});

describe("simpleMovingAverage", () => {
    it("averages the single full window and pads the rest", () => {
        // One window fits, then the result is left-padded back to input length
        expect(simpleMovingAverage([1, 2, 3, 4, 5], 5)).toEqual([
            null,
            null,
            null,
            null,
            3,
        ]);
    });

    it("left-pads with null so the result matches the input length", () => {
        const result = simpleMovingAverage([1, 2, 3, 4], 2);

        expect(result).toHaveLength(4);
        expect(result[0]).toBeNull();
        expect(result.slice(1)).toEqual([1.5, 2.5, 3.5]);
    });

    it("returns the input unchanged for a period of 1", () => {
        expect(simpleMovingAverage([4, 8, 15], 1)).toEqual([4, 8, 15]);
    });

    it("pads entirely with null when the period exceeds the input length", () => {
        const result = simpleMovingAverage([1, 2], 5);

        expect(result).toHaveLength(2);
        expect(result).toEqual([null, null]);
    });

    it("returns an empty array for empty input", () => {
        expect(simpleMovingAverage([], 3)).toEqual([]);
    });
});

describe("getHba1cValue", () => {
    it.each([
        [100, 5],
        [126, 6],
        [154, 7],
        [183, 8],
    ])("converts an average glucose of %i to %i", (glucose, expected) => {
        expect(getHba1cValue(glucose)).toBe(expected);
    });

    it("rounds to a whole number", () => {
        expect(Number.isInteger(getHba1cValue(137))).toBe(true);
    });
});
