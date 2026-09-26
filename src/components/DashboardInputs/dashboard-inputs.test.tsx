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
    // GlucoseAdd moved to its own describe block below: it is a bare A1 form
    // ("Save reading", live status badge) rendered inside the Log glucose dialog.
    // WeightAdd moved to its own describe block below: it is an A1 form
    // (tag chips, "Save weight") rather than the select + Submit shape.
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

describe("GlucoseAdd", () => {
    const valueInput = () => screen.getByLabelText(/glucose reading/i);
    const save = () => screen.getByRole("button", { name: /save reading/i });
    const fill = async (user: any, value = "120") => {
        await user.type(valueInput(), value);
    };

    it("renders a required reading field in mg/dL and a save button", () => {
        renderWithProviders(<GlucoseAdd />);

        expect(valueInput()).toBeRequired();
        expect(screen.getByText("mg/dL")).toBeInTheDocument();
        expect(save()).toBeInTheDocument();
    });

    it("offers every entry tag", () => {
        renderWithProviders(<GlucoseAdd />);

        const select = document.getElementById("glucose_tag") as HTMLSelectElement;
        const options = Array.from(select.querySelectorAll("option")).map(
            (o) => o.textContent
        );

        expect(options).toEqual(["Select Tag", ...entryTags]);
    });

    it.each([
        ["120", "In range"],
        ["200", "High"],
        ["60", "Low"],
    ])("shows the status of %s mg/dL live", async (value, label) => {
        const user = userEvent.setup();
        renderWithProviders(<GlucoseAdd />);

        await fill(user, value);

        expect(screen.getByText(label)).toBeInTheDocument();
    });

    it("posts the entered value to its endpoint", async () => {
        const user = userEvent.setup();
        renderWithProviders(<GlucoseAdd />);

        await fill(user);
        await user.click(save());

        await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
        expect(post.mock.calls[0][0]).toBe("/api/glucose/add");
        expect(post.mock.calls[0][1]).toMatchObject({ value: "120" });
    });

    it("sends a null date and tag until the user picks them", async () => {
        const user = userEvent.setup();
        renderWithProviders(<GlucoseAdd />);

        await fill(user);
        await user.click(save());

        await waitFor(() => expect(post).toHaveBeenCalled());
        expect((post.mock.calls[0][1] as any).date).toBeNull();
        expect((post.mock.calls[0][1] as any).tag).toBeNull();
    });

    it("sends the chosen tag", async () => {
        const user = userEvent.setup();
        renderWithProviders(<GlucoseAdd />);

        await fill(user);
        await user.selectOptions(
            document.getElementById("glucose_tag") as HTMLSelectElement,
            "Fasting"
        );
        await user.click(save());

        await waitFor(() => expect(post).toHaveBeenCalled());
        expect((post.mock.calls[0][1] as any).tag).toBe("Fasting");
    });

    it("sends a user-chosen date once edited", async () => {
        const user = userEvent.setup();
        renderWithProviders(<GlucoseAdd />);

        await fill(user);
        const dateInput = document.getElementById(
            "glucoseDate"
        ) as HTMLInputElement;
        await user.clear(dateInput);
        await user.type(dateInput, "2026-01-20T06:30");
        await user.click(save());

        await waitFor(() => expect(post).toHaveBeenCalled());
        expect((post.mock.calls[0][1] as any).date).not.toBeNull();
    });

    it("announces a successful entry, clears the form and calls onSaved", async () => {
        const user = userEvent.setup();
        const onSaved = vi.fn();
        renderWithProviders(<GlucoseAdd onSaved={onSaved} />);

        await fill(user);
        await user.click(save());

        await waitFor(() =>
            expect(notify).toHaveBeenCalledWith("Entry added!", "success")
        );
        expect(entryLogged).toHaveBeenCalledTimes(1);
        expect(onSaved).toHaveBeenCalledTimes(1);
        expect((valueInput() as HTMLInputElement).value).toBe("");
    });

    it("invalidates every cached window of glucose after a successful add", async () => {
        const user = userEvent.setup();
        const queryClient = makeTestQueryClient();
        queryClient.setQueryData(qk.list("glucose", 7), [{ _id: "old" }]);
        queryClient.setQueryData(qk.list("glucose", 30), [{ _id: "old" }]);
        queryClient.setQueryData(qk.insulinTypes(), [{ _id: "type" }]);
        renderWithProviders(<GlucoseAdd />, { queryClient });

        await fill(user);
        await user.click(save());

        await waitFor(() => {
            expect(
                queryClient.getQueryState(qk.list("glucose", 7))?.isInvalidated
            ).toBe(true);
            expect(
                queryClient.getQueryState(qk.list("glucose", 30))?.isInvalidated
            ).toBe(true);
        });
        expect(queryClient.getQueryState(qk.insulinTypes())?.isInvalidated).toBe(
            false
        );
    });

    it("reports a server error and keeps the form open", async () => {
        const user = userEvent.setup();
        const onSaved = vi.fn();
        post.mockImplementation(
            rejectsWith({ response: { data: { message: "Something broke" } } })
        );
        renderWithProviders(<GlucoseAdd onSaved={onSaved} />);

        await fill(user);
        await user.click(save());

        await waitFor(() =>
            expect(notify).toHaveBeenCalledWith("Something broke", "error")
        );
        expect(onSaved).not.toHaveBeenCalled();
    });

    it("falls back to a generic error message", async () => {
        const user = userEvent.setup();
        post.mockImplementation(rejectsWith(new Error("network down")));
        renderWithProviders(<GlucoseAdd />);

        await fill(user);
        await user.click(save());

        await waitFor(() =>
            expect(notify).toHaveBeenCalledWith("An error occurred", "error")
        );
    });

    it("focuses the value field when arriving from a PWA shortcut", () => {
        renderWithProviders(<GlucoseAdd autoFocus />);

        expect(document.activeElement).toBe(valueInput());
    });

    it("does not steal focus without the shortcut flag", () => {
        renderWithProviders(<GlucoseAdd />);

        expect(document.activeElement?.tagName).not.toBe("INPUT");
    });
});

