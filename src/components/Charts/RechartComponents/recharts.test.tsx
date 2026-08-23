import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, userEvent, waitFor } from "@/test/render";

vi.mock("axios");

/**
 * Recharts renders through an SVG that jsdom cannot lay out, so
 * ResponsiveContainer is replaced with a fixed-size div (see setup.jsdom.tsx
 * for the ResizeObserver and getBoundingClientRect stubs it also needs).
 * These tests target the components' own logic: the dual fetch/props data
 * source, the prepareData timestamp transform, and the series toggles.
 */
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

import GlucoseChartRecharts from "./GlucoseChartRecharts";
import WeightChartRecharts from "./WeightChartRecharts";
import InsulinChartRecharts from "./InsulinChartRecharts";
import MeasurementChartRecharts from "./MeasurementChartRecharts";
import AdvGlucoseChartRecharts from "./AdvGlucoseChartRecharts";
import AdvWeightChartRecharts from "./AdvWeightChartRecharts";
import AdvInsulinChartSeparateRecharts from "./AdvInsulinChartSeparateRecharts";

const get = vi.mocked(axios.get);

const glucoseRows = [
    { _id: "g1", value: 110, createdAt: "2026-01-30T08:00:00.000Z", tag: "Fasting" },
    { _id: "g2", value: 94, createdAt: "2026-01-29T08:00:00.000Z", tag: null },
    { _id: "g3", value: 150, createdAt: "2026-01-28T08:00:00.000Z", tag: "After meal" },
];

const weightRows = [
    { _id: "w1", value: 72.4, createdAt: "2026-01-30T07:00:00.000Z", tag: null },
    { _id: "w2", value: 72.9, createdAt: "2026-01-29T07:00:00.000Z", tag: null },
];

const insulinRows = [
    { _id: "i1", units: 12, name: "Lantus", createdAt: "2026-01-30T21:00:00.000Z" },
    { _id: "i2", units: 6, name: "NovoRapid", createdAt: "2026-01-30T08:00:00.000Z" },
];

const measurementRows = [
    {
        _id: "m1",
        arms: 32, chest: 98, abdomen: 88, waist: 84,
        hip: 96, thighs: 56, calves: 38,
        createdAt: "2026-01-30T06:00:00.000Z",
    },
    {
        _id: "m2",
        arms: 33, chest: 99, abdomen: 87, waist: 83,
        hip: 95, thighs: 57, calves: 39,
        createdAt: "2026-01-20T06:00:00.000Z",
    },
];

const CHARTS = [
    {
        name: "GlucoseChartRecharts",
        Component: GlucoseChartRecharts,
        rows: glucoseRows,
        endpoint: "/api/glucose/get/7",
        defaultDays: 7,
    },
    {
        name: "WeightChartRecharts",
        Component: WeightChartRecharts,
        rows: weightRows,
        endpoint: "/api/weight/get/7",
        defaultDays: 7,
    },
    {
        name: "InsulinChartRecharts",
        Component: InsulinChartRecharts,
        rows: insulinRows,
        endpoint: "/api/insulin/get/7",
        defaultDays: 7,
    },
    {
        name: "MeasurementChartRecharts",
        Component: MeasurementChartRecharts,
        rows: measurementRows,
        endpoint: "/api/measurements/get/14",
        defaultDays: 14,
    },
    {
        name: "AdvGlucoseChartRecharts",
        Component: AdvGlucoseChartRecharts,
        rows: glucoseRows,
        endpoint: "/api/glucose/get/7",
        defaultDays: 7,
    },
    {
        name: "AdvWeightChartRecharts",
        Component: AdvWeightChartRecharts,
        rows: weightRows,
        endpoint: "/api/weight/get/7",
        defaultDays: 7,
    },
    {
        name: "AdvInsulinChartSeparateRecharts",
        Component: AdvInsulinChartSeparateRecharts,
        rows: insulinRows,
        endpoint: "/api/insulin/get/7",
        defaultDays: 7,
    },
];

beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue({ status: 200, data: { data: [] } });
});

