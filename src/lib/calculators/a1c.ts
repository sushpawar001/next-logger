import {
    formatGlucosePair,
    mgdlToMmol,
    roundTo,
    toMgdl,
    type GlucoseUnit,
} from "@/lib/units/glucose";

/**
 * A1c <-> estimated average glucose (eAG).
 *
 * eAG uses the ADAG regression (Nathan et al., Diabetes Care 2008):
 *   eAG (mg/dL) = 28.7 × A1c (%) − 46.7
 * The % <-> mmol/mol conversion is the NGSP/IFCC master equation
 * (ngsp.org/ifccngsp.asp): NGSP % = 0.09148 × IFCC mmol/mol + 2.152.
 */
export const eagFromA1c = (pct: number) => 28.7 * pct - 46.7;
export const a1cFromEag = (mgdl: number) => (mgdl + 46.7) / 28.7;
export const a1cPctToMmolMol = (pct: number) => (pct - 2.152) / 0.09148;
export const a1cMmolMolToPct = (mmolMol: number) => 0.09148 * mmolMol + 2.152;

export type A1cUnit = "pct" | "mmolmol";
export type A1cCategory = "normal" | "prediabetes" | "diabetes";

/** ADA diagnostic thresholds (Standards of Care, section 2). */
export const A1C_CATEGORIES: Record<
    A1cCategory,
    { label: string; range: string; min: number; max: number }
> = {
    normal: { label: "Normal", range: "Below 5.7%", min: 0, max: 5.7 },
    prediabetes: {
        label: "Prediabetes",
        range: "5.7% to 6.4%",
        min: 5.7,
        max: 6.5,
    },
    diabetes: {
        label: "Diabetes range",
        range: "6.5% or higher",
        min: 6.5,
        max: Infinity,
    },
};

export function classifyA1c(pct: number): A1cCategory | null {
    if (!Number.isFinite(pct) || pct <= 0) return null;
    if (pct < A1C_CATEGORIES.normal.max) return "normal";
    if (pct < A1C_CATEGORIES.prediabetes.max) return "prediabetes";
    return "diabetes";
}

/** The range where the ADAG relationship was studied and results make sense. */
export const A1C_PCT_BOUNDS = { min: 3, max: 20 } as const;

export interface A1cResult {
    /** A1c in %, one decimal. */
    pct: number;
    /** A1c in mmol/mol, whole number. */
    mmolMol: number;
    /** eAG in mg/dL, whole number. */
    eagMgdl: number;
    /** eAG in mmol/L, one decimal. */
    eagMmol: number;
    category: A1cCategory;
}

export interface A1cInput {
    /** Which value the user knows. */
    mode: "a1c" | "eag";
    a1c: string;
    a1cUnit: A1cUnit;
    glucose: string;
    unit: GlucoseUnit;
}

/** Converts whichever value was entered; null for missing or implausible input. */
export function resolveA1c(input: A1cInput): A1cResult | null {
    let pct: number;
    if (input.mode === "a1c") {
        const value = parseFloat(input.a1c);
        pct = input.a1cUnit === "pct" ? value : a1cMmolMolToPct(value);
    } else {
        pct = a1cFromEag(toMgdl(parseFloat(input.glucose), input.unit));
    }

    if (
        !Number.isFinite(pct) ||
        pct < A1C_PCT_BOUNDS.min ||
        pct > A1C_PCT_BOUNDS.max
    ) {
        return null;
    }

    const eag = formatGlucosePair(eagFromA1c(pct));
    return {
        pct: roundTo(pct, 1),
        mmolMol: roundTo(a1cPctToMmolMol(pct)),
        eagMgdl: eag.mgdl,
        eagMmol: eag.mmol,
        category: classifyA1c(pct)!,
    };
}

/** Reference rows for A1c 5.0% to 12.0% in 0.5 steps. */
export function a1cReferenceRows() {
    const rows = [];
    for (let tenths = 50; tenths <= 120; tenths += 5) {
        const pct = tenths / 10;
        const eag = eagFromA1c(pct);
        rows.push({
            pct,
            mmolMol: roundTo(a1cPctToMmolMol(pct)),
            eagMgdl: roundTo(eag),
            eagMmol: roundTo(mgdlToMmol(eag), 1),
        });
    }
    return rows;
}