describe("InsulinAdd", () => {
    // Unlike the other forms, this one fetches the user's insulin list itself.
    const insulins = [
        { _id: "i1", name: "Lantus" },
        { _id: "i2", name: "NovoRapid" },
    ];
    const save = () => screen.getByRole("button", { name: /save dose/i });

    beforeEach(() => {
        vi.mocked(axios.get).mockResolvedValue({ data: { data: insulins } });
    });

    it("loads the user's insulins as radio chips", async () => {
        renderWithProviders(<InsulinAdd />);

        await waitFor(() =>
            expect(axios.get).toHaveBeenCalledWith("/api/users/get-insulin")
        );
        expect(await screen.findByRole("radio", { name: "Lantus" })).toHaveAttribute(
            "aria-checked",
            "false"
        );
        expect(screen.getByRole("radio", { name: "NovoRapid" })).toBeInTheDocument();
    });

    it("links to the profile to add an insulin", () => {
        renderWithProviders(<InsulinAdd />);

        expect(screen.getByRole("link", { name: /add insulin/i })).toHaveAttribute(
            "href",
            "/profile"
        );
    });

    it("posts units and the chosen insulin to the insulin endpoint", async () => {
        const user = userEvent.setup();
        renderWithProviders(<InsulinAdd />);

        await user.type(screen.getByRole("spinbutton"), "12");
        await user.click(await screen.findByRole("radio", { name: "Lantus" }));
        await user.selectOptions(
            document.getElementById("insulin_tag") as HTMLSelectElement,
            "Before meal"
        );
        await user.click(save());

        await waitFor(() => expect(post).toHaveBeenCalled());
        expect(post.mock.calls[0][0]).toBe("/api/insulin/add");
        expect(post.mock.calls[0][1]).toMatchObject({
            units: "12",
            name: "Lantus",
            tag: "Before meal",
            date: null,
        });
        expect(notify).toHaveBeenCalledWith("Entry added!", "success");
        expect(entryLogged).toHaveBeenCalledTimes(1);
    });

    it("refuses to save without an insulin chosen", async () => {
        const user = userEvent.setup();
        renderWithProviders(<InsulinAdd />);
        await screen.findByRole("radio", { name: "Lantus" });

        await user.type(screen.getByRole("spinbutton"), "12");
        await user.click(save());

        expect(notify).toHaveBeenCalledWith("Choose which insulin you took.", "error");
        expect(post).not.toHaveBeenCalled();
    });

    it("preselects the only insulin when there is just one", async () => {
        const user = userEvent.setup();
        vi.mocked(axios.get).mockResolvedValue({
            data: { data: [{ _id: "i1", name: "Tresiba" }] },
        });
        renderWithProviders(<InsulinAdd />);

        expect(await screen.findByRole("radio", { name: "Tresiba" })).toHaveAttribute(
            "aria-checked",
            "true"
        );
        await user.type(screen.getByRole("spinbutton"), "10");
        await user.click(save());

        await waitFor(() => expect(post).toHaveBeenCalled());
        expect((post.mock.calls[0][1] as any).name).toBe("Tresiba");
    });

    it("calls onSaved after a successful save", async () => {
        const user = userEvent.setup();
        const onSaved = vi.fn();
        renderWithProviders(<InsulinAdd onSaved={onSaved} />);

        await user.type(screen.getByRole("spinbutton"), "6");
        await user.click(await screen.findByRole("radio", { name: "NovoRapid" }));
        await user.click(save());

        await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    });

    it("does not call onSaved when the save fails", async () => {
        const user = userEvent.setup();
        const onSaved = vi.fn();
        post.mockImplementation(rejectsWith({
            response: { data: { message: "Something broke" } },
        }));
        renderWithProviders(<InsulinAdd onSaved={onSaved} />);

        await user.type(screen.getByRole("spinbutton"), "6");
        await user.click(await screen.findByRole("radio", { name: "NovoRapid" }));
        await user.click(save());

        await waitFor(() =>
            expect(notify).toHaveBeenCalledWith("Something broke", "error")
        );
        expect(onSaved).not.toHaveBeenCalled();
    });

    it("offers every entry tag", () => {
        renderWithProviders(<InsulinAdd />);

        const select = document.getElementById("insulin_tag") as HTMLSelectElement;
        expect(Array.from(select.options).map((o) => o.textContent)).toEqual([
            "Select Tag",
            ...entryTags,
        ]);
    });

    it("focuses the dose field when arriving from a PWA shortcut", () => {
        renderWithProviders(<InsulinAdd autoFocus />);

        expect(document.activeElement).toBe(screen.getByRole("spinbutton"));
    });

    it("explains what to do when the user has no insulin types configured", async () => {
        vi.mocked(axios.get).mockResolvedValue({ data: { data: [] } });

        renderWithProviders(<InsulinAdd />);

        await waitFor(() => expect(axios.get).toHaveBeenCalled());
        expect(screen.getByText(/no insulins yet/i)).toBeInTheDocument();
        expect(save()).toBeInTheDocument();
    });

    /**
     * Previously docs/BUGS.md #19: the lookup had no try/catch, so a failed
     * request rejected unhandled and had to be asserted from the source -- driving
     * the rejection would have escaped the component and failed the whole run.
     *
     * The query hook contains the rejection, so it can be tested for real now.
     */
    it("survives a failed insulin lookup with no insulin choices", async () => {
        vi.mocked(axios.get).mockRejectedValue(new Error("network down"));

        renderWithProviders(<InsulinAdd />);

        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        // The form is still usable and offers no insulin to pick.
        expect(save()).toBeInTheDocument();
        expect(screen.queryAllByRole("radio")).toHaveLength(0);
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
        await user.click(screen.getByRole("button", { name: /save measurements/i }));

        await waitFor(() => expect(post).toHaveBeenCalled());
        expect(post.mock.calls[0][0]).toBe("/api/measurements/add");
        const body = post.mock.calls[0][1] as any;
        expect(body.measurements).toBeDefined();
        for (const field of CIRCUMFERENCES) {
            expect(body.measurements[field]).toBe("50");
        }
    });

    const fillAll = async (user: any) => {
        for (const field of CIRCUMFERENCES) {
            const label = field.charAt(0).toUpperCase() + field.slice(1);
            await user.type(screen.getByLabelText(label), "40");
        }
    };

    it("sends the picked tag and clears the form after saving", async () => {
        const user = userEvent.setup();
        const onSaved = vi.fn();
        renderWithProviders(<MeasurementAdd onSaved={onSaved} />);

        await fillAll(user);
        await user.click(screen.getByRole("radio", { name: "Fasting" }));
        await user.click(screen.getByRole("button", { name: /save measurements/i }));

        await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
        expect((post.mock.calls[0][1] as any).tag).toBe("Fasting");
        expect(entryLogged).toHaveBeenCalled();
        expect((screen.getByLabelText("Waist") as HTMLInputElement).value).toBe("");
        expect(screen.getByRole("radio", { name: "Fasting" })).toHaveAttribute(
            "aria-checked",
            "false"
        );
    });

    it("keeps the dialog open when the save fails", async () => {
        const user = userEvent.setup();
        const onSaved = vi.fn();
        post.mockImplementation(rejectsWith(new Error("boom")));
        renderWithProviders(<MeasurementAdd onSaved={onSaved} />);

        await fillAll(user);
        await user.click(screen.getByRole("button", { name: /save measurements/i }));

        await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.anything(), "error"));
        expect(onSaved).not.toHaveBeenCalled();
    });

    it("clears every field on Clear", async () => {
        const user = userEvent.setup();
        renderWithProviders(<MeasurementAdd />);

        await user.type(screen.getByLabelText("Arms"), "33");
        await user.click(screen.getByRole("button", { name: "Clear" }));

        expect((screen.getByLabelText("Arms") as HTMLInputElement).value).toBe("");
    });

    it("focuses the first field when opened from a shortcut", () => {
        renderWithProviders(<MeasurementAdd autoFocus />);

        expect(screen.getByLabelText("Arms")).toHaveFocus();
    });
});

