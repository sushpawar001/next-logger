import { describe, expect, it } from "vitest";
import { parseDateInput, weightLossProgress, type WeightLossInput } from "./weightLoss";

const TODAY = new Date(2026, 8, 27);
const input = (overrides: Partial<WeightLossInput> = {}): WeightLossInput => ({
    start: 100,
    current: 92,
    goal: NaN,
    startDate: null,
    today: TODAY,
    ...overrides,
});

describe("parseDateInput", () => {
    it("reads a date input value as a local date", () => {
        const date = parseDateInput("2026-07-05")!;

        expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 6, 5]);
    });

    it.each(["", "05/07/2026", "2026-7-5"])("rejects %s", (value) => {
        expect(parseDateInput(value)).toBeNull();
    });
});

describe("weightLossProgress", () => {
    it("reports the amount and percentage lost", () => {
        const result = weightLossProgress(input())!;

        expect(result.change).toBe(8);
        expect(result.percentLost).toBe(8);
    });

    it("reports a gain as a negative change", () => {
        const result = weightLossProgress(input({ current: 104 }))!;

        expect(result.change).toBe(-4);
        expect(result.percentLost).toBe(-4);
    });

    it("tracks progress towards a goal", () => {
        const result = weightLossProgress(input({ goal: 80 }))!;

        expect(result.goalProgress).toBe(40);
        expect(result.remaining).toBe(12);
    });

    it("ignores a goal that is not below the start weight", () => {
        const result = weightLossProgress(input({ goal: 110 }))!;

        expect(result.goalProgress).toBeNull();
        expect(result.remaining).toBeNull();
    });

    it("works out a weekly rate and a projected goal date", () => {
        // 8 weeks before TODAY, 8 kg lost → 1 kg a week; 12 kg left → 12 weeks.
        const result = weightLossProgress(
            input({ goal: 80, startDate: new Date(2026, 7, 2) })
        )!;

        expect(result.weeks).toBeCloseTo(8, 1);
        expect(result.weeklyRate).toBeCloseTo(1, 1);
        const days = (result.projectedGoalDate!.getTime() - TODAY.getTime()) / 86400000;
        expect(days).toBeCloseTo(84, 0);
    });

    it("gives no rate for less than a week of data", () => {
        const result = weightLossProgress(input({ startDate: new Date(2026, 8, 24) }))!;

        expect(result.weeklyRate).toBeNull();
    });

    it("gives no projection while weight is not going down", () => {
        const result = weightLossProgress(
            input({ current: 101, goal: 80, startDate: new Date(2026, 7, 2) })
        )!;

        expect(result.projectedGoalDate).toBeNull();
    });

    it("marks the 5% and 10% milestones", () => {
        const result = weightLossProgress(input())!;

        expect(result.milestones).toEqual([
            { percent: 5, weight: 95, reached: true },
            { percent: 10, weight: 90, reached: false },
        ]);
    });

    it.each([
        [0, 92],
        [100, 0],
        [NaN, 92],
    ])("rejects start %s and current %s", (start, current) => {
        expect(weightLossProgress(input({ start, current }))).toBeNull();
    });
});
