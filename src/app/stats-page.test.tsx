import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, userEvent, waitFor, within } from "@/test/render";

vi.mock("axios");

import axios from "axios";
import StatsPage from "./(Dashboard)/stats/page";

const get = vi.mocked(axios.get);

// Average 131.3 mg/dL; one of three readings is above range.
const glucoseCurrent = [
    { _id: "g1", value: 110, createdAt: "2026-01-30T08:00:00.000Z", tag: "Fasting" },
    { _id: "g2", value: 94, createdAt: "2026-01-29T08:00:00.000Z", tag: null },
    { _id: "g3", value: 190, createdAt: "2026-01-28T08:00:00.000Z", tag: "After meal" },
];
const glucosePrevious = [
    { _id: "g4", value: 150, createdAt: "2025-12-30T08:00:00.000Z", tag: null },
    { _id: "g5", value: 60, createdAt: "2025-12-29T08:00:00.000Z", tag: null },
];
const weightRows = [
    { _id: "w1", value: 72.4, createdAt: "2026-01-30T07:00:00.000Z", tag: null },
    { _id: "w2", value: 73.1, createdAt: "2026-01-20T07:00:00.000Z", tag: null },
];
const insulinRows = [
    { _id: "i1", units: 12, name: "Lantus", createdAt: "2026-01-30T21:00:00.000Z", tag: null },
    { _id: "i2", units: 6, name: "NovoRapid", createdAt: "2026-01-30T08:00:00.000Z", tag: null },
    { _id: "i3", units: 4, name: "NovoRapid", createdAt: "2026-01-30T13:00:00.000Z", tag: null },
];

const route = (glucose = glucoseCurrent, glucoseOld = glucosePrevious) =>
    get.mockImplementation((url: string) => {
        if (url.includes("/glucose/get-range/")) {
            return Promise.resolve({
                status: 200,
                data: { data: { daysAgoData: glucose, prevDaysAgoData: glucoseOld } },
            });
        }
        if (url.includes("/weight/get-range/")) {
            return Promise.resolve({
                status: 200,
                data: { data: { daysAgoData: weightRows, prevDaysAgoData: [] } },
            });
        }
        if (url.includes("/insulin/get/")) {
            return Promise.resolve({ status: 200, data: { data: insulinRows } });
        }
        return Promise.resolve({ status: 200, data: { data: [] } });
    });

beforeEach(() => {
    get.mockReset();
    route();
});

describe("stats page (A1)", () => {
    it("shows the estimated HbA1c to one decimal", async () => {
        renderWithProviders(<StatsPage />);

        expect(await screen.findByText(/average glucose of 131 mg\/dL/)).toBeInTheDocument();
        expect(screen.getByText("6.2")).toBeInTheDocument();
    });

    it("meters the days of data towards the 90 needed", async () => {
        renderWithProviders(<StatsPage />);

        const meter = await screen.findByRole("progressbar", { name: "Days of data" });
        expect(meter).toHaveAttribute("aria-valuenow", "3");
        expect(meter).toHaveAttribute("aria-valuemax", "90");
        expect(screen.getByText(/keep logging for 87 more days/i)).toBeInTheDocument();
    });

    it("frames the estimate as not a lab result, linking to export", async () => {
        renderWithProviders(<StatsPage />);

        expect(await screen.findByText(/not a lab result/i)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /export data/i })).toHaveAttribute(
            "href",
            "/profile#export"
        );
    });

    it("compares glucose period over period, including time in range", async () => {
        renderWithProviders(<StatsPage />);

        const avg = await screen.findByRole("row", { name: /^average 105/i });
        // Previous 105 (150, 60), current 131.
        expect(avg).toHaveTextContent("131");
        expect(avg).toHaveTextContent("+26");

        const inRange = screen.getByRole("row", { name: /^in range/i });
        expect(inRange).toHaveTextContent("50%");
        expect(inRange).toHaveTextContent("67%");
        expect(inRange).toHaveTextContent("+17 pts");
    });

    it("shows a dash where the previous weight period has no average", async () => {
        renderWithProviders(<StatsPage />);

        const weightTable = (await screen.findByRole("heading", { name: "Weight" }))
            .closest("section")!;
        expect(within(weightTable).getByRole("row", { name: /average/i })).toHaveTextContent(
            "—"
        );
        expect(within(weightTable).getByRole("row", { name: /weigh-ins/i })).toHaveTextContent(
            "+2"
        );
    });

    it("lists insulin per type as units per day", async () => {
        renderWithProviders(<StatsPage />);

        expect(await screen.findByRole("row", { name: /lantus/i })).toHaveTextContent("12.0");
        expect(screen.getByRole("row", { name: /novorapid/i })).toHaveTextContent("10.0");
        expect(screen.getByRole("row", { name: /total/i })).toHaveTextContent("22.0");
    });

    it("recomputes when a tag filter is applied", async () => {
        const user = userEvent.setup();
        renderWithProviders(<StatsPage />);

        await user.click(await screen.findByRole("button", { name: "Fasting" }));

        await waitFor(() =>
            expect(screen.getByText(/average glucose of 110 mg\/dL/)).toBeInTheDocument()
        );
    });

    it("asks for readings when there is no glucose", async () => {
        route([], []);
        renderWithProviders(<StatsPage />);

        expect(
            await screen.findByText(/log glucose readings to see an estimate/i)
        ).toBeInTheDocument();
    });
});
