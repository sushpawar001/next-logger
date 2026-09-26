import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, userEvent, waitFor, within } from "@/test/render";

vi.mock("axios");
vi.mock("@/helpers/notify", () => ({ default: vi.fn() }));
vi.mock("@/helpers/entryLogged", () => ({ default: vi.fn() }));

const push = vi.fn();
let routeParams: Record<string, string> = {};
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
    usePathname: () => "/measurement",
    useSearchParams: () => new URLSearchParams(),
    useParams: () => routeParams,
}));

// Recharts cannot lay out in jsdom; these tests care about the page around it.
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
import MeasurementPage from "./(Dashboard)/measurement/page";
import EditMeasurement from "./(Dashboard)/measurement/[entryId]/page";
import {
    filledCount,
    formatChange,
    previewFields,
    summariseFields,
} from "@/components/measurement/measurementSummary";

const get = vi.mocked(axios.get);
const put = vi.mocked(axios.put);
const del = vi.mocked(axios.delete);

// Newest first, as the API returns them. The older session skipped chest.
const rows = [
    {
        _id: "m1", arms: 33.5, chest: 101, abdomen: 88, waist: 84,
        hip: 98.5, thighs: 57, calves: 37.5,
        createdAt: "2026-09-23T06:00:00.000Z", tag: "Fasting",
    },
    {
        _id: "m2", arms: 33.2, chest: null, abdomen: 89.2, waist: 85.1,
        hip: 99, thighs: 57.4, calves: 37.5,
        createdAt: "2026-09-09T06:00:00.000Z", tag: null,
    },
];

const serve = (data: any[] = rows) =>
    get.mockResolvedValue({ status: 200, data: { data } });

beforeEach(() => {
    get.mockReset();
    put.mockReset();
    del.mockReset();
    push.mockReset();
    vi.mocked(notify).mockClear();
    del.mockResolvedValue({ status: 200, data: { message: "Data deleted" } });
    put.mockResolvedValue({ data: { message: "Data updated" } });
    serve();
});

const mountList = async () => {
    const view = renderWithProviders(<MeasurementPage />);
    await screen.findByRole("heading", { name: "Measurements" });
    return view;
};

const strip = () => screen.getByRole("group", { name: "Choose a measurement to chart" });
const history = () =>
    screen.getByRole("heading", { name: "History" }).closest("section")!;

describe("measurement summary helpers", () => {
    it("takes the latest value and its change per field", () => {
        const waist = summariseFields(rows).find((s) => s.field === "waist")!;

        expect(waist).toEqual({ field: "waist", latest: 84, change: -1.1 });
    });

    it("skips sessions that did not record a field", () => {
        const chest = summariseFields(rows).find((s) => s.field === "chest")!;

        expect(chest).toEqual({ field: "chest", latest: 101, change: null });
    });

    it("counts filled fields", () => {
        expect(filledCount(rows[0])).toBe(7);
        expect(filledCount(rows[1])).toBe(6);
        expect(filledCount({ arms: "", waist: Number.NaN })).toBe(0);
    });

    it("formats a change with a real minus sign", () => {
        expect(formatChange(0.3)).toBe("+0.3 cm");
        expect(formatChange(-1.2)).toBe("−1.2 cm");
        expect(formatChange(0)).toBe("0 cm");
    });

    it("previews the charted field first", () => {
        expect(previewFields("hip")).toEqual(["hip", "waist", "chest"]);
        expect(previewFields("arms")).toEqual(["arms", "waist", "hip"]);
    });
});

