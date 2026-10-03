import { beforeEach, describe, expect, it, vi } from "vitest";
import dayjs from "dayjs";
import { renderWithProviders, screen, userEvent, waitFor, within } from "@/test/render";

vi.mock("axios");
vi.mock("@/helpers/notify", () => ({ default: vi.fn() }));
vi.mock("@/helpers/entryLogged", () => ({ default: vi.fn() }));

// Recharts cannot lay out in jsdom.
vi.mock("recharts", async (importOriginal) => {
    const actual = await importOriginal<typeof import("recharts")>();
    return {
        ...actual,
        ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
    };
});

import axios from "axios";
import notify from "@/helpers/notify";
import entryLogged from "@/helpers/entryLogged";
import DiabetesDashboard from "./DiabetesDashboard";

const get = vi.mocked(axios.get);
const post = vi.mocked(axios.post);

const now = dayjs();
const iso = (d: dayjs.Dayjs) => d.toISOString();

const glucoseRows = [
    { _id: "g1", value: 126, createdAt: iso(now.subtract(5, "minute")), tag: "After meal" },
    { _id: "g2", value: 64, createdAt: iso(now.subtract(10, "minute")), tag: "Random" },
    { _id: "g3", value: 210, createdAt: iso(now.subtract(2, "day")), tag: null },
    { _id: "g4", value: 100, createdAt: iso(now.subtract(3, "day")), tag: null },
];
const insulinRows = [
    { _id: "i1", units: 8, name: "NovoRapid", createdAt: iso(now.subtract(20, "minute")), tag: "Before meal" },
    { _id: "i2", units: 10, name: "Tresiba", createdAt: iso(now.subtract(30, "minute")), tag: null },
    { _id: "i3", units: 12, name: "Tresiba", createdAt: iso(now.subtract(2, "day")), tag: null },
];
const weightRows = [
    { _id: "w1", value: 72.4, createdAt: iso(now.subtract(1, "minute")), tag: null },
    { _id: "w2", value: 74.3, createdAt: iso(now.subtract(29, "day")), tag: null },
];
const userInsulins = [
    { _id: "t1", name: "NovoRapid", createdAt: "" },
    { _id: "t2", name: "Tresiba", createdAt: "" },
];

beforeEach(() => {
    get.mockReset();
    post.mockReset();
    vi.mocked(notify).mockClear();
    vi.mocked(entryLogged).mockClear();
    get.mockImplementation((url: string) => {
        const data = url.includes("/glucose/")
            ? glucoseRows
            : url.includes("/insulin/")
              ? insulinRows
              : url.includes("/weight/")
                ? weightRows
                : url.includes("/users/get-insulin")
                  ? userInsulins
                  : [];
        return Promise.resolve({ status: 200, data: { data } });
    });
    post.mockResolvedValue({ status: 200, data: { message: "Saved!", data: {} } });
});

const urls = () => get.mock.calls.map((c) => String(c[0]));

