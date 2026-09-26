import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, userEvent, waitFor, within } from "@/test/render";
import { rejectsWith } from "@/test/promises";

vi.mock("axios");
vi.mock("@/helpers/notify", () => ({ default: vi.fn() }));
vi.mock("@/helpers/entryLogged", () => ({ default: vi.fn() }));

// Recharts cannot lay out in jsdom; the page under test cares about the data
// it hands down, not the SVG the chart draws.
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
import WeightPage from "./(Dashboard)/weight/page";

const get = vi.mocked(axios.get);
const del = vi.mocked(axios.delete);

// Newest first, as the API returns them.
const weightRows = [
    { _id: "w1", value: 72.4, createdAt: "2026-01-30T07:00:00.000Z", tag: "Fasting" },
    { _id: "w2", value: 72.9, createdAt: "2026-01-29T07:00:00.000Z", tag: null },
    { _id: "w3", value: 73.1, createdAt: "2026-01-28T07:00:00.000Z", tag: "Other" },
];

const serve = (rows: any[]) =>
    get.mockImplementation(() =>
        Promise.resolve({ status: 200, data: { data: rows } })
    );

const entries = () => screen.getByRole("region", { name: "Entries" });

const mountLoaded = async (rows = weightRows) => {
    serve(rows);
    renderWithProviders(<WeightPage />);
    await screen.findByRole("heading", { name: "Weight", level: 1 });
};

beforeEach(() => {
    get.mockReset();
    del.mockReset();
    del.mockResolvedValue({ status: 200, data: { message: "Data deleted" } });
    vi.mocked(notify).mockClear();
    window.history.replaceState(null, "", "/weight");
});

describe("weight page", () => {
    it("opens on the last 30 days", async () => {
        await mountLoaded();

        expect(get).toHaveBeenCalledWith("/api/weight/get/30");
        expect(screen.getByRole("button", { name: "30 days" })).toHaveAttribute(
            "aria-pressed",
            "true"
        );
    });

    it("leads with the current weight and a neutral change over the period", async () => {
        await mountLoaded();

        const hero = screen.getByRole("region", { name: "Current weight" });
        expect(hero).toHaveTextContent("72.4kg");
        expect(hero).toHaveTextContent("0.7 kg in 30 days");
        // Never a status colour for weight.
        expect(hero.querySelector('[class*="status-"]')).toBeNull();
    });

    it("summarises the period", async () => {
        await mountLoaded();

        const hero = screen.getByRole("region", { name: "Current weight" });
        expect(hero).toHaveTextContent("30-day average72.8kg");
        expect(hero).toHaveTextContent("Weigh-ins3");
        expect(hero).toHaveTextContent("Highest73.1kg");
        expect(hero).toHaveTextContent("Lowest72.4kg");
    });

    it("shows each weigh-in's change from the one before", async () => {
        await mountLoaded();

        const rows = within(entries()).getAllByRole("listitem");
        expect(rows).toHaveLength(3);
        expect(rows[0]).toHaveTextContent("−0.5");
        expect(rows[1]).toHaveTextContent("−0.2");
        // The oldest has nothing to compare against.
        expect(rows[2]).not.toHaveTextContent(/[−+]/);
    });

    it("refetches when the period changes", async () => {
        const user = userEvent.setup();
        await mountLoaded();

        await user.click(screen.getByRole("button", { name: "7 days" }));

        await waitFor(() => expect(get).toHaveBeenCalledWith("/api/weight/get/7"));
        expect(screen.getByRole("region", { name: "Current weight" })).toHaveTextContent(
            "in 7 days"
        );
    });

    it("links each entry to its edit page", async () => {
        await mountLoaded();

        const hrefs = within(entries())
            .getAllByRole("link")
            .map((a) => a.getAttribute("href"));

        expect(hrefs).toEqual(["/weight/w1", "/weight/w2", "/weight/w3"]);
    });

    it("deletes an entry through its confirmation dialog", async () => {
        const user = userEvent.setup();
        await mountLoaded();

        const first = within(entries()).getAllByRole("listitem")[0];
        await user.click(within(first).getByRole("button", { name: "Delete" }));
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveTextContent("72.4 kg · Fasting");
        await user.click(within(dialog).getByRole("button", { name: "Delete" }));

        await waitFor(() => expect(del).toHaveBeenCalledWith("/api/weight/delete/w1"));
        await waitFor(() =>
            expect(notify).toHaveBeenCalledWith("Weight data deleted!", "success")
        );
    });

    it("reports a failed delete", async () => {
        const user = userEvent.setup();
        del.mockImplementation(rejectsWith(new Error("nope")));
        await mountLoaded();

        const first = within(entries()).getAllByRole("listitem")[0];
        await user.click(within(first).getByRole("button", { name: "Delete" }));
        await user.click(
            within(screen.getByRole("dialog")).getByRole("button", { name: "Delete" })
        );

        await waitFor(() =>
            expect(notify).toHaveBeenCalledWith("Could not delete that entry.", "error")
        );
    });

    it("filters entries by tag", async () => {
        const user = userEvent.setup();
        await mountLoaded();

        await user.click(screen.getByRole("button", { name: "Fasting" }));

        // Assert on the counts: auto-animate keeps leaving rows in the DOM for
        // an exit animation that never finishes under jsdom.
        expect(entries()).toHaveTextContent("1 in view");
        expect(screen.getByRole("region", { name: "Current weight" })).toHaveTextContent(
            "Weigh-ins1"
        );
    });

    it("says when no entry matches the tags", async () => {
        const user = userEvent.setup();
        await mountLoaded();

        await user.click(screen.getByRole("button", { name: "Random" }));

        expect(entries()).toHaveTextContent(
            "No weight entries match the selected tags."
        );
    });

    it("renders with no entries at all", async () => {
        await mountLoaded([]);

        expect(entries()).toHaveTextContent(
            "No weight entries found for the selected period."
        );
    });

    it("pages the entries list ten at a time", async () => {
        const user = userEvent.setup();
        const many = Array.from({ length: 12 }, (_, i) => ({
            _id: `w${i}`,
            value: 72 + i / 10,
            createdAt: new Date(Date.UTC(2026, 0, 30 - i, 7)).toISOString(),
            tag: null,
        }));
        await mountLoaded(many);

        expect(within(entries()).getAllByRole("listitem")).toHaveLength(10);
        await user.click(screen.getByRole("button", { name: "Load more" }));
        expect(within(entries()).getAllByRole("listitem")).toHaveLength(12);
        expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();
    });

    it("opens the add form from Log weight", async () => {
        const user = userEvent.setup();
        await mountLoaded();

        // The header copy and the phone bottom-bar copy both open it.
        await user.click(screen.getAllByRole("button", { name: "Log weight" })[0]);

        const dialog = screen.getByRole("dialog", { name: "Log weight" });
        expect(within(dialog).getByLabelText("Weight")).toBeInTheDocument();
    });

    it("opens the add form straight away from a PWA shortcut", async () => {
        window.history.replaceState(null, "", "/weight?quick=1");
        serve(weightRows);
        renderWithProviders(<WeightPage />);

        // The modal hides the page behind it from the accessibility tree.
        expect(await screen.findByRole("dialog", { name: "Log weight" })).toBeInTheDocument();
    });

    it("renders the trend chart", async () => {
        await mountLoaded();

        expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    });

    it("surfaces a failed fetch", async () => {
        get.mockImplementation(rejectsWith(new Error("network down")));
        renderWithProviders(<WeightPage />);

        expect(await screen.findByText(/failed to load weight data/i)).toBeInTheDocument();
    });
});
