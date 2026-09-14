import { afterEach, describe, expect, it, vi } from "vitest";
import { ALL_DAYS, filterByPeriod } from "./filterByPeriod";

const NOW = new Date("2026-09-14T12:00:00.000Z");
const daysAgo = (n: number) =>
    new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

afterEach(() => {
    vi.useRealTimers();
});

describe("filterByPeriod", () => {
    it("keeps only rows within the window", () => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW);

        const rows = [
            { createdAt: daysAgo(1) },
            { createdAt: daysAgo(6) },
            { createdAt: daysAgo(20) },
        ];

        expect(filterByPeriod(rows, 7)).toEqual([
            { createdAt: daysAgo(1) },
            { createdAt: daysAgo(6) },
        ]);
    });

    it("returns every row for the All option", () => {
        const rows = [{ createdAt: daysAgo(1) }, { createdAt: daysAgo(9999) }];
        expect(filterByPeriod(rows, ALL_DAYS)).toBe(rows);
    });

    it("returns every row when days is 0 or falsy", () => {
        const rows = [{ createdAt: daysAgo(500) }];
        expect(filterByPeriod(rows, 0)).toBe(rows);
    });

    it("drops rows with no createdAt when a window is set", () => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW);

        const rows = [{ createdAt: daysAgo(1) }, {} as any];
        expect(filterByPeriod(rows, 7)).toEqual([{ createdAt: daysAgo(1) }]);
    });

    it("preserves the incoming (descending) order", () => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW);

        const rows = [
            { id: "a", createdAt: daysAgo(1) },
            { id: "b", createdAt: daysAgo(2) },
            { id: "c", createdAt: daysAgo(3) },
        ];
        expect(filterByPeriod(rows, 30).map((r) => r.id)).toEqual([
            "a",
            "b",
            "c",
        ]);
    });
});
