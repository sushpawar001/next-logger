import { beforeEach, describe, expect, it, vi } from "vitest";
import dayjs from "dayjs";
import { renderWithProviders, screen, userEvent, waitFor, within } from "@/test/render";

vi.mock("axios");
vi.mock("@/helpers/notify", () => ({ default: vi.fn() }));
vi.mock("@/helpers/entryLogged", () => ({ default: vi.fn() }));

const push = vi.fn();
let routeParams: Record<string, string> = {};
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
    usePathname: () => "/insulin",
    useSearchParams: () => new URLSearchParams(),
    useParams: () => routeParams,
}));

// Recharts cannot lay out in jsdom.
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
import InsulinPage from "./(Dashboard)/insulin/page";
import EditInsulin from "./(Dashboard)/insulin/[entryId]/page";

const get = vi.mocked(axios.get);
const put = vi.mocked(axios.put);
const del = vi.mocked(axios.delete);

const todayAt = (h: number, m = 0) => dayjs().hour(h).minute(m).second(0).toISOString();
const yesterday = dayjs().subtract(1, "day").hour(20).toISOString();

const rows = [
    { _id: "i1", units: 8, name: "NovoRapid", createdAt: todayAt(0, 40), tag: "Before meal" },
    { _id: "i2", units: 10, name: "Tresiba", createdAt: todayAt(0, 12), tag: null },
    { _id: "i3", units: 6, name: "NovoRapid", createdAt: todayAt(0, 5), tag: "After meal" },
    { _id: "i4", units: 5, name: "NovoRapid", createdAt: yesterday, tag: "Before meal" },
];
const userInsulins = [
    { _id: "t1", name: "NovoRapid" },
    { _id: "t2", name: "Tresiba" },
];

const route = (entries = rows, types = userInsulins) =>
    get.mockImplementation((url: string) => {
        if (url.includes("get-insulin")) {
            return Promise.resolve({ status: 200, data: { data: types } });
        }
        if (url.includes("/api/insulin/get-one/")) {
            return Promise.resolve({ status: 200, data: { data: { ...rows[0] } } });
        }
        if (url.includes("/api/insulin/get/")) {
            return Promise.resolve({ status: 200, data: { data: entries } });
        }
        return Promise.resolve({ status: 200, data: { data: [] } });
    });

beforeEach(() => {
    get.mockReset();
    put.mockReset();
    del.mockReset();
    push.mockReset();
    vi.mocked(notify).mockClear();
    put.mockResolvedValue({ data: { message: "Data updated" } });
    del.mockResolvedValue({ status: 200, data: { message: "Data deleted" } });
    route();
});

const table = () => screen.getByRole("table");
const mountList = async () => {
    renderWithProviders(<InsulinPage />);
    await screen.findByRole("heading", { name: "Insulin", level: 1 });
};

