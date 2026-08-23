import { describe, expect, it } from "vitest";
import getMovingAvgInterval from "./getMovingAvgInterval";

describe("getMovingAvgInterval", () => {
    it.each([
        [1, 1],
        [7, 1],
        [8, 7],
        [14, 7],
        [30, 7],
        [31, 30],
        [90, 30],
        [365, 30],
        [36500, 30],
    ])("maps %i days of data to a %i-day window", (days, expected) => {
        expect(getMovingAvgInterval(days)).toBe(expected);
    });

    it("treats the 7 and 30 day boundaries as inclusive", () => {
        expect(getMovingAvgInterval(7)).toBe(1);
        expect(getMovingAvgInterval(7.1)).toBe(7);
        expect(getMovingAvgInterval(30)).toBe(7);
        expect(getMovingAvgInterval(30.1)).toBe(30);
    });

    it("returns the shortest window for zero or negative input", () => {
        expect(getMovingAvgInterval(0)).toBe(1);
        expect(getMovingAvgInterval(-5)).toBe(1);
    });
});
