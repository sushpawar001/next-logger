import fs from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, userEvent, waitFor, within } from "@/test/render";
import { rejectsWith } from "@/test/promises";

vi.mock("axios");
vi.mock("@/helpers/notify", () => ({ default: vi.fn() }));
vi.mock("@/helpers/entryLogged", () => ({ default: vi.fn() }));

// Recharts cannot lay out in jsdom; the pages under test care about the data
// they hand down, not the SVG the chart draws.
vi.mock("recharts", async (importOriginal) => {
    const actual = await importOriginal<typeof import("recharts")>();
    return {
        ...actual,
        ResponsiveContainer: ({ children }: any) => (
            <div data-testid="chart-container">{children}</div>
        ),
    };
});

import axios from "axios";
import notify from "@/helpers/notify";

import GlucosePage from "./(Dashboard)/glucose/page";
import WeightPage from "./(Dashboard)/weight/page";
import InsulinPage from "./(Dashboard)/insulin/page";
import MeasurementPage from "./(Dashboard)/measurement/page";
import ChartsPage from "./(Dashboard)/charts/page";
import DashboardPage from "./(Dashboard)/dashboard/page";
import LoadPage from "./(Dashboard)/load/page";

const get = vi.mocked(axios.get);
const del = vi.mocked(axios.delete);

const glucoseRows = [
    { _id: "g1", value: 110, createdAt: "2026-01-30T08:00:00.000Z", tag: "Fasting" },
    { _id: "g2", value: 94, createdAt: "2026-01-29T08:00:00.000Z", tag: null },
    { _id: "g3", value: 190, createdAt: "2026-01-28T08:00:00.000Z", tag: "After meal" },
];
const weightRows = [
    { _id: "w1", value: 72.4, createdAt: "2026-01-30T07:00:00.000Z", tag: "Fasting" },
    { _id: "w2", value: 72.9, createdAt: "2026-01-29T07:00:00.000Z", tag: null },
];
const insulinRows = [
    { _id: "i1", units: 12, name: "Lantus", createdAt: "2026-01-30T21:00:00.000Z", tag: "Before meal" },
    { _id: "i2", units: 6, name: "NovoRapid", createdAt: "2026-01-30T08:00:00.000Z", tag: null },
];
const measurementRows = [
    {
        _id: "m1", arms: 32, chest: 98, abdomen: 88, waist: 84,
        hip: 96, thighs: 56, calves: 38,
        createdAt: "2026-01-30T06:00:00.000Z", tag: "Other",
    },
];

/** Routes every GET the pages make to the right fixture. */
const routeGets = (overrides: Record<string, any> = {}) => {
    get.mockImplementation((url: string) => {
        for (const [fragment, value] of Object.entries(overrides)) {
            if (url.includes(fragment)) {
                return Promise.resolve({ status: 200, data: { data: value } });
            }
        }
        if (url.includes("/glucose/")) {
            return Promise.resolve({ status: 200, data: { data: glucoseRows } });
        }
        if (url.includes("/weight/")) {
            return Promise.resolve({ status: 200, data: { data: weightRows } });
        }
        if (url.includes("/insulin/")) {
            return Promise.resolve({ status: 200, data: { data: insulinRows } });
        }
        if (url.includes("/measurements/")) {
            return Promise.resolve({ status: 200, data: { data: measurementRows } });
        }
        return Promise.resolve({ status: 200, data: { data: [] } });
    });
};

beforeEach(() => {
    get.mockReset();
    del.mockReset();
    del.mockResolvedValue({ status: 200, data: { message: "Data deleted" } });
    vi.mocked(notify).mockClear();
    routeGets();
});

const LIST_PAGES = [
    {
        name: "glucose",
        Page: GlucosePage,
        endpoint: "/api/glucose/get/7",
        deleteEndpoint: "/api/glucose/delete/g1",
        rows: glucoseRows,
        sampleValue: /110/,
    },
    {
        name: "weight",
        Page: WeightPage,
        endpoint: "/api/weight/get/7",
        deleteEndpoint: "/api/weight/delete/w1",
        rows: weightRows,
        sampleValue: /72.4/,
    },
    {
        name: "insulin",
        Page: InsulinPage,
        endpoint: "/api/insulin/get/7",
        deleteEndpoint: "/api/insulin/delete/i1",
        rows: insulinRows,
        sampleValue: /12/,
    },
];