describe("insulin page", () => {
    it("loads the last 7 days and the user's insulins", async () => {
        await mountList();

        expect(get).toHaveBeenCalledWith("/api/insulin/get/7");
        await waitFor(() => expect(get).toHaveBeenCalledWith("/api/users/get-insulin"));
    });

    it("totals today's doses and splits bolus from basal", async () => {
        await mountList();
        const today = screen.getByText("Today", { selector: "span" }).closest("section")!;

        // 8 + 6 NovoRapid (bolus) + 10 Tresiba (basal); yesterday's 5 is left out.
        expect(today).toHaveTextContent("24IU");
        expect(today).toHaveTextContent("Bolus 14 IU");
        expect(today).toHaveTextContent("Basal 10 IU");
        expect(today).toHaveTextContent("3 doses · last at 00:40");
    });

    it("draws today's doses on the strip", async () => {
        await mountList();

        expect(screen.getByRole("img", { name: /^Doses today:/ })).toHaveAccessibleName(
            "Doses today: NovoRapid 6 IU at 00:05, Tresiba 10 IU at 00:12, NovoRapid 8 IU at 00:40"
        );
    });

    it("lists my insulins with today's units and a link to Profile", async () => {
        await mountList();
        const mine = screen.getByRole("heading", { name: "My insulins" }).closest("section")!;

        await waitFor(() => expect(mine).toHaveTextContent("NovoRapid"));
        expect(mine).toHaveTextContent("14 IU today");
        expect(mine).toHaveTextContent("10 IU today");
        expect(within(mine).getByText("Basal")).toBeInTheDocument();
        expect(within(mine).getByRole("link", { name: /manage in profile/i })).toHaveAttribute(
            "href",
            "/profile"
        );
    });

    it("shows every dose in the table, newest first as served", async () => {
        await mountList();

        const body = within(table()).getAllByRole("row").slice(1);
        expect(body).toHaveLength(4);
        expect(screen.getByText("Showing 4 of 4")).toBeInTheDocument();
    });

    it("filters the table by insulin", async () => {
        const user = userEvent.setup();
        await mountList();
        const byInsulin = await screen.findByRole("group", { name: "Filter by insulin" });

        await user.click(within(byInsulin).getByRole("button", { name: "Tresiba" }));

        // Rows leave through auto-animate, which jsdom never finishes, so
        // count through the summary rather than the DOM.
        expect(screen.getByText("Showing 1 of 4")).toBeInTheDocument();
    });

    it("filters the table by tag", async () => {
        const user = userEvent.setup();
        await mountList();
        const byTag = screen.getByRole("group", { name: "Filter by tag" });

        await user.click(within(byTag).getByRole("button", { name: "Before meal" }));

        expect(screen.getByText("Showing 2 of 4")).toBeInTheDocument();
    });

    it("says so when the filters match nothing", async () => {
        const user = userEvent.setup();
        await mountList();
        const byTag = screen.getByRole("group", { name: "Filter by tag" });

        await user.click(within(byTag).getByRole("button", { name: "Fasting" }));

        expect(screen.getByText(/match the selected filters/i)).toBeInTheDocument();
    });

    it("refetches when the period changes", async () => {
        const user = userEvent.setup();
        await mountList();

        await user.click(screen.getByRole("button", { name: "30 days" }));

        await waitFor(() => expect(get).toHaveBeenCalledWith("/api/insulin/get/30"));
    });

    it("links each row to its edit page", async () => {
        await mountList();

        const edits = within(table()).getAllByRole("link", { name: "Edit" });
        expect(edits[0]).toHaveAttribute("href", "/insulin/i1");
    });

    it("deletes a dose after confirming what will be removed", async () => {
        const user = userEvent.setup();
        await mountList();

        await user.click(within(table()).getAllByRole("button", { name: "Delete" })[0]);
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveTextContent("Delete this dose?");
        expect(dialog).toHaveTextContent("8 IU NovoRapid");

        await user.click(within(dialog).getByRole("button", { name: "Delete" }));

        await waitFor(() => expect(del).toHaveBeenCalledWith("/api/insulin/delete/i1"));
        expect(notify).toHaveBeenCalledWith("Insulin data deleted!", "success");
    });

    it("opens the add form from Log dose", async () => {
        const user = userEvent.setup();
        await mountList();

        // Header button (desktop) and bottom bar (phones) both open it.
        await user.click(screen.getAllByRole("button", { name: "Log dose" })[0]);

        const dialog = screen.getByRole("dialog", { name: "Log insulin dose" });
        expect(within(dialog).getByRole("button", { name: /save dose/i })).toBeInTheDocument();
    });

    it("shows an empty day and an empty table", async () => {
        route([], []);
        await mountList();

        expect(screen.getAllByText("No doses logged today").length).toBeGreaterThan(0);
        expect(screen.getByText(/no insulin entries found/i)).toBeInTheDocument();
        expect(screen.getByText(/haven't added any insulins/i)).toBeInTheDocument();
    });

    it("reports a failed load", async () => {
        get.mockImplementation(() => Promise.reject(new Error("down")));
        renderWithProviders(<InsulinPage />);

        expect(await screen.findByText(/failed to load insulin data/i)).toBeInTheDocument();
    });
});

describe("insulin edit page", () => {
    const mountEdit = async () => {
        routeParams = { entryId: "i1" };
        renderWithProviders(<EditInsulin />);
        await waitFor(() =>
            expect(screen.getByRole("spinbutton")).toHaveValue(8)
        );
    };

    it("loads the entry into the form", async () => {
        await mountEdit();

        expect(get).toHaveBeenCalledWith("/api/insulin/get-one/i1");
        expect(screen.getByRole("radio", { name: "NovoRapid" })).toHaveAttribute(
            "aria-checked",
            "true"
        );
        expect(screen.getByRole("radio", { name: "Before meal" })).toHaveAttribute(
            "aria-checked",
            "true"
        );
        expect(screen.getByRole("link", { name: "Insulin" })).toHaveAttribute(
            "href",
            "/insulin"
        );
    });

    it("saves the edited dose, insulin and tag", async () => {
        const user = userEvent.setup();
        await mountEdit();

        await user.clear(screen.getByRole("spinbutton"));
        await user.type(screen.getByRole("spinbutton"), "9");
        await user.click(screen.getByRole("radio", { name: "Tresiba" }));
        // Clicking the chosen tag clears it.
        await user.click(screen.getByRole("radio", { name: "Before meal" }));
        await user.click(screen.getAllByRole("button", { name: /save changes/i })[0]);

        await waitFor(() => expect(put).toHaveBeenCalled());
        expect(put.mock.calls[0][0]).toBe("/api/insulin/update/i1");
        expect(put.mock.calls[0][1]).toMatchObject({
            units: "9",
            name: "Tresiba",
            tag: null,
        });
        expect((put.mock.calls[0][1] as any).createdAt).toMatch(/Z$/);
        expect(push).toHaveBeenCalledWith("/insulin/");
    });

    it("deletes the dose after confirming", async () => {
        const user = userEvent.setup();
        await mountEdit();

        await user.click(screen.getByRole("button", { name: "Delete dose" }));
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveTextContent("8 IU NovoRapid · Before meal");

        await user.click(within(dialog).getByRole("button", { name: "Delete" }));

        await waitFor(() => expect(del).toHaveBeenCalledWith("/api/insulin/delete/i1"));
        expect(push).toHaveBeenCalledWith("/insulin/");
    });
});
