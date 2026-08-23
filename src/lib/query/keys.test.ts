import { describe, it, expect } from "vitest";
import { qk, listStaleTime, RESOURCES, REFERENCE_STALE_TIME } from "./keys";

describe("query key factory", () => {
    it("roots every key under a single namespace", () => {
        const keys = [
            qk.all(),
            qk.resource("glucose"),
            qk.list("glucose", 7),
            qk.range("glucose", 7),
            qk.entry("glucose", "g1"),
            qk.user(),
            qk.userInsulins(),
            qk.subscription(),
            qk.insulinTypes(),
        ];

        for (const key of keys) {
            expect(key[0]).toBe("fitdose");
        }
    });

    it.each(RESOURCES)("makes the resource key a prefix of %s's list/range/entry keys", (r) => {
        const prefix = qk.resource(r);
        const list = qk.list(r, 7);
        const entry = qk.entry(r, "abc");

        expect(list.slice(0, prefix.length)).toEqual([...prefix]);
        expect(entry.slice(0, prefix.length)).toEqual([...prefix]);
    });

    it("makes the resource key a prefix of the range key", () => {
        const prefix = qk.resource("weight");
        expect(qk.range("weight", 30).slice(0, prefix.length)).toEqual([...prefix]);
    });

    /**
     * The reason the factory coerces at all: `weight/page.tsx` sets its period
     * from a raw select value, so without this the same window would occupy two
     * cache slots and never dedupe against /dashboard.
     */
    it("keys the same window identically whether days arrives as a number or a string", () => {
        expect(qk.list("weight", "7")).toEqual(qk.list("weight", 7));
        expect(qk.range("weight", "90")).toEqual(qk.range("weight", 90));
    });

    it("coerces entry ids to strings", () => {
        expect(qk.entry("glucose", 12 as unknown as string)).toEqual(
            qk.entry("glucose", "12")
        );
    });

    it("separates list, range and entry keys for one resource and window", () => {
        expect(qk.list("glucose", 7)).not.toEqual(qk.range("glucose", 7));
        expect(qk.list("glucose", 7)).not.toEqual(qk.entry("glucose", "7"));
    });

    it("separates resources and windows", () => {
        expect(qk.list("glucose", 7)).not.toEqual(qk.list("weight", 7));
        expect(qk.list("glucose", 7)).not.toEqual(qk.list("glucose", 30));
    });

    it("nests the user sub-keys under the user prefix", () => {
        const prefix = qk.user();
        expect(qk.userInsulins().slice(0, prefix.length)).toEqual([...prefix]);
        expect(qk.subscription().slice(0, prefix.length)).toEqual([...prefix]);
    });
});

describe("listStaleTime", () => {
    it("holds windows over 30 days for longer, since those are the expensive reads", () => {
        expect(listStaleTime(90)).toBe(10 * 60_000);
        expect(listStaleTime(365)).toBe(10 * 60_000);
        expect(listStaleTime(36500)).toBe(10 * 60_000);
    });

    it("uses the shorter window at or below 30 days", () => {
        expect(listStaleTime(7)).toBe(5 * 60_000);
        expect(listStaleTime(30)).toBe(5 * 60_000);
    });

    it("accepts a string, like the weight page's period value", () => {
        expect(listStaleTime("90")).toBe(listStaleTime(90));
        expect(listStaleTime("7")).toBe(listStaleTime(7));
    });
});

describe("REFERENCE_STALE_TIME", () => {
    it("is finite, so a future write path that forgets to invalidate still recovers", () => {
        expect(Number.isFinite(REFERENCE_STALE_TIME)).toBe(true);
        expect(REFERENCE_STALE_TIME).toBeGreaterThan(listStaleTime(365));
    });
});
