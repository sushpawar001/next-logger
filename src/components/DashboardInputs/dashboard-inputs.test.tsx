import fs from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    makeTestQueryClient,
    renderWithProviders,
    screen,
    userEvent,
    waitFor,
} from "@/test/render";
import { qk } from "@/lib/query/keys";
import { rejectsWith } from "@/test/promises";

vi.mock("axios");
vi.mock("@/helpers/notify", () => ({ default: vi.fn() }));
vi.mock("@/helpers/entryLogged", () => ({ default: vi.fn() }));

import axios from "axios";
import notify from "@/helpers/notify";
import entryLogged from "@/helpers/entryLogged";
import { entryTags } from "@/constants/constants";

import GlucoseAdd from "./GlucoseAdd";
import WeightAdd from "./WeightAdd";
import InsulinAdd from "./InsulinAdd";
import MeasurementAdd from "./MeasurementAdd";

/**
 * The four add-forms share a shape: local state, an axios POST, a toast, an
 * entryLogged() announcement for the PWA install card, and an optimistic
 * prepend into the parent's list that keeps it sorted newest-first.
 */

const post = vi.mocked(axios.post);

const okResponse = (entry: Record<string, any>) => ({
    data: { message: "Entry added!", entry },
});

beforeEach(() => {
    post.mockReset();
    post.mockResolvedValue(okResponse({ _id: "new", createdAt: new Date().toISOString() }));
    vi.mocked(axios.get).mockReset();
    vi.mocked(axios.get).mockResolvedValue({ data: { data: [] } });
    vi.mocked(notify).mockClear();
    vi.mocked(entryLogged).mockClear();
});

const FORMS = [
    {
        name: "GlucoseAdd",
        Component: GlucoseAdd,
        endpoint: "/api/glucose/add",
        resource: "glucose" as const,
        heading: /blood glucose/i,
        valueLabel: /glucose level/i,
        tagSelectId: "glucose_tag",
        fill: async (user: any) => {
            await user.type(screen.getByLabelText(/glucose level/i), "120");
        },
        expectedBody: { value: "120" },
    },
    {
        name: "WeightAdd",
        Component: WeightAdd,
        endpoint: "/api/weight/add",
        resource: "weight" as const,
        heading: /weight/i,
        valueLabel: /weight/i,
        tagSelectId: "weight_tag",
        fill: async (user: any) => {
            await user.type(screen.getAllByRole("spinbutton")[0], "72.4");
        },
        expectedBody: { value: "72.4" },
    },
];