describe("DiabetesDashboard", () => {
    it("fetches glucose and insulin for 7 days and weight for 30", async () => {
        renderWithProviders(<DiabetesDashboard />);

        await waitFor(() => expect(urls()).toContain("/api/weight/get/30"));
        expect(urls()).toContain("/api/glucose/get/7");
        expect(urls()).toContain("/api/insulin/get/7");
        // The trend card shares the hero's 7-day window rather than refetching it.
        expect(urls().filter((u) => u === "/api/glucose/get/7")).toHaveLength(1);
    });

    it("greets the user and shows today's date", () => {
        renderWithProviders(<DiabetesDashboard />);

        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/^Good (morning|afternoon|evening)/);
        expect(screen.getByText(now.format("dddd, D MMMM"))).toBeInTheDocument();
    });

    it("leads with the latest glucose reading and its status", async () => {
        renderWithProviders(<DiabetesDashboard />);

        const hero = (await screen.findByText("Latest glucose")).closest("section")!;
        await waitFor(() => expect(hero).toHaveTextContent("126mg/dL"));
        expect(within(hero).getByText("In range")).toBeInTheDocument();
        expect(within(hero).getByRole("link", { name: /glucose log/i })).toHaveAttribute("href", "/glucose");
    });

    it("shows current weight with a neutral 30-day change", async () => {
        renderWithProviders(<DiabetesDashboard />);

        const hero = screen.getByText("Current weight").closest("section")!;
        await waitFor(() => expect(hero).toHaveTextContent("72.4kg"));
        expect(hero).toHaveTextContent("1.9 kg in 30 days");
    });

    it("summarises time in range, today's insulin and the 7-day average", async () => {
        renderWithProviders(<DiabetesDashboard />);

        const strip = screen.getByLabelText("This week");
        // 126 and 100 in range, 64 low, 210 high.
        await waitFor(() => expect(strip).toHaveTextContent("50%"));
        expect(strip).toHaveTextContent("Low 25%");
        expect(strip).toHaveTextContent("High 25%");
        // Only today's doses: 8 + 10.
        expect(strip).toHaveTextContent("18IU");
        expect(strip).toHaveTextContent("Tresiba 10 · NovoRapid 8");
        // (126 + 64 + 210 + 100) / 4 = 125
        expect(strip).toHaveTextContent("125mg/dL");
        expect(within(strip).getByRole("link", { name: /Est\. HbA1c 6%/ })).toHaveAttribute("href", "/stats");
    });

    it("lists today's entries across metrics, newest first", async () => {
        renderWithProviders(<DiabetesDashboard />);

        const card = screen.getByRole("heading", { name: "Today" }).closest("section")!;
        await waitFor(() => expect(within(card).getAllByRole("listitem")).toHaveLength(5));
        const titles = within(card)
            .getAllByRole("listitem")
            .map((li) => li.querySelector(":scope > div > div")!.textContent);
        expect(titles).toEqual(["72.4 kg", "126 mg/dL", "64 mg/dL", "8 IU", "10 IU"]);
        expect(card).toHaveTextContent("5 entries");
        expect(within(card).getByText("Low")).toBeInTheDocument();
    });

    it("switches the trend period", async () => {
        const user = userEvent.setup();
        renderWithProviders(<DiabetesDashboard />);

        await user.click(screen.getByRole("button", { name: "30d" }));

        await waitFor(() => expect(urls()).toContain("/api/glucose/get/30"));
        expect(screen.getByRole("heading", { name: "Glucose · last 30 days" })).toBeInTheDocument();
    });

    it("surfaces a failed load", async () => {
        get.mockRejectedValue(new Error("boom"));
        renderWithProviders(<DiabetesDashboard />);

        expect(await screen.findByRole("alert")).toHaveTextContent(/failed to load/i);
    });

});

describe("Log entry sheet (mobile)", () => {
    const openSheet = async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(screen.getByRole("button", { name: "Log entry" }));
        const sheet = screen.getByRole("dialog", { name: "Log entry" });
        // Wait for the user's insulins, which decide whether a reading chains to a dose.
        await waitFor(() => expect(get.mock.calls.some((c) => String(c[0]).includes("/users/get-insulin"))).toBe(true));
        return sheet;
    };

    it("logs a reading then its dose without leaving the dashboard", async () => {
        const user = userEvent.setup();
        renderWithProviders(<DiabetesDashboard />);
        const sheet = await openSheet(user);

        expect(within(sheet).getByLabelText("Reading")).toHaveFocus();
        await user.type(within(sheet).getByLabelText("Reading"), "140");
        await user.click(within(sheet).getByRole("button", { name: /save reading/i }));

        await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
        expect(post.mock.calls[0][0]).toBe("/api/glucose/add");

        // Moved on to a dose, last-used insulin preselected, sheet still open.
        expect(await within(sheet).findByText(/reading saved/i)).toBeInTheDocument();
        expect(within(sheet).getByRole("button", { name: "Insulin" })).toHaveAttribute("aria-pressed", "true");
        expect(within(sheet).getByRole("radio", { name: "NovoRapid" })).toHaveAttribute("aria-checked", "true");

        await user.type(within(sheet).getByLabelText("Dose"), "6");
        await user.click(within(sheet).getByRole("button", { name: /save dose/i }));

        await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
        expect(post.mock.calls[1][0]).toBe("/api/insulin/add");
        expect(post.mock.calls[1][1]).toEqual({ units: "6", name: "NovoRapid", date: null, tag: null });
        expect(screen.getByRole("dialog", { name: "Log entry" })).toBeInTheDocument();
    });

    it("holds the entry-logged event until the sheet closes", async () => {
        const user = userEvent.setup();
        renderWithProviders(<DiabetesDashboard />);
        const sheet = await openSheet(user);

        await user.click(within(sheet).getByRole("button", { name: "Weight" }));
        await user.type(within(sheet).getByLabelText("Weight"), "72");
        await user.click(within(sheet).getByRole("button", { name: /save weight/i }));
        await waitFor(() => expect(post).toHaveBeenCalled());
        expect(entryLogged).not.toHaveBeenCalled();

        await user.click(within(sheet).getByRole("button", { name: "Done" }));

        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
        expect(entryLogged).toHaveBeenCalledTimes(1);
    });

    it("does not announce when closed without saving", async () => {
        const user = userEvent.setup();
        renderWithProviders(<DiabetesDashboard />);
        const sheet = await openSheet(user);

        await user.click(within(sheet).getByRole("button", { name: "Done" }));

        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
        expect(entryLogged).not.toHaveBeenCalled();
    });

    it("links to the full page for the selected type", async () => {
        const user = userEvent.setup();
        renderWithProviders(<DiabetesDashboard />);
        const sheet = await openSheet(user);

        const link = () => within(sheet).getByRole("link", { name: /backdate or see history/i });
        expect(link()).toHaveAttribute("href", "/glucose");
        await user.click(within(sheet).getByRole("button", { name: "Insulin" }));
        expect(link()).toHaveAttribute("href", "/insulin");
    });
});

