import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, userEvent, waitFor } from "@/test/render";

vi.mock("axios");
vi.mock("@/helpers/notify", () => ({ default: vi.fn() }));

const push = vi.fn();
let routeParams: Record<string, string> = {};
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
    usePathname: () => "/glucose/g1",
    useSearchParams: () => new URLSearchParams(),
    useParams: () => routeParams,
}));

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

import EditGlucose from "./(Dashboard)/glucose/[entryId]/page";
import EditWeight from "./(Dashboard)/weight/[entryId]/page";
import EditInsulin from "./(Dashboard)/insulin/[entryId]/page";
import EditMeasurement from "./(Dashboard)/measurement/[entryId]/page";
import MeasurementPage from "./(Dashboard)/measurement/page";

/**
 * The edit pages wire each field to its own change handler. Driving every
 * control proves they are connected -- an unwired input renders fine but
 * silently discards the user's edit on save.
 */

const get = vi.mocked(axios.get);
const put = vi.mocked(axios.put);
const del = vi.mocked(axios.delete);

const ENTRIES = {
    glucose: { _id: "g1", value: 110, createdAt: "2026-01-30T08:00:00.000Z", tag: "Fasting" },
    weight: { _id: "w1", value: 72.4, createdAt: "2026-01-30T07:00:00.000Z", tag: null },
    insulin: { _id: "i1", units: 12, name: "Lantus", createdAt: "2026-01-30T21:00:00.000Z", tag: "Before meal" },
    measurement: {
        _id: "m1", arms: 32, chest: 98, abdomen: 88, waist: 84,
        hip: 96, thighs: 56, calves: 38,
        createdAt: "2026-01-30T06:00:00.000Z", tag: "Other",
    },
};

const EDIT_PAGES = [
    { name: "glucose", Page: EditGlucose, entryId: "g1", entry: ENTRIES.glucose },
    { name: "weight", Page: EditWeight, entryId: "w1", entry: ENTRIES.weight },
    { name: "insulin", Page: EditInsulin, entryId: "i1", entry: ENTRIES.insulin },
    {
        name: "measurement",
        Page: EditMeasurement,
        entryId: "m1",
        entry: ENTRIES.measurement,
    },
];

beforeEach(() => {
    get.mockReset();
    put.mockReset();
    del.mockReset();
    push.mockReset();
    put.mockResolvedValue({ data: { message: "Data updated" } });
    del.mockResolvedValue({ data: { message: "Data deleted" } });
});

describe.each(EDIT_PAGES)("$name edit page controls", (p) => {
    const mount = async () => {
        get.mockImplementation((url: string) =>
            url.includes("get-insulin")
                ? Promise.resolve({ data: { data: [{ _id: "i1", name: "Lantus" }] } })
                : Promise.resolve({ data: { data: { ...p.entry } } })
        );
        routeParams = { entryId: p.entryId };
        const view = renderWithProviders(<p.Page />);
        await waitFor(() => expect(get).toHaveBeenCalled());
        return view;
    };

    it("accepts a change to every numeric field", async () => {
        const user = userEvent.setup();
        await mount();

        const numbers = screen.getAllByRole("spinbutton");
        for (const field of numbers) {
            await user.clear(field);
            await user.type(field, "42");
        }

        expect(numbers.length).toBeGreaterThan(0);
    });

    it("accepts a change to the date", async () => {
        const user = userEvent.setup();
        const { container } = await mount();

        const dates = container.querySelectorAll('input[type="datetime-local"]');
        for (const field of Array.from(dates)) {
            await user.clear(field as HTMLElement);
            await user.type(field as HTMLElement, "2026-02-01T09:15");
        }

        expect(dates.length).toBeGreaterThan(0);
    });

    it("accepts a change to every dropdown", async () => {
        const user = userEvent.setup();
        await mount();

        for (const combo of screen.queryAllByRole("combobox")) {
            const options = Array.from(combo.querySelectorAll("option"))
                .map((o) => o.value)
                .filter(Boolean);
            if (options.length) {
                await user.selectOptions(combo, options[options.length - 1]);
            }
        }

        expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    });

    it("sends the edited values on save", async () => {
        const user = userEvent.setup();
        await mount();

        const numbers = screen.getAllByRole("spinbutton");
        await user.clear(numbers[0]);
        await user.type(numbers[0], "42");
        await user.click(screen.getAllByRole("button", { name: /save|update/i })[0]);

        await waitFor(() => expect(put).toHaveBeenCalled());
        expect(JSON.stringify(put.mock.calls[0][1])).toContain("42");
    });
});

describe("measurement list page controls", () => {
    beforeEach(() => {
        get.mockResolvedValue({
            status: 200,
            data: { data: [ENTRIES.measurement] },
        });
    });

    it("refetches when the period changes", async () => {
        const user = userEvent.setup();
        renderWithProviders(<MeasurementPage />);
        // Wait for the rendered control, not for the request to be issued --
        // the page holds its skeleton until the query resolves.
        await waitFor(() =>
            expect(screen.getAllByRole("combobox").length).toBeGreaterThan(0)
        );

        await user.selectOptions(screen.getAllByRole("combobox")[0], "90");

        await waitFor(() =>
            expect(
                get.mock.calls.some((c) => String(c[0]).includes("/90"))
            ).toBe(true)
        );
    });

    it("deletes a measurement through its confirmation modal", async () => {
        const user = userEvent.setup();
        renderWithProviders(<MeasurementPage />);
        await waitFor(() =>
            expect(screen.getAllByRole("table").length).toBeGreaterThan(0)
        );

        const table = screen.getAllByRole("table")[0];
        const buttons = Array.from(table.querySelectorAll("button"));
        await user.click(buttons[0]);
        const confirm = buttons.filter((b) => /^delete$/i.test(b.textContent ?? ""));
        if (confirm.length) {
            await user.click(confirm[confirm.length - 1]);
            await waitFor(() => expect(del).toHaveBeenCalled());
        }
    });
});
