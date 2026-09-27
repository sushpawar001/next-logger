import { describe, expect, it } from "vitest";
import {
    brzycki,
    epley,
    estimateOneRepMax,
    lombardi,
    NSCA_LOAD_CHART,
    trainingLoads,
} from "./oneRepMax";

describe("1RM formulas", () => {
    it("Epley adds a thirtieth of the weight per rep", () => {
        expect(epley(100, 5)).toBeCloseTo(116.67, 2);
    });

    it("Brzycki divides by 37 minus reps", () => {
        expect(brzycki(100, 5)).toBeCloseTo(112.5, 10);
    });

    it("Brzycki matches its alternative published form", () => {
        expect(brzycki(80, 8)).toBeCloseTo(80 / (1.0278 - 0.0278 * 8), 1);
    });

    it("Lombardi raises reps to the power 0.1", () => {
        expect(lombardi(100, 5)).toBeCloseTo(100 * 5 ** 0.1, 10);
    });
});

describe("estimateOneRepMax", () => {
    it("averages the three formulas", () => {
        const result = estimateOneRepMax(100, 5)!;

        expect(result.average).toBeCloseTo(
            (result.epley + result.brzycki + result.lombardi) / 3,
            10
        );
        expect(result.reliable).toBe(true);
    });

    it("treats a single rep as the 1RM itself", () => {
        expect(estimateOneRepMax(140, 1)!.average).toBe(140);
    });

    it("flags sets of more than 10 reps as less reliable", () => {
        expect(estimateOneRepMax(60, 11)!.reliable).toBe(false);
        expect(estimateOneRepMax(60, 10)!.reliable).toBe(true);
    });

    it.each([
        [0, 5],
        [-20, 5],
        [100, 0],
        [100, 13],
        [100, 2.5],
        [NaN, 5],
    ])("rejects %s for %s reps", (weight, reps) => {
        expect(estimateOneRepMax(weight, reps)).toBeNull();
    });
});

describe("trainingLoads", () => {
    it("follows the NSCA chart", () => {
        const loads = trainingLoads(200);

        expect(loads[0]).toEqual({ reps: 1, percent: 100, load: 200 });
        expect(loads.find((l) => l.reps === 5)!.load).toBe(174);
        expect(loads.find((l) => l.reps === 10)!.load).toBe(150);
    });

    it("has percentages falling as reps rise", () => {
        for (let i = 1; i < NSCA_LOAD_CHART.length; i++) {
            expect(NSCA_LOAD_CHART[i].percent).toBeLessThan(NSCA_LOAD_CHART[i - 1].percent);
            expect(NSCA_LOAD_CHART[i].reps).toBeGreaterThan(NSCA_LOAD_CHART[i - 1].reps);
        }
    });
});
