import { describe, expect, it } from "vitest";
import dayjs from "dayjs";
import {
    average,
    estimateHba1c,
    greeting,
    isSameLocalDay,
    latest,
    todayEntries,
    unitsByName,
    weightTrend,
} from "./dashboardData";

describe("greeting", () => {
    it.each([
        [8, "Good morning"],
        [14, "Good afternoon"],
        [20, "Good evening"],
    ])("at %s:00 says %s", (hour, text) => {
        expect(greeting(dayjs().hour(hour))).toBe(text);
    });
});

describe("latest", () => {
    it("picks the newest row regardless of order", () => {
        const rows = [
            { v: 1, createdAt: "2026-09-24T08:00:00Z" },
            { v: 2, createdAt: "2026-09-26T08:00:00Z" },
            { v: 3, createdAt: "2026-09-25T08:00:00Z" },
        ];

        expect(latest(rows)?.v).toBe(2);
    });

    it("is undefined for no rows", () => {
        expect(latest([])).toBeUndefined();
    });
});

describe("average and estimateHba1c", () => {
    it("averages values and returns null for none", () => {
        expect(average([100, 150])).toBe(125);
        expect(average([])).toBeNull();
    });

    it("estimates HbA1c to one decimal with the ADAG formula", () => {
        // (132 + 46.7) / 28.7 = 6.226…
        expect(estimateHba1c(132)).toBe(6.2);
    });
});

describe("todayEntries", () => {
    const now = dayjs();
    const today = now.toISOString();
    const earlier = now.subtract(1, "minute").toISOString();
    const yesterday = now.subtract(1, "day").toISOString();

    it("keeps only today's entries, newest first, across metrics", () => {
        const items = todayEntries(
            {
                glucose: [
                    { _id: "g1", value: 126, createdAt: today, tag: "After meal" },
                    { _id: "g0", value: 99, createdAt: yesterday },
                ],
                insulin: [{ _id: "i1", units: 8, name: "NovoRapid", createdAt: earlier }],
                weight: [{ _id: "w0", value: 72, createdAt: yesterday }],
            },
            now
        );

        expect(items.map((i) => [i.kind, i.value])).toEqual([
            ["glucose", 126],
            ["insulin", 8],
        ]);
        expect(items[1].name).toBe("NovoRapid");
    });

    it("matches the local calendar day", () => {
        expect(isSameLocalDay(today, now)).toBe(true);
        expect(isSameLocalDay(yesterday, now)).toBe(false);
    });
});

describe("unitsByName", () => {
    it("totals units per insulin, largest first", () => {
        expect(
            unitsByName([
                { units: 6, name: "NovoRapid" },
                { units: 10, name: "Tresiba" },
                { units: 8, name: "NovoRapid" },
            ])
        ).toEqual([
            ["NovoRapid", 14],
            ["Tresiba", 10],
        ]);
    });
});

describe("weightTrend", () => {
    it("keeps one unreadable value from blanking later averages", () => {
        const trend = weightTrend([
            { value: 70, createdAt: "2026-09-01T07:00:00Z" },
            { value: NaN, createdAt: "2026-09-02T07:00:00Z" },
            { value: 72, createdAt: "2026-09-03T07:00:00Z" },
            { value: 80, createdAt: "2026-09-20T07:00:00Z" },
        ]);

        expect(trend.map((p) => p.avg)).toEqual([70, 70, 71, 80]);
    });

    it("sorts oldest first and averages the trailing seven days", () => {
        const trend = weightTrend([
            { value: 72, createdAt: "2026-09-20T07:00:00Z" },
            { value: 74, createdAt: "2026-09-10T07:00:00Z" },
            { value: 73, createdAt: "2026-09-18T07:00:00Z" },
        ]);

        expect(trend.map((p) => p.value)).toEqual([74, 73, 72]);
        // 10 Sep is more than a week before the others.
        expect(trend.map((p) => p.avg)).toEqual([74, 73, 72.5]);
    });
});
