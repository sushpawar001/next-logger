import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHookWithProviders, waitFor } from "@/test/render";

vi.mock("axios");

import axios from "axios";
import { qk } from "@/lib/query/keys";
import { listWindowFromRange, useEntryRange } from "./useEntries";

const get = vi.mocked(axios.get);

const NOW = new Date("2026-01-30T12:00:00.000Z");
const hoursAgo = (h: number) => new Date(+NOW - h * 3600_000).toISOString();

describe("listWindowFromRange", () => {
    it("keeps only rows inside the rolling get/[days] window", () => {
        const rows = [
            { _id: "a", createdAt: hoursAgo(1) },
            { _id: "b", createdAt: hoursAgo(7 * 24 - 1) },
            // get-range starts at midnight, so it can hold rows just past the window.
            { _id: "c", createdAt: hoursAgo(7 * 24 + 1) },
        ];

        expect(listWindowFromRange(rows, 7, NOW).map((r) => r._id)).toEqual(["a", "b"]);
    });
});

describe("useEntryRange", () => {
    beforeEach(() => {
        get.mockReset();
    });

    it("seeds the list cache for the same window from the current period", async () => {
        const current = [{ _id: "g1", value: 110, createdAt: new Date().toISOString() }];
        get.mockResolvedValue({
            status: 200,
            data: { data: { daysAgoData: current, prevDaysAgoData: [] } },
        });

        const { result, queryClient } = renderHookWithProviders(() =>
            useEntryRange("glucose", 90)
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(queryClient.getQueryData(qk.list("glucose", 90))).toEqual(current);
        expect(get).toHaveBeenCalledTimes(1);
    });

    it("does not overwrite a list fetched after the range request started", async () => {
        let resolve: (v: any) => void;
        get.mockReturnValue(new Promise((r) => (resolve = r)) as any);

        const { result, queryClient } = renderHookWithProviders(() =>
            useEntryRange("glucose", 90)
        );
        const newer = [{ _id: "fresh", value: 99, createdAt: new Date().toISOString() }];
        await waitFor(() => expect(get).toHaveBeenCalled());
        queryClient.setQueryData(qk.list("glucose", 90), newer, {
            updatedAt: Date.now() + 1000,
        });

        resolve!({
            status: 200,
            data: { data: { daysAgoData: [], prevDaysAgoData: [] } },
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(queryClient.getQueryData(qk.list("glucose", 90))).toBe(newer);
    });

    it("leaves an existing (even invalidated) list alone", async () => {
        get.mockResolvedValue({
            status: 200,
            data: { data: { daysAgoData: [], prevDaysAgoData: [] } },
        });
        const { result, queryClient } = renderHookWithProviders(() =>
            useEntryRange("glucose", 90)
        );
        const cached = [{ _id: "old", value: 99, createdAt: new Date().toISOString() }];
        queryClient.setQueryData(qk.list("glucose", 90), cached, { updatedAt: 1 });
        await queryClient.invalidateQueries({ queryKey: qk.list("glucose", 90) });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(queryClient.getQueryData(qk.list("glucose", 90))).toBe(cached);
        expect(queryClient.getQueryState(qk.list("glucose", 90))!.isInvalidated).toBe(true);
    });
});
