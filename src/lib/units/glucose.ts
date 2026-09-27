/**
 * Blood glucose unit conversion. FitDose stores glucose in mg/dL; mmol/L is a
 * display unit. The factor is glucose's molar mass (180.16 g/mol, PubChem CID
 * 5793) divided by 10, since 1 mmol/L = 180.16 mg/L = 18.016 mg/dL.
 */
export const MGDL_PER_MMOL = 18.016;

export type GlucoseUnit = "mgdl" | "mmol";

export const GLUCOSE_UNIT_LABEL: Record<GlucoseUnit, string> = {
    mgdl: "mg/dL",
    mmol: "mmol/L",
};

export const mgdlToMmol = (mgdl: number) => mgdl / MGDL_PER_MMOL;
export const mmolToMgdl = (mmol: number) => mmol * MGDL_PER_MMOL;

/**
 * Rounds half up to `decimals` places after discarding floating-point noise,
 * so an exact half such as 28.7 × 6 − 46.7 = 125.5 rounds to 126 (as published
 * tables do) instead of 125 because it was computed as 125.49999999999999.
 */
export function roundTo(value: number, decimals = 0): number {
    const factor = 10 ** decimals;
    return Math.round(Number((value * factor).toFixed(9))) / factor;
}

/** mg/dL is quoted as a whole number, mmol/L to one decimal place. */
export function roundGlucose(value: number, unit: GlucoseUnit): number {
    return unit === "mgdl" ? roundTo(value) : roundTo(value, 1);
}

export function toMgdl(value: number, unit: GlucoseUnit): number {
    return unit === "mgdl" ? value : mmolToMgdl(value);
}

/** A reading in both units, each rounded to its usual precision. */
export function formatGlucosePair(mgdl: number): { mgdl: number; mmol: number } {
    return {
        mgdl: roundGlucose(mgdl, "mgdl"),
        mmol: roundGlucose(mgdlToMmol(mgdl), "mmol"),
    };
}