describe("WeightAdd", () => {
    const save = () => screen.getByRole("button", { name: /save weight/i });
    const fill = async (user: any) => {
        await user.type(screen.getByLabelText("Weight"), "72.4");
    };

    it("renders a labelled kg field and a save button", () => {
        renderWithProviders(<WeightAdd />);

        expect(screen.getByLabelText("Weight")).toHaveAttribute("type", "number");
        expect(screen.getByText("kg")).toBeInTheDocument();
        expect(save()).toBeInTheDocument();
    });

    it("offers every entry tag as a single-choice chip", () => {
        renderWithProviders(<WeightAdd />);

        const group = screen.getByRole("radiogroup", { name: "Tag" });
        expect(
            Array.from(group.querySelectorAll('[role="radio"]')).map((r) => r.textContent)
        ).toEqual(entryTags);
    });

    it("posts the entered value, tag and a null date", async () => {
        const user = userEvent.setup();
        renderWithProviders(<WeightAdd />);

        await fill(user);
        await user.click(screen.getByRole("radio", { name: "Fasting" }));
        await user.click(save());

        await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
        expect(post.mock.calls[0][0]).toBe("/api/weight/add");
        expect(post.mock.calls[0][1]).toMatchObject({
            value: "72.4",
            tag: "Fasting",
            date: null,
        });
    });

    it("clears a tag when its chip is clicked again", async () => {
        const user = userEvent.setup();
        renderWithProviders(<WeightAdd />);

        const chip = screen.getByRole("radio", { name: "Fasting" });
        await user.click(chip);
        expect(chip).toHaveAttribute("aria-checked", "true");
        await user.click(chip);
        expect(chip).toHaveAttribute("aria-checked", "false");
    });

    it("announces a successful entry, clears the form and calls onSaved", async () => {
        const user = userEvent.setup();
        const onSaved = vi.fn();
        renderWithProviders(<WeightAdd onSaved={onSaved} />);

        await fill(user);
        await user.click(save());

        await waitFor(() =>
            expect(notify).toHaveBeenCalledWith("Entry added!", "success")
        );
        expect(entryLogged).toHaveBeenCalledTimes(1);
        expect(onSaved).toHaveBeenCalledTimes(1);
        expect(screen.getByLabelText("Weight")).toHaveValue(null);
    });

    it("invalidates every cached weight window after a successful add", async () => {
        const user = userEvent.setup();
        const queryClient = makeTestQueryClient();
        queryClient.setQueryData(qk.list("weight", 7), [{ _id: "old" }]);
        queryClient.setQueryData(qk.list("weight", 30), [{ _id: "old" }]);
        queryClient.setQueryData(qk.insulinTypes(), [{ _id: "type" }]);
        renderWithProviders(<WeightAdd />, { queryClient });

        await fill(user);
        await user.click(save());

        await waitFor(() => {
            expect(queryClient.getQueryState(qk.list("weight", 7))?.isInvalidated).toBe(true);
            expect(queryClient.getQueryState(qk.list("weight", 30))?.isInvalidated).toBe(true);
        });
        expect(queryClient.getQueryState(qk.insulinTypes())?.isInvalidated).toBe(false);
    });

    it("reports a server error and does not call onSaved", async () => {
        const user = userEvent.setup();
        const onSaved = vi.fn();
        post.mockImplementation(rejectsWith({
            response: { data: { message: "Something broke" } },
        }));
        renderWithProviders(<WeightAdd onSaved={onSaved} />);

        await fill(user);
        await user.click(save());

        await waitFor(() =>
            expect(notify).toHaveBeenCalledWith("Something broke", "error")
        );
        expect(onSaved).not.toHaveBeenCalled();
    });

    it("focuses the value field only when arriving from a PWA shortcut", () => {
        const { unmount } = renderWithProviders(<WeightAdd autoFocus />);
        expect(document.activeElement).toBe(screen.getByLabelText("Weight"));
        unmount();

        renderWithProviders(<WeightAdd />);
        expect(document.activeElement?.tagName).not.toBe("INPUT");
    });
});
