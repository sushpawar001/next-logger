import { describe, expect, it } from "vitest";
import { insulinKind, splitUnits } from "./insulinKind";

describe("insulinKind", () => {
    it.each(["Lantus", "Tresiba", "Levemir", "Toujeo", "Basaglar", "insulin glargine", "Humulin N", "NPH"])(
        "treats %s as basal",
        (name) => {
            expect(insulinKind(name)).toBe("basal");
        }
    );

    it.each(["NovoRapid", "Humalog", "Fiasp", "Apidra", "Actrapid", "Humulin R", "Mixtard 30"])(
        "treats %s as bolus",
        (name) => {
            expect(insulinKind(name)).toBe("bolus");
        }
    );

    it("defaults a missing name to bolus", () => {
        expect(insulinKind(undefined)).toBe("bolus");
        expect(insulinKind("")).toBe("bolus");
    });
});

describe("splitUnits", () => {
    it("totals bolus and basal separately", () => {
        expect(
            splitUnits([
                { name: "Tresiba", units: 10 },
                { name: "NovoRapid", units: 6 },
                { name: "NovoRapid", units: 8 },
            ])
        ).toEqual({ bolus: 14, basal: 10, total: 24 });
    });

    it("coerces string units and ignores junk", () => {
        expect(
            splitUnits([
                { name: "Lantus", units: "12" as unknown as number },
                { name: "Humalog", units: NaN },
            ])
        ).toEqual({ bolus: 0, basal: 12, total: 12 });
    });
});
