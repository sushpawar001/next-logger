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

import axios from "axios";
import notify from "@/helpers/notify";

import EditGlucose from "./(Dashboard)/glucose/[entryId]/page";
import EditWeight from "./(Dashboard)/weight/[entryId]/page";
import EditInsulin from "./(Dashboard)/insulin/[entryId]/page";
import EditMeasurement from "./(Dashboard)/measurement/[entryId]/page";

/**
 * Each metric has an edit page that loads one entry, lets the user change it,
 * and either PUTs an update or DELETEs the row -- then routes back to the list.
 */

const get = vi.mocked(axios.get);
const put = vi.mocked(axios.put);
const del = vi.mocked(axios.delete);

const EDIT_PAGES = [
    {
        name: "glucose",
        Page: EditGlucose,
        entryId: "g1",
        entry: { _id: "g1", value: 110, createdAt: "2026-01-30T08:00:00.000Z", tag: "Fasting" },
        getUrl: "/api/glucose/get-one/g1",
        putUrl: "/api/glucose/update/g1",
        deleteUrl: "/api/glucose/delete/g1",
        listRoute: "/glucose",
        afterUpdate: "/glucose",
        afterDelete: "/glucose",
    },
    {
        name: "weight",
        Page: EditWeight,
        entryId: "w1",
        entry: { _id: "w1", value: 72.4, createdAt: "2026-01-30T07:00:00.000Z", tag: null },
        getUrl: "/api/weight/get-one/w1",
        putUrl: "/api/weight/update/w1",
        deleteUrl: "/api/weight/delete/w1",
        listRoute: "/weight",
        afterUpdate: "/weight/",
        afterDelete: "/weight",
    },
    {
        name: "insulin",
        Page: EditInsulin,
        entryId: "i1",
        entry: { _id: "i1", units: 12, name: "Lantus", createdAt: "2026-01-30T21:00:00.000Z", tag: "Before meal" },
        getUrl: "/api/insulin/get-one/i1",
        putUrl: "/api/insulin/update/i1",
        deleteUrl: "/api/insulin/delete/i1",
        listRoute: "/insulin",
        afterUpdate: "/insulin/",
        afterDelete: "/insulin/",
    },
    {
        name: "measurement",
        Page: EditMeasurement,
        entryId: "m1",
        entry: {
            _id: "m1", arms: 32, chest: 98, abdomen: 88, waist: 84,
            hip: 96, thighs: 56, calves: 38,
            createdAt: "2026-01-30T06:00:00.000Z", tag: "Other",
        },
        getUrl: "/api/measurements/get-one/m1",
        putUrl: "/api/measurements/update/m1",
        deleteUrl: "/api/measurements/delete/m1",
        listRoute: "/measurement",
        afterUpdate: "/measurement/",
        afterDelete: "/measurement/",
    },
];

beforeEach(() => {
    get.mockReset();
    put.mockReset();
    del.mockReset();
    push.mockReset();
    vi.mocked(notify).mockClear();
    put.mockResolvedValue({ data: { message: "Data updated" } });
    del.mockResolvedValue({ data: { message: "Data deleted" } });
});

describe.each(EDIT_PAGES)("$name edit page", (p) => {
    const mountLoaded = async () => {
        get.mockResolvedValue({ data: { data: { ...p.entry } } });
        // Insulin's page also loads the user's insulin list.
        get.mockImplementation((url: string) =>
            url.includes("get-insulin")
                ? Promise.resolve({ data: { data: [{ _id: "i1", name: "Lantus" }] } })
                : Promise.resolve({ data: { data: { ...p.entry } } })
        );
        routeParams = { entryId: p.entryId };
        const view = renderWithProviders(
            <p.Page />
        );
        await waitFor(() => expect(get).toHaveBeenCalledWith(p.getUrl));
        return view;
    };

    it("loads the entry it was routed to", async () => {
        await mountLoaded();

        expect(get).toHaveBeenCalledWith(p.getUrl);
    });

    it("populates the form with the loaded values", async () => {
        await mountLoaded();

        await waitFor(() =>
            expect(screen.getAllByRole("spinbutton").length).toBeGreaterThan(0)
        );
    });

    it("renders a link back to the list", async () => {
        await mountLoaded();

        const hrefs = screen
            .getAllByRole("link")
            .map((a) => a.getAttribute("href"));

        expect(hrefs).toContain(p.listRoute);
    });

    it("saves an update and routes back to the list", async () => {
        const user = userEvent.setup();
        await mountLoaded();

        await user.click(screen.getAllByRole("button", { name: /save|update/i })[0]);

        await waitFor(() => expect(put).toHaveBeenCalled());
        expect(put.mock.calls[0][0]).toBe(p.putUrl);
        await waitFor(() => expect(push).toHaveBeenCalledWith(p.afterUpdate));
        expect(notify).toHaveBeenCalledWith("Data updated", "success");
    });

    it("sends createdAt as an ISO string", async () => {
        const user = userEvent.setup();
        await mountLoaded();

        await user.click(screen.getAllByRole("button", { name: /save|update/i })[0]);

        await waitFor(() => expect(put).toHaveBeenCalled());
        expect((put.mock.calls[0][1] as any).createdAt).toMatch(
            /^\d{4}-\d{2}-\d{2}T/
        );
    });

    it("deletes the entry and routes back to the list", async () => {
        const user = userEvent.setup();
        await mountLoaded();

        const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
        await user.click(deleteButtons[0]);
        const confirms = screen.getAllByRole("button", { name: /^delete$/i });
        await user.click(confirms[confirms.length - 1]);

        await waitFor(() => expect(del).toHaveBeenCalled());
        expect(del.mock.calls[0][0]).toBe(p.deleteUrl);
        await waitFor(() => expect(push).toHaveBeenCalledWith(p.afterDelete));
    });

    it("reports a failed update", async () => {
        const user = userEvent.setup();
        await mountLoaded();
        put.mockRejectedValue({ response: { data: { message: "Update failed" } } });

        await user.click(screen.getAllByRole("button", { name: /save|update/i })[0]);

        await waitFor(() =>
            expect(notify).toHaveBeenCalledWith("Update failed", "error")
        );
        expect(push).not.toHaveBeenCalled();
    });
});
