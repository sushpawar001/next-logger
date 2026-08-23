import { describe, expect, it } from "vitest";
import {
    convertArrayStringToNumber,
    convertStringToNumber,
} from "./convertStringToNumber";

/**
 * This helper is the bridge between the Mongoose interfaces (which type
 * encrypted values as `string` because of `storeAsString: true`) and the client
 * types in src/types/models.d.ts (which expect `number`).
 */
describe("convertStringToNumber", () => {
    it("converts the named fields and leaves the rest alone", () => {
        const result = convertStringToNumber(
            { _id: "g1", value: "110", tag: "Fasting" },
            ["value"]
        );

        expect(result).toEqual({ _id: "g1", value: 110, tag: "Fasting" });
        expect(typeof result.value).toBe("number");
    });

    it("converts decimals", () => {
        expect(convertStringToNumber({ value: "72.45" }, ["value"]).value).toBe(
            72.45
        );
    });

    it("converts several fields at once", () => {
        const result = convertStringToNumber(
            { arms: "32", chest: "98", tag: "Other" },
            ["arms", "chest"]
        );

        expect(result).toMatchObject({ arms: 32, chest: 98, tag: "Other" });
    });

    it("does not mutate the input", () => {
        const input = { value: "110" };

        convertStringToNumber(input, ["value"]);

        expect(input.value).toBe("110");
    });

    it("ignores fields that are absent", () => {
        expect(convertStringToNumber({ value: "1" }, ["missing"])).toEqual({
            value: "1",
        });
    });

    it("leaves values that are already numbers untouched", () => {
        expect(convertStringToNumber({ value: 110 }, ["value"]).value).toBe(110);
    });

    it.each([
        ["an empty string", ""],
        ["null", null],
        ["undefined", undefined],
    ])("leaves %s untouched because the guard is truthiness-based", (_l, value) => {
        expect(convertStringToNumber({ value }, ["value"]).value).toBe(value);
    });

    // The guard checks truthiness, so "0" IS converted even though it is falsy
    // as a number -- it is a non-empty string.
    it('converts the string "0" to 0', () => {
        expect(convertStringToNumber({ value: "0" }, ["value"]).value).toBe(0);
    });

    it("yields NaN for a non-numeric string rather than throwing", () => {
        expect(convertStringToNumber({ value: "abc" }, ["value"]).value).toBeNaN();
    });
});

describe("convertArrayStringToNumber", () => {
    it("converts every row", () => {
        const result = convertArrayStringToNumber(
            [
                { value: "110", tag: "Fasting" },
                { value: "94.5", tag: null },
            ],
            ["value"]
        );

        expect(result).toEqual([
            { value: 110, tag: "Fasting" },
            { value: 94.5, tag: null },
        ]);
    });

    it("returns an empty array unchanged", () => {
        expect(convertArrayStringToNumber([], ["value"])).toEqual([]);
    });

    it("does not mutate the input rows", () => {
        const rows = [{ value: "110" }];

        convertArrayStringToNumber(rows, ["value"]);

        expect(rows[0].value).toBe("110");
    });
});
