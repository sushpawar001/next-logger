import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { getList, getOne, getRange, getFlat } from "./fetchers";

vi.mock("axios");

const get = vi.mocked(axios.get);

beforeEach(() => {
    get.mockReset();
});

describe("getList", () => {
    it("unwraps the { data } envelope the list handlers return", async () => {
        get.mockResolvedValue({ status: 200, data: { data: [{ value: 110 }] } } as any);

        await expect(getList("/api/glucose/get/7")).resolves.toEqual([{ value: 110 }]);
    });

    /**
     * Six existing tests assert `toHaveBeenCalledWith("/api/...")` with exactly
     * one argument, which is why the queryFn's AbortSignal is not forwarded.
     */
    it("calls axios with the url as its only argument", async () => {
        get.mockResolvedValue({ status: 200, data: { data: [] } } as any);

        await getList("/api/glucose/get/7");

        expect(get).toHaveBeenCalledWith("/api/glucose/get/7");
        expect(get.mock.calls[0]).toHaveLength(1);
    });

    /**
     * Real axios rejects on non-2xx, so a resolved 500 only happens in a test
     * double -- several suites use exactly this shape to check a page still
     * renders. Returning [] rather than reading `status` keeps them meaningful.
     */
    it("falls back to an empty array when the payload has no data", async () => {
        get.mockResolvedValue({ status: 500, data: {} } as any);
        await expect(getList("/api/glucose/get/7")).resolves.toEqual([]);

        get.mockResolvedValue({ status: 200, data: null } as any);
        await expect(getList("/api/glucose/get/7")).resolves.toEqual([]);

        get.mockResolvedValue({} as any);
        await expect(getList("/api/glucose/get/7")).resolves.toEqual([]);
    });

    it("propagates a rejection so React Query can surface an error state", async () => {
        get.mockRejectedValue(new Error("network down"));

        await expect(getList("/api/glucose/get/7")).rejects.toThrow("network down");
    });
});

describe("getOne", () => {
    it("unwraps a single entry", async () => {
        get.mockResolvedValue({ status: 200, data: { data: { _id: "g1" } } } as any);

        await expect(getOne("/api/glucose/get-one/g1")).resolves.toEqual({ _id: "g1" });
    });

    it("returns null rather than undefined when the entry is missing", async () => {
        get.mockResolvedValue({ status: 200, data: {} } as any);
        await expect(getOne("/api/glucose/get-one/nope")).resolves.toBeNull();

        get.mockResolvedValue({ status: 200, data: null } as any);
        await expect(getOne("/api/glucose/get-one/nope")).resolves.toBeNull();
    });
});

describe("getRange", () => {
    it("renames the nested period payload to current/previous", async () => {
        get.mockResolvedValue({
            status: 200,
            data: {
                data: {
                    daysAgoData: [{ value: 1 }],
                    prevDaysAgoData: [{ value: 2 }],
                },
            },
        } as any);

        await expect(getRange("/api/glucose/get-range/90")).resolves.toEqual({
            current: [{ value: 1 }],
            previous: [{ value: 2 }],
        });
    });

    it("defaults both periods to empty arrays", async () => {
        get.mockResolvedValue({ status: 200, data: { data: {} } } as any);
        await expect(getRange("/api/glucose/get-range/90")).resolves.toEqual({
            current: [],
            previous: [],
        });

        get.mockResolvedValue({ status: 200, data: {} } as any);
        await expect(getRange("/api/glucose/get-range/90")).resolves.toEqual({
            current: [],
            previous: [],
        });
    });

    it("defaults one period when only the other is present", async () => {
        get.mockResolvedValue({
            status: 200,
            data: { data: { daysAgoData: [{ value: 1 }] } },
        } as any);

        await expect(getRange("/api/weight/get-range/30")).resolves.toEqual({
            current: [{ value: 1 }],
            previous: [],
        });
    });
});

describe("getFlat", () => {
    it("returns the body as-is for the one endpoint with no data envelope", async () => {
        get.mockResolvedValue({
            status: 200,
            data: { subscriptionPlan: "trial", remainingDays: 12 },
        } as any);

        await expect(getFlat("/api/users/subscription")).resolves.toEqual({
            subscriptionPlan: "trial",
            remainingDays: 12,
        });
    });
});