describe.each(CHARTS)("$name", (c) => {
    it("renders a chart container", async () => {
        renderWithProviders(<c.Component fetch={false} data={c.rows as any} />);

        await waitFor(() =>
            expect(screen.getAllByTestId("chart-container").length).toBeGreaterThan(0)
        );
    });

    it("uses supplied data instead of fetching", async () => {
        renderWithProviders(<c.Component fetch={false} data={c.rows as any} />);

        await waitFor(() =>
            expect(screen.getAllByTestId("chart-container").length).toBeGreaterThan(0)
        );
        expect(get).not.toHaveBeenCalled();
    });

    it("fetches its own data when asked to", async () => {
        get.mockResolvedValue({ status: 200, data: { data: c.rows } });

        renderWithProviders(<c.Component fetch />);

        await waitFor(() => expect(get).toHaveBeenCalledWith(c.endpoint));
    });

    it("requests the number of days it was given", async () => {
        get.mockResolvedValue({ status: 200, data: { data: c.rows } });

        renderWithProviders(<c.Component fetch days={30} />);

        await waitFor(() =>
            expect(get).toHaveBeenCalledWith(expect.stringContaining("/30"))
        );
    });

    it("renders with no data at all", async () => {
        renderWithProviders(<c.Component fetch={false} data={[]} />);

        await waitFor(() =>
            expect(screen.getAllByTestId("chart-container").length).toBeGreaterThan(0)
        );
    });

    it("survives a failed fetch", async () => {
        get.mockRejectedValue(new Error("network down"));

        renderWithProviders(<c.Component fetch />);

        await waitFor(() => expect(get).toHaveBeenCalled());
        expect(screen.getAllByTestId("chart-container").length).toBeGreaterThan(0);
    });

    it("survives a non-200 response", async () => {
        get.mockResolvedValue({ status: 500, data: { data: [] } });

        renderWithProviders(<c.Component fetch />);

        await waitFor(() => expect(get).toHaveBeenCalled());
    });

    it("does not mutate the data array it was handed", async () => {
        const rows = c.rows.map((r) => ({ ...r }));
        const firstId = rows[0]._id;

        renderWithProviders(<c.Component fetch={false} data={rows as any} />);

        await waitFor(() =>
            expect(screen.getAllByTestId("chart-container").length).toBeGreaterThan(0)
        );
        expect(rows[0]._id).toBe(firstId);
    });
});

describe("series toggles", () => {
    /**
     * The advanced charts replace Recharts' Legend with clickable spans that
     * toggle each series, so the control is text rather than a button.
     */
    it.each([
        ["AdvGlucoseChartRecharts", AdvGlucoseChartRecharts, glucoseRows],
        ["AdvWeightChartRecharts", AdvWeightChartRecharts, weightRows],
    ])("%s renders a moving-average legend entry", async (_name, Component, rows) => {
        renderWithProviders(
            <Component fetch={false} data={rows as any} days={30} />
        );

        await waitFor(() =>
            expect(screen.getAllByText(/moving avg/i).length).toBeGreaterThan(0)
        );
    });

    it.each([
        ["AdvGlucoseChartRecharts", AdvGlucoseChartRecharts, glucoseRows],
        ["AdvWeightChartRecharts", AdvWeightChartRecharts, weightRows],
    ])("%s toggles the moving-average series on click", async (_name, Component, rows) => {
        const user = userEvent.setup();
        renderWithProviders(
            <Component fetch={false} data={rows as any} days={30} />
        );

        const legend = (
            await screen.findAllByText(/moving avg/i)
        )[0];
        const before = legend.getAttribute("style");

        await user.click(legend);

        expect(legend.getAttribute("style")).not.toBe(before);
    });

    it("labels the moving-average window with its interval", async () => {
        renderWithProviders(
            <AdvGlucoseChartRecharts
                fetch={false}
                data={glucoseRows as any}
                days={30}
            />
        );

        await waitFor(() =>
            expect(screen.getAllByText(/moving avg \(\d+\)/i).length).toBeGreaterThan(
                0
            )
        );
    });
});

describe("MeasurementChartRecharts", () => {
    it("plots all seven circumference series", async () => {
        const { container } = renderWithProviders(
            <MeasurementChartRecharts fetch={false} data={measurementRows as any} />
        );

        await waitFor(() =>
            expect(screen.getAllByTestId("chart-container").length).toBeGreaterThan(0)
        );
        expect(container.textContent).toBeTruthy();
    });

    it("defaults to a 14-day window rather than 7", async () => {
        get.mockResolvedValue({ status: 200, data: { data: measurementRows } });

        renderWithProviders(<MeasurementChartRecharts fetch />);

        await waitFor(() =>
            expect(get).toHaveBeenCalledWith(expect.stringContaining("/14"))
        );
    });
});

describe("AdvInsulinChartSeparateRecharts", () => {
    it("separates the insulin series by name", async () => {
        const { container } = renderWithProviders(
            <AdvInsulinChartSeparateRecharts
                fetch={false}
                data={insulinRows as any}
            />
        );

        await waitFor(() =>
            expect(screen.getAllByTestId("chart-container").length).toBeGreaterThan(0)
        );
        expect(container.textContent).toBeTruthy();
    });

    it("handles a single insulin type", async () => {
        renderWithProviders(
            <AdvInsulinChartSeparateRecharts
                fetch={false}
                data={[insulinRows[0]] as any}
            />
        );

        await waitFor(() =>
            expect(screen.getAllByTestId("chart-container").length).toBeGreaterThan(0)
        );
    });
});