describe("QuickLog", () => {
    const form = () => screen.getByRole("form", { name: "Quick log" });

    it("logs a glucose reading and shows its status live", async () => {
        const user = userEvent.setup();
        renderWithProviders(<DiabetesDashboard />);

        await user.type(within(form()).getByLabelText("Reading"), "210");
        expect(within(form()).getByText("High")).toBeInTheDocument();

        await user.selectOptions(within(form()).getByLabelText("Tag"), "After meal");
        await user.click(within(form()).getByRole("button", { name: /save reading/i }));

        await waitFor(() => expect(post).toHaveBeenCalled());
        expect(post.mock.calls[0][0]).toBe("/api/glucose/add");
        expect(post.mock.calls[0][1]).toEqual({ value: "210", date: null, tag: "After meal" });
        expect(notify).toHaveBeenCalledWith("Saved!", "success");
        expect(entryLogged).toHaveBeenCalled();
    });

    it("logs an insulin dose against the last-used insulin", async () => {
        const user = userEvent.setup();
        renderWithProviders(<DiabetesDashboard />);

        await user.click(within(form()).getByRole("button", { name: "Insulin" }));
        // Newest dose today is NovoRapid.
        await waitFor(() =>
            expect(within(form()).getByRole("radio", { name: "NovoRapid" })).toHaveAttribute("aria-checked", "true")
        );
        await user.click(within(form()).getByRole("radio", { name: "Tresiba" }));
        await user.type(within(form()).getByLabelText("Dose"), "10");
        await user.click(within(form()).getByRole("button", { name: /save dose/i }));

        await waitFor(() => expect(post).toHaveBeenCalled());
        expect(post.mock.calls[0][0]).toBe("/api/insulin/add");
        expect(post.mock.calls[0][1]).toEqual({ units: "10", name: "Tresiba", date: null, tag: null });
    });

    it("sends an explicit time only once it is edited", async () => {
        const user = userEvent.setup();
        renderWithProviders(<DiabetesDashboard />);

        await user.click(within(form()).getByRole("button", { name: "Weight" }));
        await user.type(within(form()).getByLabelText("Weight"), "72.4");
        const time = within(form()).getByLabelText("Time");
        await user.clear(time);
        await user.type(time, "07:30");
        await user.click(within(form()).getByRole("button", { name: /save weight/i }));

        await waitFor(() => expect(post).toHaveBeenCalled());
        expect(post.mock.calls[0][0]).toBe("/api/weight/add");
        const sent = post.mock.calls[0][1] as any;
        expect(dayjs(sent.date).format("HH:mm")).toBe("07:30");
        expect(sent.value).toBe("72.4");
    });

    it("reports a failed save", async () => {
        const user = userEvent.setup();
        post.mockRejectedValue(new Error("nope"));
        renderWithProviders(<DiabetesDashboard />);

        await user.type(within(form()).getByLabelText("Reading"), "100");
        await user.click(within(form()).getByRole("button", { name: /save reading/i }));

        await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.any(String), "error"));
    });
});
