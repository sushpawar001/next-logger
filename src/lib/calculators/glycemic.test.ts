import { describe, expect, it } from "vitest";
import {
    gmiFromMean,
    MAX_READINGS,
    parseReadings,
    summarizeReadings,
    tirBand,
} from "./glycemic";

describe("gmiFromMean", () => {
    // Values from the GMI paper's table (Bergenstal et al. 2018).
    it.each([
        [100, 5.7],
        [150, 6.9],
        [200, 8.1],
        [250, 9.3],
    ])("a mean of %s mg/dL is a GMI of about %s%%", (mean, gmi) => {
        expect(gmiFromMean(mean)).toBeCloseTo(gmi, 1);
    });
});

describe("tirBand", () => {
    it.each([
        [40, "veryLow"],
        [53.9, "veryLow"],
        [54, "low"],
        [69.9, "low"],
        [70, "inRange"],
        [180, "inRange"],
        [180.5, "high"],
        [250, "high"],
        [251, "veryHigh"],
    ] as const)("puts %s mg/dL in %s", (mgdl, band) => {
        expect(tirBand(mgdl)).toBe(band);
    });
});

describe("parseReadings", () => {
    it("accepts commas, spaces, semicolons and new lines", () => {
        expect(parseReadings("100, 120;140\n160  180", "mgdl").values).toEqual([
            100, 120, 140, 160, 180,
        ]);
    });

    it("converts mmol/L to mg/dL", () => {
        const [value] = parseReadings("7.0", "mmol").values;

        expect(Math.round(value)).toBe(126);
    });

    it("counts and skips tokens that are not plausible readings", () => {
        const result = parseReadings("100 abc 5 2000 -3 150", "mgdl");

        expect(result.values).toEqual([100, 150]);
        expect(result.skipped).toBe(4);
    });

    it("caps the number of readings", () => {
        const text = Array(MAX_READINGS + 5).fill("120").join(",");
        const result = parseReadings(text, "mgdl");

        expect(result.values).toHaveLength(MAX_READINGS);
        expect(result.truncated).toBe(true);
    });
});

describe("summarizeReadings", () => {
    it("needs at least two readings", () => {
        expect(summarizeReadings([])).toBeNull();
        expect(summarizeReadings([120])).toBeNull();
    });

    it("computes mean, population SD, CV and GMI", () => {
        const summary = summarizeReadings([100, 200])!;

        expect(summary.meanMgdl).toBe(150);
        expect(summary.sdMgdl).toBe(50);
        expect(summary.cv).toBeCloseTo(33.33, 2);
        expect(summary.gmi).toBeCloseTo(3.31 + 0.02392 * 150, 10);
    });

    it("splits readings into the five consensus bands", () => {
        const summary = summarizeReadings([50, 60, 100, 150, 200, 300, 120, 140, 160, 170])!;

        expect(summary.bands).toEqual({
            veryLow: 10,
            low: 10,
            inRange: 60,
            high: 10,
            veryHigh: 10,
        });
    });

    it("checks each consensus target", () => {
        const summary = summarizeReadings([50, 60, 100, 150, 200, 300, 120, 140, 160, 170])!;

        expect(summary.targets.tir).toEqual({ value: 60, met: false });
        expect(summary.targets.tbr).toEqual({ value: 20, met: false });
        expect(summary.targets.tar).toEqual({ value: 20, met: true });
    });

    it("meets every target with steady in-range readings", () => {
        const summary = summarizeReadings([110, 120, 130, 125, 115])!;

        for (const target of Object.values(summary.targets)) {
            expect(target.met).toBe(true);
        }
    });
});