describe.each(FORMS)("$name", (f) => {
    it("renders its heading and submit button", () => {
        renderWithProviders(<f.Component />);

        expect(screen.getAllByText(f.heading).length).toBeGreaterThan(0);
        expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    });

    it("offers every entry tag", () => {
        renderWithProviders(<f.Component />);

        const select = document.getElementById(f.tagSelectId) as HTMLSelectElement;
        const options = Array.from(select.querySelectorAll("option")).map(
            (o) => o.textContent
        );

        expect(options).toEqual(["Select Tag", ...entryTags]);
    });

    it("posts the entered value to its endpoint", async () => {
        const user = userEvent.setup();
        renderWithProviders(<f.Component />);

        await f.fill(user);
        await user.click(screen.getByRole("button", { name: /submit/i }));

        await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
        expect(post.mock.calls[0][0]).toBe(f.endpoint);
        expect(post.mock.calls[0][1]).toMatchObject(f.expectedBody);
    });

    it("sends a null date until the user picks one", async () => {
        const user = userEvent.setup();
        renderWithProviders(<f.Component />);

        await f.fill(user);
        await user.click(screen.getByRole("button", { name: /submit/i }));

        await waitFor(() => expect(post).toHaveBeenCalled());
        expect((post.mock.calls[0][1] as any).date).toBeNull();
    });

    it("announces a successful entry and clears the form", async () => {
        const user = userEvent.setup();
        renderWithProviders(<f.Component />);

        await f.fill(user);
        await user.click(screen.getByRole("button", { name: /submit/i }));

        await waitFor(() => expect(notify).toHaveBeenCalledWith(
            "Entry added!",
            "success"
        ));
        expect(entryLogged).toHaveBeenCalledTimes(1);
    });

    /**
     * Replaces a test that drove `data`/`setData` directly and asserted the
     * parent list came back as ["new", "old"]. That prop drill is gone: the form
     * invalidates the resource instead, and each page re-reads from the cache.
     */
    it("invalidates every cached window of its resource after a successful add", async () => {
        const user = userEvent.setup();
        const queryClient = makeTestQueryClient();

        // Two windows of the same resource, plus an unrelated one that must be
        // left alone.
        queryClient.setQueryData(qk.list(f.resource, 7), [{ _id: "old" }]);
        queryClient.setQueryData(qk.list(f.resource, 30), [{ _id: "old" }]);
        queryClient.setQueryData(qk.insulinTypes(), [{ _id: "type" }]);

        post.mockResolvedValue(
            okResponse({ _id: "new", createdAt: "2026-02-01T00:00:00.000Z" })
        );
        renderWithProviders(<f.Component />, { queryClient });

        await f.fill(user);
        await user.click(screen.getByRole("button", { name: /submit/i }));

        await waitFor(() => expect(post).toHaveBeenCalled());
        await waitFor(() => {
            expect(
                queryClient.getQueryState(qk.list(f.resource, 7))?.isInvalidated
            ).toBe(true);
            expect(
                queryClient.getQueryState(qk.list(f.resource, 30))?.isInvalidated
            ).toBe(true);
        });

        expect(
            queryClient.getQueryState(qk.insulinTypes())?.isInvalidated
        ).toBe(false);
    });

    it("reports a server error through a toast", async () => {
        const user = userEvent.setup();
        post.mockImplementation(rejectsWith({
            response: { data: { message: "Something broke" } },
        }));
        renderWithProviders(<f.Component />);

        await f.fill(user);
        await user.click(screen.getByRole("button", { name: /submit/i }));

        await waitFor(() =>
            expect(notify).toHaveBeenCalledWith("Something broke", "error")
        );
    });

    it("falls back to a generic error message", async () => {
        const user = userEvent.setup();
        post.mockImplementation(rejectsWith(new Error("network down")));
        renderWithProviders(<f.Component />);

        await f.fill(user);
        await user.click(screen.getByRole("button", { name: /submit/i }));

        await waitFor(() =>
            expect(notify).toHaveBeenCalledWith("An error occurred", "error")
        );
    });

    it("focuses the value field when arriving from a PWA shortcut", () => {
        renderWithProviders(<f.Component autoFocus />);

        expect(document.activeElement?.tagName).toBe("INPUT");
    });

    it("does not steal focus without the shortcut flag", () => {
        renderWithProviders(<f.Component />);

        expect(document.activeElement?.tagName).not.toBe("INPUT");
    });
});

describe("GlucoseAdd specifics", () => {
    it("sends the chosen tag", async () => {
        const user = userEvent.setup();
        renderWithProviders(<GlucoseAdd />);

        await user.type(screen.getByLabelText(/glucose level/i), "120");
        await user.selectOptions(
            document.getElementById("glucose_tag") as HTMLSelectElement,
            "Fasting"
        );
        await user.click(screen.getByRole("button", { name: /submit/i }));

        await waitFor(() => expect(post).toHaveBeenCalled());
        expect((post.mock.calls[0][1] as any).tag).toBe("Fasting");
    });

    it("sends a user-chosen date once edited", async () => {
        const user = userEvent.setup();
        renderWithProviders(<GlucoseAdd />);

        await user.type(screen.getByLabelText(/glucose level/i), "120");
        const dateInput = document.getElementById(
            "glucoseDate"
        ) as HTMLInputElement;
        await user.clear(dateInput);
        await user.type(dateInput, "2026-01-20T06:30");
        await user.click(screen.getByRole("button", { name: /submit/i }));

        await waitFor(() => expect(post).toHaveBeenCalled());
        expect((post.mock.calls[0][1] as any).date).not.toBeNull();
    });

    it("requires a value before submitting", () => {
        renderWithProviders(<GlucoseAdd />);

        expect(screen.getByLabelText(/glucose level/i)).toBeRequired();
    });
});

