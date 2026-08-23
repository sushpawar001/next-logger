import { describe, expect, it } from "vitest";
import { filterByTags, getUniqueTags } from "./tagFilterHelpers";

const entries = [
    { id: 1, tag: "Fasting" },
    { id: 2, tag: "After meal" },
    { id: 3, tag: null },
    { id: 4, tag: "Fasting" },
    { id: 5, tag: undefined },
];

/**
 * Tag filtering has to happen in JS: `tag` is encrypted at rest, so it cannot
 * be queried, sorted or aggregated in MongoDB.
 */
describe("filterByTags", () => {
    it("returns everything, including untagged rows, when nothing is selected", () => {
        expect(filterByTags(entries, [])).toBe(entries);
    });

    it("matches any of the selected tags (OR)", () => {
        expect(filterByTags(entries, ["Fasting", "After meal"]).map((e) => e.id)).toEqual(
            [1, 2, 4]
        );
    });

    it("drops null and undefined tags once a filter is active", () => {
        expect(filterByTags(entries, ["Fasting"]).map((e) => e.id)).toEqual([1, 4]);
    });

    it("returns nothing when no row carries the selected tag", () => {
        expect(filterByTags(entries, ["Random"])).toEqual([]);
    });

    it("returns an empty array for empty input", () => {
        expect(filterByTags([], ["Fasting"])).toEqual([]);
    });

    it("does not mutate the input", () => {
        const input = [...entries];

        filterByTags(input, ["Fasting"]);

        expect(input).toHaveLength(5);
    });
});

describe("getUniqueTags", () => {
    it("de-duplicates and excludes null/undefined", () => {
        expect(getUniqueTags(entries)).toEqual(["Fasting", "After meal"]);
    });

    it("preserves first-seen order", () => {
        expect(
            getUniqueTags([{ tag: "b" }, { tag: "a" }, { tag: "b" }])
        ).toEqual(["b", "a"]);
    });

    it("returns an empty array when every row is untagged", () => {
        expect(getUniqueTags([{ tag: null }, { tag: undefined }])).toEqual([]);
    });

    it("returns an empty array for empty input", () => {
        expect(getUniqueTags([])).toEqual([]);
    });
});
