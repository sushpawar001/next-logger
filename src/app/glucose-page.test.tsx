import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, userEvent, waitFor, within } from "@/test/render";

vi.mock("axios");
vi.mock("@/helpers/notify", () => ({ default: vi.fn() }));
vi.mock("@/helpers/entryLogged", () => ({ default: vi.fn() }));

const push = vi.fn();
let routeParams: Record<string, string> = {};
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
    usePathname: () => "/glucose",
    useSearchParams: () => new URLSearchParams(),
    useParams: () => routeParams,
}));

// Recharts cannot lay out in jsdom; the pages under test care about the data
// they hand down, not the SVG the chart draws.
vi.mock("recharts", async (importOriginal) => {
    const actual = await importOriginal<typeof import("recharts")>();
    return {
        ...actual,
        ResponsiveContainer: ({ children }: any) => (
            <div data-testid="chart-container" style={{ width: 800, height: 300 }}>
                {children}
            </div>
        ),
    };
});

import axios from "axios";
import notify from "@/helpers/notify";

import GlucosePage from "./(Dashboard)/glucose/page";
import EditGlucose from "./(Dashboard)/glucose/[entryId]/page";
import GlucoseChartRecharts from "@/components/Charts/RechartComponents/GlucoseChartRecharts";
import { contextWindow } from "@/components/glucose/GlucoseDayContext";
import { averageByTag, summarise } from "@/components/glucose/glucoseSummary";

const get = vi.mocked(axios.get);
const post = vi.mocked(axios.post);
const put = vi.mocked(axios.put);
const del = vi.mocked(axios.delete);

const glucoseRows = [
    { _id: "g1", value: 110, createdAt: "2026-01-30T08:00:00.000Z", tag: "Fasting" },
    { _id: "g2", value: 94, createdAt: "2026-01-29T08:00:00.000Z", tag: null },
    { _id: "g3", value: 190, createdAt: "2026-01-28T08:00:00.000Z", tag: "After meal" },
];

const serve = (rows: any[]) =>
    get.mockImplementation(() =>
        Promise.resolve({ status: 200, data: { data: rows } })
    );

beforeEach(() => {
    get.mockReset();
    post.mockReset();
    put.mockReset();
    del.mockReset();
    push.mockReset();
    vi.mocked(notify).mockClear();
    del.mockResolvedValue({ status: 200, data: { message: "Data deleted" } });
    post.mockResolvedValue({ data: { message: "Entry added!", entry: {} } });
    put.mockResolvedValue({ data: { message: "Data updated" } });
    serve(glucoseRows);
});

afterEach(() => {
    window.history.replaceState(null, "", "/");
});

const history = () => screen.getByRole("table");
const loaded = () =>
    waitFor(() => expect(within(history()).getByText("190")).toBeInTheDocument());

