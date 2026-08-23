import { describe, expect, it } from "vitest";
import { complementaryColor } from "./complementaryColor";

describe("complementaryColor", () => {
    it.each([
        ["#000000", "#FFFFFF"],
        ["#FFFFFF", "#000000"],
        ["#FF0000", "#00FFFF"],
        ["#00FF00", "#FF00FF"],
        ["#0000FF", "#FFFF00"],
    ])("inverts %s to %s", (input, expected) => {
        expect(complementaryColor(input)).toBe(expected);
    });

    it("accepts a value without the leading hash", () => {
        expect(complementaryColor("FF0000")).toBe("#00FFFF");
    });

    it("inverts the brand color", () => {
        // #5E4AE3 -> 255-0x5E, 255-0x4A, 255-0xE3
        expect(complementaryColor("#5E4AE3")).toBe("#A1B51C");
    });

    it("is its own inverse", () => {
        expect(complementaryColor(complementaryColor("#5E4AE3"))).toBe("#5E4AE3");
    });

    it("always returns six uppercase hex digits", () => {
        expect(complementaryColor("#FEFEFE")).toMatch(/^#[0-9A-F]{6}$/);
    });

    it("zero-pads a result that would otherwise be short", () => {
        // 255-0xFF = 0 for every channel, which must render as 000000
        expect(complementaryColor("#FFFFFF")).toHaveLength(7);
    });
});
