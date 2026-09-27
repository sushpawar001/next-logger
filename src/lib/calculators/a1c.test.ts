import { describe, expect, it } from "vitest";
import {
    a1cFromEag,
    a1cMmolMolToPct,
    a1cPctToMmolMol,
    a1cReferenceRows,
    classifyA1c,
    eagFromA1c,
    resolveA1c,
    type A1cInput,
} from "./a1c";

const input = (overrides: Partial<A1cInput> = {}): A1cInput => ({
    mode: "a1c",
    a1c: "",
    a1cUnit: "pct",
    glucose: "",
    unit: "mgdl",
    ...overrides,
});

describe("ADAG eAG conversion", () => {
    // Published ADAG table points (Nathan et al. 2008).
    it.each([
        [6, 126],
        [7, 154],
        [8, 183],
        [9, 212],
        [10, 240],
    ])("A1c %s%% shows as an eAG of %s mg/dL", (pct, mgdl) => {
        expect(resolveA1c(input({ a1c: String(pct) }))!.eagMgdl).toBe(mgdl);
    });

    it("inverts cleanly", () => {
        expect(a1cFromEag(eagFromA1c(7.3))).toBeCloseTo(7.3, 10);
    });
});

describe("IFCC mmol/mol conversion", () => {
    // NGSP/IFCC equivalents quoted by ngsp.org.
    it.each([
        [5.0, 31],
        [6.0, 42],
        [6.5, 48],
        [7.0, 53],
        [8.0, 64],
        [9.0, 75],
    ])("%s%% is %s mmol/mol", (pct, mmolMol) => {
        expect(Math.round(a1cPctToMmolMol(pct))).toBe(mmolMol);
    });

    it("inverts cleanly", () => {
        expect(a1cMmolMolToPct(a1cPctToMmolMol(6.8))).toBeCloseTo(6.8, 10);
    });
});

describe("classifyA1c", () => {
    it.each([
        [5.6, "normal"],
        [5.7, "prediabetes"],
        [6.4, "prediabetes"],
        [6.5, "diabetes"],
        [11, "diabetes"],
    ])("classifies %s%% as %s", (pct, category) => {
        expect(classifyA1c(pct)).toBe(category);
    });

    it.each([0, -1, NaN, Infinity])("rejects %f", (pct) => {
        expect(classifyA1c(pct)).toBeNull();
    });
});

describe("resolveA1c", () => {
    it("converts a known A1c into every unit", () => {
        expect(resolveA1c(input({ a1c: "7" }))).toEqual({
            pct: 7,
            mmolMol: 53,
            eagMgdl: 154,
            eagMmol: 8.6,
            category: "diabetes",
        });
    });

    it("accepts A1c entered in mmol/mol", () => {
        const result = resolveA1c(input({ a1c: "48", a1cUnit: "mmolmol" }));

        expect(result?.pct).toBe(6.5);
        expect(result?.category).toBe("diabetes");
    });

    it("estimates A1c from an average in mg/dL", () => {
        const result = resolveA1c(input({ mode: "eag", glucose: "154" }));

        expect(result?.pct).toBe(7);
        expect(result?.eagMgdl).toBe(154);
    });

    it("estimates A1c from an average in mmol/L", () => {
        const result = resolveA1c(
            input({ mode: "eag", glucose: "8.6", unit: "mmol" })
        );

        expect(result?.pct).toBe(7);
    });

    it("ignores the field for the other mode", () => {
        expect(resolveA1c(input({ mode: "eag", a1c: "7" }))).toBeNull();
    });

    it.each(["", "abc", "0", "2.9", "20.1", "-5"])(
        "returns null for A1c %s",
        (a1c) => {
            expect(resolveA1c(input({ a1c }))).toBeNull();
        }
    );
});

describe("a1cReferenceRows", () => {
    it("covers 5% to 12% in half-point steps", () => {
        const rows = a1cReferenceRows();

        expect(rows[0].pct).toBe(5);
        expect(rows.at(-1)!.pct).toBe(12);
        expect(rows).toHaveLength(15);
    });

    it("computes each row from the formulas", () => {
        const seven = a1cReferenceRows().find((r) => r.pct === 7)!;

        expect(seven).toEqual({ pct: 7, mmolMol: 53, eagMgdl: 154, eagMmol: 8.6 });
    });
});