describe("measurement page", () => {
    it("loads the last 30 days on mount", async () => {
        await mountList();

        expect(get).toHaveBeenCalledWith("/api/measurements/get/30");
    });

    it("says when the last measurement was taken", async () => {
        await mountList();

        expect(screen.getByText(/Last measured 23 Sep\./)).toBeInTheDocument();
    });

    it("shows all seven fields with their latest value and change", async () => {
        await mountList();

        const cells = within(strip()).getAllByRole("button");
        expect(cells).toHaveLength(7);
        const waist = within(strip()).getByRole("button", { name: /waist/i });
        expect(waist).toHaveTextContent("84.0");
        expect(waist).toHaveTextContent("−1.1 cm");
        expect(
            within(strip()).getByRole("button", { name: /chest/i })
        ).toHaveTextContent("No change yet");
    });

    it("charts waist first and switches from the strip", async () => {
        const user = userEvent.setup();
        await mountList();

        expect(screen.getByRole("heading", { name: "Waist over time" })).toBeInTheDocument();

        await user.click(within(strip()).getByRole("button", { name: /hip/i }));

        expect(screen.getByRole("heading", { name: "Hip over time" })).toBeInTheDocument();
        expect(within(strip()).getByRole("button", { name: /hip/i })).toHaveAttribute(
            "aria-pressed",
            "true"
        );
        expect(screen.getByRole("radio", { name: "Hip" })).toHaveAttribute(
            "aria-checked",
            "true"
        );
    });

    it("switches from the chips in the chart card too", async () => {
        const user = userEvent.setup();
        await mountList();

        await user.click(screen.getByRole("radio", { name: "Arms" }));

        expect(screen.getByRole("heading", { name: "Arms over time" })).toBeInTheDocument();
        expect(screen.getByText("2 measurements")).toBeInTheDocument();
    });

    it("lists each session with how many fields were filled", async () => {
        await mountList();

        expect(within(history()).getByText("7 of 7")).toBeInTheDocument();
        expect(within(history()).getByText("6 of 7")).toBeInTheDocument();
        expect(within(history()).getByText("Fasting")).toBeInTheDocument();
        // The older session has no chest value.
        expect(within(history()).getByText("—")).toBeInTheDocument();
    });

    it("links each session to its edit page", async () => {
        await mountList();

        expect(
            within(history()).getByRole("link", { name: "Edit 23 Sep" })
        ).toHaveAttribute("href", "/measurement/m1");
    });

    it("deletes a session through its confirmation", async () => {
        const user = userEvent.setup();
        await mountList();

        await user.click(within(history()).getAllByRole("button", { name: "Delete" })[0]);
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveTextContent("Delete these measurements?");
        await user.click(within(dialog).getByRole("button", { name: "Delete" }));

        await waitFor(() => expect(del).toHaveBeenCalledWith("/api/measurements/delete/m1"));
        await waitFor(() =>
            expect(notify).toHaveBeenCalledWith("Measurements data deleted!", "success")
        );
    });

    it("refetches when the period changes", async () => {
        const user = userEvent.setup();
        await mountList();

        await user.click(screen.getByRole("button", { name: "90 days" }));

        await waitFor(() =>
            expect(get).toHaveBeenCalledWith("/api/measurements/get/90")
        );
    });

    it("explains an empty result after filtering by tag", async () => {
        const user = userEvent.setup();
        await mountList();

        await user.click(screen.getByRole("button", { name: "Random" }));

        expect(
            screen.getByText("No measurement entries match the selected tags.")
        ).toBeInTheDocument();
    });

    it("explains an empty period", async () => {
        serve([]);
        await mountList();

        expect(
            screen.getByText("No measurement entries found for the selected period.")
        ).toBeInTheDocument();
        expect(within(strip()).getByRole("button", { name: /waist/i })).toHaveTextContent("—");
    });

    it("pages long histories", async () => {
        const user = userEvent.setup();
        serve(
            Array.from({ length: 10 }, (_, i) => ({
                ...rows[0],
                _id: `m${i}`,
                createdAt: `2026-09-${String(20 - i).padStart(2, "0")}T06:00:00.000Z`,
            }))
        );
        await mountList();

        expect(within(history()).getAllByText("7 of 7")).toHaveLength(8);
        await user.click(screen.getByRole("button", { name: "Show more" }));
        expect(within(history()).getAllByText("7 of 7")).toHaveLength(10);
        expect(screen.queryByRole("button", { name: "Show more" })).not.toBeInTheDocument();
    });

    it("shows an error when the fetch fails", async () => {
        get.mockRejectedValue(new Error("network down"));

        renderWithProviders(<MeasurementPage />);

        expect(await screen.findByText(/failed to load/i)).toBeInTheDocument();
    });

    it("opens the log form in a dialog", async () => {
        const user = userEvent.setup();
        await mountList();

        // Desktop header button and the phone bottom bar share the label.
        await user.click(screen.getAllByRole("button", { name: "Log measurements" })[0]);

        const dialog = screen.getByRole("dialog");
        expect(within(dialog).getByLabelText("Waist")).toBeInTheDocument();
        expect(
            within(dialog).getByRole("button", { name: /save measurements/i })
        ).toBeInTheDocument();
    });

    it("opens the log dialog straight away from a ?quick=1 shortcut", async () => {
        window.history.replaceState(null, "", "/measurement?quick=1");
        try {
            renderWithProviders(<MeasurementPage />);

            const dialog = await screen.findByRole("dialog");
            await waitFor(() => expect(within(dialog).getByLabelText("Arms")).toHaveFocus());
        } finally {
            window.history.replaceState(null, "", "/");
        }
    });
});

describe("measurement edit page", () => {
    const mountEdit = async () => {
        get.mockResolvedValue({ data: { data: { ...rows[0] } } });
        routeParams = { entryId: "m1" };
        renderWithProviders(<EditMeasurement />);
        await waitFor(() =>
            expect(screen.getByLabelText("Waist")).toHaveValue(84)
        );
    };

    it("uses the shared edit layout", async () => {
        await mountEdit();

        expect(screen.getByRole("heading", { name: "Edit measurements" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Measurements" })).toHaveAttribute(
            "href",
            "/measurement"
        );
        expect(screen.getByText("Encrypted at rest")).toBeInTheDocument();
    });

    it("renders all seven fields, the tag and the date", async () => {
        await mountEdit();

        expect(screen.getAllByRole("spinbutton")).toHaveLength(7);
        expect(screen.getByLabelText("Chest")).toHaveValue(101);
        expect(screen.getByRole("radiogroup", { name: "Tag" })).toBeInTheDocument();
        expect(screen.getByLabelText("Date & time")).toHaveAttribute(
            "type",
            "datetime-local"
        );
    });

    it("saves an edited field and tag", async () => {
        const user = userEvent.setup();
        await mountEdit();

        await user.clear(screen.getByLabelText("Waist"));
        await user.type(screen.getByLabelText("Waist"), "84.6");
        await user.click(screen.getByRole("radio", { name: "Other" }));
        expect(screen.getByRole("radio", { name: "Fasting" })).toHaveAttribute(
            "aria-checked",
            "false"
        );
        await user.click(screen.getAllByRole("button", { name: "Save changes" })[0]);

        await waitFor(() => expect(put).toHaveBeenCalled());
        const body = put.mock.calls[0][1] as any;
        expect(put.mock.calls[0][0]).toBe("/api/measurements/update/m1");
        expect(body.waist).toBe("84.6");
        expect(body.tag).toBe("Other");
        await waitFor(() => expect(push).toHaveBeenCalledWith("/measurement/"));
    });

    it("repeats what will be deleted in the confirmation", async () => {
        const user = userEvent.setup();
        await mountEdit();

        await user.click(screen.getByRole("button", { name: "Delete measurement" }));

        expect(screen.getByRole("dialog")).toHaveTextContent("7 of 7 measurements");
    });
});
