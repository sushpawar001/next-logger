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
        otherPeriod: { label: "30 days", days: 30 },
        deleteEndpoint: "/api/glucose/delete/g1",
        rows: glucoseRows,
        sampleValue: /110/,
        logLabel: "Log glucose",
        saveLabel: /save reading/i,
        tag: "Fasting",
    },
    {
        name: "weight",
        Page: WeightPage,
        // Weight opens on 30 days: a week of weigh-ins is mostly noise.
        endpoint: "/api/weight/get/30",
        otherPeriod: { label: "7 days", days: 7 },
        deleteEndpoint: "/api/weight/delete/w1",
        rows: weightRows,
        sampleValue: /72.4/,
        logLabel: "Log weight",
        saveLabel: /save weight/i,
        tag: "Fasting",
    },
    {
        name: "insulin",
        Page: InsulinPage,
        endpoint: "/api/insulin/get/7",
        otherPeriod: { label: "30 days", days: 30 },
        deleteEndpoint: "/api/insulin/delete/i1",
        rows: insulinRows,
        sampleValue: /12/,
        logLabel: "Log dose",
        saveLabel: /save dose/i,
        tag: "Before meal",
    },
];

describe.each(LIST_PAGES)("$name page", (p) => {
    it("loads its default period on mount", async () => {
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
            expect(screen.getAllByText(p.sampleValue).length).toBeGreaterThan(0)
        );

        await user.click(
            screen.getByRole("button", { name: p.otherPeriod.label })
        );

        await waitFor(() =>
            expect(get).toHaveBeenCalledWith(
                expect.stringContaining(`/get/${p.otherPeriod.days}`)
            )
        );
    });

    it("opens its add form from the header", async () => {
        renderWithProviders(<p.Page />);

        const user = userEvent.setup();
        await user.click(
            (await screen.findAllByRole("button", { name: p.logLabel }))[0]
        );

        expect(
            within(screen.getByRole("dialog")).getByRole("button", {
                name: p.saveLabel,
            })
        ).toBeInTheDocument();
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

        // Each row has a Delete trigger; the confirmation is a portalled dialog.
        await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
        await user.click(
            within(screen.getByRole("dialog")).getByRole("button", { name: "Delete" })
        );

        await waitFor(() => expect(del).toHaveBeenCalledWith(p.deleteEndpoint));
    });

    it("still renders its form when the API returns a non-200", async () => {
        get.mockResolvedValue({ status: 500, data: { data: [] } });

        renderWithProviders(<p.Page />);

        const user = userEvent.setup();
        await user.click(
            (await screen.findAllByRole("button", { name: p.logLabel }))[0]
        );

        expect(
            within(screen.getByRole("dialog")).getByRole("button", {
                name: p.saveLabel,
            })
        ).toBeInTheDocument();
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

        const chip = within(
            screen.getByRole("group", { name: "Filter by tag" })
        ).getByRole("button", { name: p.tag });
        await user.click(chip);

        expect(chip).toHaveAttribute("aria-pressed", "true");
        // The matching entry stays listed. (Removed rows linger in jsdom, since
        // auto-animate's exit never finishes, so absence isn't asserted.)
        expect(screen.getAllByText(p.sampleValue).length).toBeGreaterThan(0);
    });
});

describe("measurement page", () => {
    it("loads measurements on mount", async () => {
        renderWithProviders(<MeasurementPage />);

        await waitFor(() =>
            expect(get).toHaveBeenCalledWith(expect.stringContaining("/api/measurements/get/"))
        );
    });

    it("offers every circumference to chart", async () => {
        renderWithProviders(<MeasurementPage />);

        const strip = await screen.findByRole("group", {
            name: "Choose a measurement to chart",
        });

        expect(within(strip).getAllByRole("button")).toHaveLength(7);
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
        expect(
            screen.getByRole("group", { name: "Filter by tag" })
        ).toBeInTheDocument();
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
        expect(screen.getByText("Latest glucose")).toBeInTheDocument();
        expect(screen.getByText("Current weight")).toBeInTheDocument();
    });

    it("reads glucose and insulin at 7 days and weight at 30", async () => {
        renderWithProviders(<DashboardPage />);

        await waitFor(() => {
            const urls = get.mock.calls.map((c) => String(c[0]));
            expect(urls).toEqual(
                expect.arrayContaining([
                    "/api/glucose/get/7",
                    "/api/insulin/get/7",
                    "/api/weight/get/30",
                ])
            );
        });
    });
});

describe("load page", () => {
    it("renders the barbell calculator", () => {
        const { container } = renderWithProviders(<LoadPage />);

        expect(container.textContent!.length).toBeGreaterThan(0);
    });

    it("titles the page and draws the setup, result and plate list", () => {
        renderWithProviders(<LoadPage />);

        expect(
            screen.getByRole("heading", { level: 1, name: "Plate calculator" })
        ).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Your setup" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Plate list" })).toBeInTheDocument();
        expect(screen.getByRole("img", { name: /barbell loaded/i })).toBeInTheDocument();
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