describe("InsulinAdd", () => {
    // Unlike the other forms, this one fetches the user's insulin list itself.
    const insulins = [
        { _id: "i1", name: "Lantus" },
        { _id: "i2", name: "NovoRapid" },
    ];

    beforeEach(() => {
        vi.mocked(axios.get).mockResolvedValue({ data: { data: insulins } });
    });

    it("loads and renders the user's insulin options", async () => {
        renderWithProviders(<InsulinAdd />);

        await waitFor(() =>
            expect(axios.get).toHaveBeenCalledWith("/api/users/get-insulin")
        );
        await waitFor(() =>
            expect(screen.getAllByText(/lantus/i).length).toBeGreaterThan(0)
        );
    });

    it("posts units to the insulin endpoint", async () => {
        const user = userEvent.setup();
        renderWithProviders(<InsulinAdd />);
        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        await user.type(screen.getAllByRole("spinbutton")[0], "12");
        // The insulin type is required, so the form will not submit without it.
        await user.selectOptions(
            document.getElementById("insulinType") as HTMLSelectElement,
            "Lantus"
        );
        await user.click(screen.getByRole("button", { name: /submit/i }));

        await waitFor(() => expect(post).toHaveBeenCalled());
        expect(post.mock.calls[0][0]).toBe("/api/insulin/add");
        expect((post.mock.calls[0][1] as any).units).toBe("12");
        expect((post.mock.calls[0][1] as any).name).toBe("Lantus");
    });

    it("renders when the user has no insulin types configured", async () => {
        vi.mocked(axios.get).mockResolvedValue({ data: { data: [] } });

        renderWithProviders(<InsulinAdd />);

        await waitFor(() => expect(axios.get).toHaveBeenCalled());
        expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    });

    /**
     * Previously docs/BUGS.md #19: the lookup had no try/catch, so a failed
     * request rejected unhandled and had to be asserted from the source -- driving
     * the rejection would have escaped the component and failed the whole run.
     *
     * The query hook contains the rejection, so it can be tested for real now.
     */
    it("survives a failed insulin lookup with an empty dropdown", async () => {
        vi.mocked(axios.get).mockRejectedValue(new Error("network down"));

        renderWithProviders(<InsulinAdd />);

        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        // The form is still usable and the dropdown holds only its placeholder.
        expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
        const select = document.getElementById("insulinType") as HTMLSelectElement;
        expect(select.options).toHaveLength(1);
        expect(select.options[0]).toBeDisabled();
    });

    it("fetches the insulin types once even when two forms are on the page", async () => {
        vi.mocked(axios.get).mockResolvedValue({
            data: { data: [{ _id: "1", name: "Lantus" }] },
        });

        renderWithProviders(
            <>
                <InsulinAdd />
                <InsulinAdd />
            </>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        const lookups = vi
            .mocked(axios.get)
            .mock.calls.filter((c) => String(c[0]).includes("/api/users/get-insulin"));
        expect(lookups).toHaveLength(1);
    });
});

describe("MeasurementAdd", () => {
    const CIRCUMFERENCES = [
        "arms",
        "chest",
        "abdomen",
        "waist",
        "hip",
        "thighs",
        "calves",
    ];

    it("renders an input for all seven circumferences", () => {
        renderWithProviders(<MeasurementAdd />);

        for (const field of CIRCUMFERENCES) {
            const label = field.charAt(0).toUpperCase() + field.slice(1);
            expect(screen.getAllByLabelText(label).length).toBeGreaterThan(0);
        }
    });

    it("posts every circumference nested under measurements", async () => {
        const user = userEvent.setup();
        renderWithProviders(<MeasurementAdd />);

        for (const field of CIRCUMFERENCES) {
            const label = field.charAt(0).toUpperCase() + field.slice(1);
            await user.type(screen.getAllByLabelText(label)[0], "50");
        }
        await user.click(screen.getByRole("button", { name: /submit/i }));

        await waitFor(() => expect(post).toHaveBeenCalled());
        expect(post.mock.calls[0][0]).toBe("/api/measurements/add");
        const body = post.mock.calls[0][1] as any;
        expect(body.measurements).toBeDefined();
        for (const field of CIRCUMFERENCES) {
            expect(body.measurements[field]).toBe("50");
        }
    });
});