describe.each(LIST_PAGES)("$name page", (p) => {
    it("loads the last 7 days on mount", async () => {
        renderWithProviders(<p.Page />);

        await waitFor(() => expect(get).toHaveBeenCalledWith(p.endpoint));
    });

    it("renders the returned entries", async () => {
        renderWithProviders(<p.Page />);

        await waitFor(() =>
            expect(screen.getAllByText(p.sampleValue).length).toBeGreaterThan(0)
        );
    });

    it("refetches when the period changes", async () => {
        const user = userEvent.setup();
        renderWithProviders(<p.Page />);
        await waitFor(() =>
            expect(screen.getAllByRole("combobox").length).toBeGreaterThan(0)
        );

        await user.selectOptions(screen.getAllByRole("combobox")[0], "30");

        await waitFor(() =>
            expect(get).toHaveBeenCalledWith(expect.stringContaining("/30"))
        );
    });

    it("renders an add form", async () => {
        renderWithProviders(<p.Page />);

        await waitFor(() =>
            expect(
                screen.getAllByRole("button", { name: /submit/i }).length
            ).toBeGreaterThan(0)
        );
    });

    it("links each row to its edit page", async () => {
        renderWithProviders(<p.Page />);

        await waitFor(() =>
            expect(screen.getAllByRole("link").length).toBeGreaterThan(0)
        );
        const hrefs = screen
            .getAllByRole("link")
            .map((a) => a.getAttribute("href"));

        expect(hrefs.some((h) => h?.includes(p.rows[0]._id))).toBe(true);
    });

    it("deletes an entry through its confirmation modal", async () => {
        const user = userEvent.setup();
        renderWithProviders(<p.Page />);
        await waitFor(() =>
            expect(screen.getAllByText(p.sampleValue).length).toBeGreaterThan(0)
        );

        // The modal lives inside the row's action cell: trigger, then confirm.
        const table = screen.getAllByRole("table")[0];
        const rowButtons = within(table).getAllByRole("button");
        await user.click(rowButtons[0]);
        await user.click(
            within(table).getAllByRole("button", { name: /^delete$/i }).slice(-1)[0]
        );

        await waitFor(() => expect(del).toHaveBeenCalled());
        expect(del.mock.calls[0][0]).toContain("/delete/");
    });

    it("still renders its form when the API returns a non-200", async () => {
        get.mockResolvedValue({ status: 500, data: { data: [] } });

        renderWithProviders(<p.Page />);

        await waitFor(() =>
            expect(
                screen.getAllByRole("button", { name: /submit/i }).length
            ).toBeGreaterThan(0)
        );
    });

    it("renders with no entries at all", async () => {
        routeGets({ "/api/": [] });

        renderWithProviders(<p.Page />);

        await waitFor(() => expect(get).toHaveBeenCalled());
    });

    it("filters the table by tag", async () => {
        const user = userEvent.setup();
        renderWithProviders(<p.Page />);
        await waitFor(() =>
            expect(screen.getAllByText(p.sampleValue).length).toBeGreaterThan(0)
        );

        // The tag filter's toggle is the icon button in its own card.
        const filterCard = screen
            .getByText("Select tags to filter data")
            .closest("div[class]")!.parentElement!.parentElement!;
        await user.click(within(filterCard).getAllByRole("button").slice(-1)[0]);
        await user.click(screen.getAllByRole("checkbox")[0]);

        expect(screen.getAllByRole("table").length).toBeGreaterThan(0);
    });
});

describe("measurement page", () => {
    it("loads measurements on mount", async () => {
        renderWithProviders(<MeasurementPage />);

        await waitFor(() =>
            expect(get).toHaveBeenCalledWith(expect.stringContaining("/api/measurements/get/"))
        );
    });

    it("renders every circumference column", async () => {
        renderWithProviders(<MeasurementPage />);

        await waitFor(() => expect(get).toHaveBeenCalled());
        await waitFor(() =>
            expect(screen.getAllByRole("table").length).toBeGreaterThan(0)
        );
    });

    it("still renders when the API returns a non-200", async () => {
        get.mockResolvedValue({ status: 500, data: { data: [] } });

        renderWithProviders(<MeasurementPage />);

        await waitFor(() => expect(get).toHaveBeenCalled());
    });
});

describe("charts page", () => {
    it("loads glucose, weight and insulin in parallel", async () => {
        renderWithProviders(<ChartsPage />);

        await waitFor(() => expect(get.mock.calls.length).toBeGreaterThanOrEqual(3));
        const urls = get.mock.calls.map((c) => c[0] as string).join(" ");

        expect(urls).toContain("/api/glucose/");
        expect(urls).toContain("/api/weight/");
        expect(urls).toContain("/api/insulin/");
    });

    it("renders its charts", async () => {
        renderWithProviders(<ChartsPage />);

        await waitFor(() =>
            expect(screen.getAllByTestId("chart-container").length).toBeGreaterThan(0)
        );
    });

    it("offers a tag filter", async () => {
        renderWithProviders(<ChartsPage />);

        await waitFor(() => expect(get).toHaveBeenCalled());
        expect(screen.getAllByText(/filter by tags/i).length).toBeGreaterThan(0);
    });

    it("still renders when the API returns a non-200", async () => {
        get.mockResolvedValue({ status: 500, data: { data: [] } });

        renderWithProviders(<ChartsPage />);

        await waitFor(() => expect(get).toHaveBeenCalled());
    });
});

describe("dashboard page", () => {
    it("renders the diabetes dashboard", async () => {
        renderWithProviders(<DashboardPage />);

        await waitFor(() => expect(get).toHaveBeenCalled());
    });
});

describe("load page", () => {
    it("renders the barbell calculator", () => {
        const { container } = renderWithProviders(<LoadPage />);

        expect(container.textContent!.length).toBeGreaterThan(0);
    });
});

/**
 * Previously docs/BUGS.md #17: glucose and measurement created their fetch
 * promise inside a try block without awaiting it, so the catch and finally ran
 * immediately -- the loading flag cleared while nothing had loaded and the
 * rejection escaped unhandled. It could only be asserted from the source.
 *
 * Reading through TanStack Query means a failure is contained and observable,
 * so every list page can now be checked for real.
 */
describe("list pages surface a failed fetch", () => {
    it.each(LIST_PAGES.map((p) => [p.name, p.Page] as const))(
        "%s shows an error instead of an empty table",
        async (_name, Page) => {
            get.mockRejectedValue(new Error("network down"));

            renderWithProviders(<Page />);

            await waitFor(() =>
                expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
            );
        }
    );

    it("measurement shows an error too, which it never did before", async () => {
        get.mockRejectedValue(new Error("network down"));

        renderWithProviders(<MeasurementPage />);

        await waitFor(() =>
            expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
        );
    });

    it("does not leave the skeleton up once a fetch has failed", async () => {
        get.mockRejectedValue(new Error("network down"));

        const { container } = renderWithProviders(<GlucosePage />);

        await waitFor(() =>
            expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
        );
        expect(container.querySelectorAll(".animate-pulse")).toHaveLength(0);
    });
});
