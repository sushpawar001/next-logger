import { describe, expect, it } from "vitest";
import { glucoseStatus, timeInRange } from "./glucoseStatus";

describe("glucoseStatus", () => {
    it.each([
        [69, "low"],
        [70, "in"],
        [126, "in"],
        [180, "in"],
        [181, "high"],
    ])("classifies %s mg/dL as %s", (value, status) => {
        expect(glucoseStatus(value)).toBe(status);
    });
});

describe("timeInRange", () => {
    it("is all zero with no readings", () => {
        expect(timeInRange([])).toEqual({ low: 0, in: 0, high: 0 });
    });

    it("splits readings into percentages", () => {
        expect(timeInRange([60, 100, 120, 200])).toEqual({
            low: 25,
            in: 50,
            high: 25,
        });
    });

    it("always sums to 100 after rounding", () => {
        const split = timeInRange([60, 100, 200]);

        expect(split.low + split.in + split.high).toBe(100);
    });
});
