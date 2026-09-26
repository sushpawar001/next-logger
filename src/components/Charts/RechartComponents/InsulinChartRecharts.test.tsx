import { describe, expect, it, vi } from "vitest";
import dayjs from "dayjs";
import { renderWithProviders, screen, waitFor } from "@/test/render";

vi.mock("axios");
vi.mock("recharts", async (importOriginal) => {
    const actual = await importOriginal<typeof import("recharts")>();
    return {
        ...actual,
        ResponsiveContainer: ({ children }: any) => (
            <div data-testid="chart-container" style={{ width: 800, height: 400 }}>
                {children}
            </div>
        ),
    };
});

import axios from "axios";
import InsulinChartRecharts, { dailyInsulinTotals } from "./InsulinChartRecharts";

// Local-time noon keeps each dose on its calendar day in any timezone.
const at = (day: string, hour = 12) => dayjs(`${day}T${String(hour).padStart(2, "0")}:00`).toISOString();

describe("dailyInsulinTotals", () => {
    it("splits each day into basal and bolus, oldest first", () => {
        const rows = dailyInsulinTotals([
            { name: "NovoRapid", units: 8, createdAt: at("2026-09-26", 13) },
            { name: "Tresiba", units: 10, createdAt: at("2026-09-26", 7) },
            { name: "NovoRapid", units: 6, createdAt: at("2026-09-26", 7) },
            { name: "Tresiba", units: 10, createdAt: at("2026-09-25", 7) },
        ]);

        expect(rows.map(({ day, basal, bolus, total }) => ({ day, basal, bolus, total }))).toEqual([
            { day: "2026-09-25", basal: 10, bolus: 0, total: 10 },
            { day: "2026-09-26", basal: 10, bolus: 14, total: 24 },
        ]);
    });

    it("coerces string units from the API", () => {
        const [row] = dailyInsulinTotals([
            { name: "Lantus", units: "12" as unknown as number, createdAt: at("2026-09-26") },
        ]);

        expect(row.basal).toBe(12);
    });

    it("is empty without doses", () => {
        expect(dailyInsulinTotals([])).toEqual([]);
    });
});

describe("InsulinChartRecharts", () => {
    it("does not fetch when handed an empty list with fetch={false}", async () => {
        renderWithProviders(<InsulinChartRecharts fetch={false} data={[]} />);

        await waitFor(() =>
            expect(screen.getByTestId("chart-container")).toBeInTheDocument()
        );
        expect(axios.get).not.toHaveBeenCalled();
    });
});
