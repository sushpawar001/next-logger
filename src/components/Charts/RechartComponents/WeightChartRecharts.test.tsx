import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, waitFor } from "@/test/render";

vi.mock("axios");
vi.mock("recharts", async (importOriginal) => {
    const actual = await importOriginal<typeof import("recharts")>();
    return {
        ...actual,
        ResponsiveContainer: ({ children }: any) => (
            <div data-testid="chart-container">{children}</div>
        ),
    };
});

import WeightChartRecharts, { withSevenDayAverage } from "./WeightChartRecharts";

const DAY = 24 * 60 * 60 * 1000;

describe("withSevenDayAverage", () => {
    it("averages the weigh-ins in the trailing seven days", () => {
        const points = [
            { createdAt: 0, value: 74 },
            { createdAt: 1 * DAY, value: 73 },
            { createdAt: 2 * DAY, value: 72 },
        ];

        expect(withSevenDayAverage(points).map((p) => p.avg)).toEqual([74, 73.5, 73]);
    });

    it("drops weigh-ins seven or more days older than the point", () => {
        const points = [
            { createdAt: 0, value: 80 },
            { createdAt: 7 * DAY, value: 70 },
        ];

        expect(withSevenDayAverage(points)[1].avg).toBe(70);
    });

    it("copes with string values from the API", () => {
        const points = [
            { createdAt: 0, value: "72.4" as any },
            { createdAt: DAY, value: "72.6" as any },
        ];

        expect(withSevenDayAverage(points)[1].avg).toBe(72.5);
    });

    it("is empty for no weigh-ins", () => {
        expect(withSevenDayAverage([])).toEqual([]);
    });
});

describe("WeightChartRecharts options", () => {
    const rows = [
        { value: 72.4, createdAt: "2026-01-30T07:00:00.000Z" },
        { value: 72.9, createdAt: "2026-01-29T07:00:00.000Z" },
    ];

    it.each([
        [{}],
        [{ showAverage: false }],
        [{ showDots: false }],
    ])("renders with %o", async (opts) => {
        renderWithProviders(<WeightChartRecharts fetch={false} data={rows} {...opts} />);

        await waitFor(() =>
            expect(screen.getByTestId("chart-container")).toBeInTheDocument()
        );
    });
});
