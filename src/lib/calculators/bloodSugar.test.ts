import { describe, expect, it } from "vitest";
import {
    classifyGlucose,
    conversionRows,
    convertGlucose,
    rangeRows,
} from "./bloodSugar";

describe("convertGlucose", () => {
    it("converts mg/dL to mmol/L", () => {
        expect(convertGlucose(126, "mgdl")).toMatchObject({
            mgdl: 126,
            mmol: 7.0,
        });
    });

    it("converts mmol/L to mg/dL", () => {
        expect(convertGlucose(5.5, "mmol")).toMatchObject({
            mgdl: 99,
            mmol: 5.5,
        });
    });

    it.each([
        [NaN, "mgdl"],
        [0, "mgdl"],
        [5, "mgdl"],
        [1200, "mgdl"],
        [60, "mmol"],
    ] as const)("rejects %s %s as implausible", (value, unit) => {
        expect(convertGlucose(value, unit)).toBeNull();
    });
});

describe("classifyGlucose", () => {
    it.each([
        [40, "hypoL2"],
        [53.9, "hypoL2"],
        [54, "hypoL1"],
        [69, "hypoL1"],
    ] as const)("treats %s mg/dL as %s in any context", (mgdl, band) => {
        for (const context of ["fasting", "postMeal", "random"] as const) {
            expect(classifyGlucose(mgdl, context)!.band).toBe(band);
        }
    });

    it.each([
        [70, "normal"],
        [99, "normal"],
        [100, "prediabetes"],
        [125, "prediabetes"],
        [126, "diabetes"],
    ] as const)("classifies fasting %s mg/dL as %s", (mgdl, band) => {
        expect(classifyGlucose(mgdl, "fasting")!.band).toBe(band);
    });

    it.each([
        [139, "normal"],
        [140, "prediabetes"],
        [199, "prediabetes"],
        [200, "diabetes"],
    ] as const)("classifies 2-hour %s mg/dL as %s", (mgdl, band) => {
        expect(classifyGlucose(mgdl, "postMeal")!.band).toBe(band);
    });

    it.each([
        [70, "inTarget"],
        [180, "inTarget"],
        [181, "aboveTarget"],
    ] as const)("matches the app's target range: %s mg/dL is %s", (mgdl, band) => {
        expect(classifyGlucose(mgdl, "random")!.band).toBe(band);
    });

    it("agrees with the published mmol/L cut-offs after conversion", () => {
        // 5.6 and 7.0 mmol/L are the ADA fasting thresholds in mmol/L.
        expect(
            classifyGlucose(convertGlucose(5.5, "mmol")!.exactMgdl, "fasting")!
                .band
        ).toBe("normal");
        expect(
            classifyGlucose(convertGlucose(5.6, "mmol")!.exactMgdl, "fasting")!
                .band
        ).toBe("prediabetes");
        expect(
            classifyGlucose(convertGlucose(7.0, "mmol")!.exactMgdl, "fasting")!
                .band
        ).toBe("diabetes");
        expect(
            classifyGlucose(convertGlucose(3.0, "mmol")!.exactMgdl, "random")!
                .band
        ).toBe("hypoL1");
    });

    it.each([0, -3, NaN])("returns null for %s", (mgdl) => {
        expect(classifyGlucose(mgdl, "random")).toBeNull();
    });
});

describe("reference tables", () => {
    it("computes the conversion table from the formula", () => {
        const rows = conversionRows();

        expect(rows).toContainEqual({ mgdl: 126, mmol: 7.0 });
        expect(rows).toContainEqual({ mgdl: 180, mmol: 10.0 });
    });

    it("shows the thresholds clinicians quote in mmol/L", () => {
        const byReading = Object.fromEntries(
            rangeRows().map((r) => [r.reading, r.mmol])
        );

        expect(byReading["Level 2 low"]).toBe("Below 3.0");
        expect(byReading["Diabetes range (fasting)"]).toBe("7.0 or higher");
        expect(byReading["Diabetes range (2 hours)"]).toBe("11.1 or higher");
        expect(byReading["Common target for people with diabetes"]).toBe(
            "3.9–10.0"
        );
    });
});
