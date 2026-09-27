import { GLUCOSE_TARGET } from "@/constants/constants";
import { toMgdl, type GlucoseUnit } from "@/lib/units/glucose";

/**
 * Glucose Management Indicator and time in range.
 *
 * GMI (Bergenstal et al., Diabetes Care 2018) estimates A1c from mean glucose:
 *   GMI (%) = 3.31 + 0.02392 × mean glucose (mg/dL)
 * Time-in-range bands and targets follow the International Consensus on Time
 * in Range (Battelino et al., Diabetes Care 2019). Both were defined for
 * 14+ days of CGM data; finger-prick readings give a rougher picture.
 */

export const gmiFromMean = (meanMgdl: number) => 3.31 + 0.02392 * meanMgdl;

export type TirBand = "veryLow" | "low" | "inRange" | "high" | "veryHigh";

export const TIR_LIMITS = {
    veryLow: 54,
    low: GLUCOSE_TARGET.low,
    high: GLUCOSE_TARGET.high,
    veryHigh: 250,
} as const;

export const TIR_BANDS: { band: TirBand; label: string; mgdl: string; mmol: string }[] = [
    { band: "veryLow", label: "Very low", mgdl: "Below 54", mmol: "Below 3.0" },
    { band: "low", label: "Low", mgdl: "54–69", mmol: "3.0–3.8" },
    { band: "inRange", label: "In range", mgdl: "70–180", mmol: "3.9–10.0" },
    { band: "high", label: "High", mgdl: "181–250", mmol: "10.1–13.9" },
    { band: "veryHigh", label: "Very high", mgdl: "Above 250", mmol: "Above 13.9" },
];

/** In-range bounds are inclusive, matching the app's own glucoseStatus(). */
export function tirBand(mgdl: number): TirBand {
    if (mgdl < TIR_LIMITS.veryLow) return "veryLow";
    if (mgdl < TIR_LIMITS.low) return "low";
    if (mgdl <= TIR_LIMITS.high) return "inRange";
    if (mgdl <= TIR_LIMITS.veryHigh) return "high";
    return "veryHigh";
}

/** Consensus targets for most adults with type 1 or type 2 diabetes. */
export const TIR_TARGETS = [
    { id: "tir", label: "Time in range (70–180)", goal: "More than 70%" },
    { id: "tbr", label: "Time below 70", goal: "Less than 4%" },
    { id: "tbr54", label: "Time below 54", goal: "Less than 1%" },
    { id: "tar", label: "Time above 180", goal: "Less than 25%" },
    { id: "tar250", label: "Time above 250", goal: "Less than 5%" },
    { id: "cv", label: "Glucose variability (CV)", goal: "36% or less" },
] as const;

export type TargetId = (typeof TIR_TARGETS)[number]["id"];

export const MAX_READINGS = 1000;

/** Pulls numbers out of pasted text (any separator) and normalises to mg/dL. */
export function parseReadings(text: string, unit: GlucoseUnit) {
    const tokens = text.split(/[\s,;]+/).filter(Boolean);
    const values: number[] = [];
    let skipped = 0;
    for (const token of tokens) {
        const n = Number(token);
        const mgdl = toMgdl(n, unit);
        if (Number.isFinite(mgdl) && mgdl >= 10 && mgdl <= 1000) values.push(mgdl);
        else skipped++;
    }
    return {
        values: values.slice(0, MAX_READINGS),
        skipped,
        truncated: values.length > MAX_READINGS,
    };
}

export interface GlycemicSummary {
    count: number;
    meanMgdl: number;
    sdMgdl: number;
    /** Coefficient of variation, %. */
    cv: number;
    gmi: number;
    /** Share of readings in each band, %. */
    bands: Record<TirBand, number>;
    targets: Record<TargetId, { value: number; met: boolean }>;
}

export const MIN_READINGS = 2;

export function summarizeReadings(values: number[]): GlycemicSummary | null {
    if (values.length < MIN_READINGS) return null;
    const count = values.length;
    const meanMgdl = values.reduce((a, b) => a + b, 0) / count;
    // Population SD, as CGM reports (AGP) use.
    const sdMgdl = Math.sqrt(
        values.reduce((sum, v) => sum + (v - meanMgdl) ** 2, 0) / count
    );
    const cv = (sdMgdl / meanMgdl) * 100;

    const counts: Record<TirBand, number> = {
        veryLow: 0,
        low: 0,
        inRange: 0,
        high: 0,
        veryHigh: 0,
    };
    for (const v of values) counts[tirBand(v)]++;
    const pct = (n: number) => (n / count) * 100;
    const bands = {
        veryLow: pct(counts.veryLow),
        low: pct(counts.low),
        inRange: pct(counts.inRange),
        high: pct(counts.high),
        veryHigh: pct(counts.veryHigh),
    };

    const tbr = bands.veryLow + bands.low;
    const tar = bands.high + bands.veryHigh;
    return {
        count,
        meanMgdl,
        sdMgdl,
        cv,
        gmi: gmiFromMean(meanMgdl),
        bands,
        targets: {
            tir: { value: bands.inRange, met: bands.inRange > 70 },
            tbr: { value: tbr, met: tbr < 4 },
            tbr54: { value: bands.veryLow, met: bands.veryLow < 1 },
            tar: { value: tar, met: tar < 25 },
            tar250: { value: bands.veryHigh, met: bands.veryHigh < 5 },
            cv: { value: cv, met: cv <= 36 },
        },
    };
}