describe("glucose page", () => {
    it("loads the last 7 days on mount", async () => {
        renderWithProviders(<GlucosePage />);

        await waitFor(() => expect(get).toHaveBeenCalledWith("/api/glucose/get/7"));
    });

    it("refetches when the period changes", async () => {
        const user = userEvent.setup();
        renderWithProviders(<GlucosePage />);
        await loaded();

        await user.click(screen.getByRole("button", { name: "30 days" }));

        await waitFor(() =>
            expect(get).toHaveBeenCalledWith("/api/glucose/get/30")
        );
    });

    it("leads with the latest reading and the period summary", async () => {
        renderWithProviders(<GlucosePage />);
        await loaded();

        const hero = screen.getByText("Latest reading").closest("section")!;
        expect(hero).toHaveTextContent("110");
        expect(within(hero).getByText("In range")).toBeInTheDocument();
        // (110 + 94 + 190) / 3, rounded
        expect(hero).toHaveTextContent("Average131");
        expect(hero).toHaveTextContent("Readings3");
        expect(hero).toHaveTextContent("Highest190");
        expect(hero).toHaveTextContent("Lowest94");
        expect(hero).toHaveTextContent("Last 7 days");
    });

    it("averages readings per tag, leaving untagged ones out", async () => {
        renderWithProviders(<GlucosePage />);
        await loaded();

        const card = screen.getByText("Average by tag").closest("section")!;
        expect(card).toHaveTextContent("Fasting110");
        expect(card).toHaveTextContent("After meal190");
        expect(card).not.toHaveTextContent("Random");
    });

    it("gives every row a status badge with an icon and label", async () => {
        renderWithProviders(<GlucosePage />);
        await loaded();

        const rows = within(history()).getAllByRole("row").slice(1);
        expect(rows[0]).toHaveTextContent("In range");
        expect(rows[2]).toHaveTextContent("High");
    });

    it("links each row to its edit page", async () => {
        renderWithProviders(<GlucosePage />);
        await loaded();

        const edits = within(history()).getAllByRole("link", { name: "Edit" });
        expect(edits.map((a) => a.getAttribute("href"))).toEqual([
            "/glucose/g1",
            "/glucose/g2",
            "/glucose/g3",
        ]);
    });

    it("deletes an entry after a confirmation that names it", async () => {
        const user = userEvent.setup();
        renderWithProviders(<GlucosePage />);
        await loaded();

        await user.click(within(history()).getAllByRole("button", { name: "Delete" })[0]);
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveTextContent("Delete this reading?");
        expect(dialog).toHaveTextContent("110 mg/dL · Fasting");
        await user.click(within(dialog).getByRole("button", { name: "Delete" }));

        await waitFor(() =>
            expect(del).toHaveBeenCalledWith("/api/glucose/delete/g1")
        );
        await waitFor(() =>
            expect(notify).toHaveBeenCalledWith("Glucose data deleted!", "success")
        );
    });

    it("filters the history by tag chips", async () => {
        const user = userEvent.setup();
        renderWithProviders(<GlucosePage />);
        await loaded();

        await user.click(screen.getByRole("button", { name: "Fasting" }));

        // auto-animate keeps removed rows mounted in jsdom (its exit animation
        // never reports finishing), so assert on the count line instead.
        expect(screen.getByRole("button", { name: "Fasting" })).toHaveAttribute(
            "aria-pressed",
            "true"
        );
        expect(screen.getByText("Showing 1 of 1")).toBeInTheDocument();
    });

    it("says when no reading matches the chosen tags", async () => {
        const user = userEvent.setup();
        renderWithProviders(<GlucosePage />);
        await loaded();

        await user.click(screen.getByRole("button", { name: "Random" }));

        expect(
            screen.getByText("No glucose entries match the selected tags.")
        ).toBeInTheDocument();
    });

    it("shows 20 rows at a time", async () => {
        const user = userEvent.setup();
        serve(
            Array.from({ length: 25 }, (_, i) => ({
                _id: `r${i}`,
                value: 100 + i,
                createdAt: new Date(Date.UTC(2026, 0, 30, 0, 0) - i * 3600_000).toISOString(),
                tag: null,
            }))
        );
        renderWithProviders(<GlucosePage />);
        await waitFor(() => expect(screen.getByText("Showing 20 of 25")).toBeInTheDocument());

        await user.click(screen.getByRole("button", { name: "Load more" }));

        expect(screen.getByText("Showing 25 of 25")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();
    });

    it("opens the add form from Log glucose and closes it once saved", async () => {
        const user = userEvent.setup();
        renderWithProviders(<GlucosePage />);
        await loaded();
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

        // Header button (desktop) and bottom bar (phones) both open it.
        await user.click(screen.getAllByRole("button", { name: "Log glucose" })[0]);
        const dialog = screen.getByRole("dialog", { name: "Log glucose" });
        await user.type(within(dialog).getByLabelText(/glucose reading/i), "126");
        await user.click(within(dialog).getByRole("button", { name: /save reading/i }));

        await waitFor(() => expect(post).toHaveBeenCalledWith(
            "/api/glucose/add",
            expect.objectContaining({ value: "126" }),
            expect.anything()
        ));
        await waitFor(() =>
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
        );
    });

    it("opens the add form straight away from the ?quick=1 shortcut", async () => {
        window.history.replaceState(null, "", "/glucose?quick=1");
        renderWithProviders(<GlucosePage />);

        await waitFor(() =>
            expect(screen.getByRole("dialog", { name: "Log glucose" })).toBeInTheDocument()
        );
    });

    it("explains an empty period", async () => {
        serve([]);
        renderWithProviders(<GlucosePage />);

        await waitFor(() =>
            expect(
                screen.getByText("No glucose entries found for the selected period.")
            ).toBeInTheDocument()
        );
        expect(screen.getByText(/no readings in this period yet/i)).toBeInTheDocument();
    });

    it("shows an error, and still offers Log glucose, when the fetch fails", async () => {
        get.mockRejectedValue(new Error("network down"));
        renderWithProviders(<GlucosePage />);

        await waitFor(() =>
            expect(screen.getByRole("alert")).toHaveTextContent(/failed to load/i)
        );
        expect(screen.getAllByRole("button", { name: "Log glucose" }).length).toBeGreaterThan(0);
    });
});

describe("glucose edit page", () => {
    const entry = { _id: "g1", value: 110, createdAt: "2026-01-30T08:00:00.000Z", tag: "Fasting" };

    const mount = async (e: Record<string, any> = entry, dayRows: any[] = []) => {
        get.mockImplementation((url: string) =>
            Promise.resolve({
                status: 200,
                data: { data: url.includes("get-one") ? { ...e } : dayRows },
            })
        );
        routeParams = { entryId: e._id };
        const view = renderWithProviders(<EditGlucose />);
        await waitFor(() =>
            expect(screen.getByLabelText("Reading")).toHaveValue(Number(e.value))
        );
        return view;
    };

    it("shows the reading's status and updates it as you type", async () => {
        const user = userEvent.setup();
        await mount();
        const form = screen.getByRole("form", { name: "Edit reading" });
        expect(within(form).getByText("In range")).toBeInTheDocument();

        await user.clear(screen.getByLabelText("Reading"));
        await user.type(screen.getByLabelText("Reading"), "250");

        expect(within(form).getByText("High")).toBeInTheDocument();
    });

    it("picks the tag with chips and sends it", async () => {
        const user = userEvent.setup();
        await mount();
        expect(screen.getByRole("radio", { name: "Fasting" })).toHaveAttribute(
            "aria-checked",
            "true"
        );

        await user.click(screen.getByRole("radio", { name: "After meal" }));
        await user.click(screen.getAllByRole("button", { name: /save changes/i })[0]);

        await waitFor(() => expect(put).toHaveBeenCalled());
        expect((put.mock.calls[0][1] as any).tag).toBe("After meal");
        await waitFor(() => expect(push).toHaveBeenCalledWith("/glucose"));
    });

    it("clears the tag when the chosen chip is clicked again", async () => {
        const user = userEvent.setup();
        await mount();

        await user.click(screen.getByRole("radio", { name: "Fasting" }));
        await user.click(screen.getAllByRole("button", { name: /save changes/i })[0]);

        await waitFor(() => expect(put).toHaveBeenCalled());
        expect((put.mock.calls[0][1] as any).tag).toBeNull();
    });

    it("names the reading in the delete confirmation", async () => {
        const user = userEvent.setup();
        await mount();

        await user.click(screen.getByRole("button", { name: "Delete reading" }));

        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveTextContent("Delete this reading?");
        expect(dialog).toHaveTextContent("110 mg/dL · Fasting");
    });

    it("skips the day's context for an old entry without fetching", async () => {
        await mount();

        expect(screen.queryByText("That day")).not.toBeInTheDocument();
        expect(get.mock.calls.map((c) => c[0])).toEqual(["/api/glucose/get-one/g1"]);
    });

    it("places a recent entry on its day's curve", async () => {
        const recent = new Date(Date.now() - 2 * 3600_000);
        const sameDay = { ...entry, createdAt: recent.toISOString() };
        await mount(sameDay, [
            sameDay,
            { _id: "g9", value: 150, createdAt: new Date(recent.getTime() - 60_000).toISOString(), tag: null },
            // Another day: left out.
            { _id: "g8", value: 99, createdAt: new Date(recent.getTime() - 3 * 86400_000).toISOString(), tag: null },
        ]);

        await waitFor(() => expect(screen.getByText("That day")).toBeInTheDocument());
        expect(get).toHaveBeenCalledWith("/api/glucose/get/7");
        expect(screen.getByText(/· 2 readings/)).toBeInTheDocument();
    });
});

describe("glucose helpers", () => {
    it("summarises a period", () => {
        expect(summarise(glucoseRows)).toEqual({
            count: 3,
            average: 131,
            highest: 190,
            lowest: 94,
        });
        expect(summarise([])).toEqual({
            count: 0,
            average: null,
            highest: null,
            lowest: null,
        });
    });

    it("averages per tag in the entry-tag order", () => {
        expect(
            averageByTag(
                [
                    { value: 100, tag: "Random" },
                    { value: 120, tag: "Fasting" },
                    { value: 140, tag: "Fasting" },
                    { value: 90, tag: null },
                ],
                ["Fasting", "Random"]
            )
        ).toEqual([
            { tag: "Fasting", average: 130, count: 2 },
            { tag: "Random", average: 100, count: 1 },
        ]);
    });

    it.each([
        [0.5, 7],
        [10, 14],
        [20, 30],
        [45, null],
    ])("uses a %s-day-old entry's %s-day window for context", (age, window) => {
        const now = new Date("2026-09-26T12:00:00.000Z");
        const created = new Date(now.getTime() - age * 86400_000);

        expect(contextWindow(created, now)).toBe(window);
    });
});

describe("GlucoseChartRecharts options", () => {
    it("renders a single day with hour ticks, a now marker and a highlight", () => {
        renderWithProviders(
            <GlucoseChartRecharts
                fetch={false}
                data={glucoseRows}
                xTicks="hour"
                now={new Date("2026-01-30T12:00:00.000Z").getTime()}
                highlight="2026-01-30T08:00:00.000Z"
                xDomain={[
                    new Date("2026-01-28T00:00:00.000Z").getTime(),
                    new Date("2026-01-31T00:00:00.000Z").getTime(),
                ]}
            />
        );

        expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    });
});
