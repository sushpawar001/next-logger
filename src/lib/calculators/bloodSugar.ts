import { GLUCOSE_TARGET } from "@/constants/constants";
import { glucoseStatus } from "@/helpers/glucoseStatus";
import {
    formatGlucosePair,
    toMgdl,
    type GlucoseUnit,
} from "@/lib/units/glucose";

/**
 * Blood sugar mg/dL <-> mmol/L conversion plus a context-aware reading of the
 * value. Thresholds follow the ADA Standards of Care: hypoglycaemia levels 1
 * and 2 (section 6) and the fasting and 2-hour diagnostic ranges (section 2).
 * The random-reading band reuses the app's own 70-180 mg/dL target.
 */

export type GlucoseContext = "fasting" | "postMeal" | "random";

export type GlucoseBand =
    | "hypoL2"
    | "hypoL1"
    | "normal"
    | "prediabetes"
    | "diabetes"
    | "inTarget"
    | "aboveTarget";

export type BandTone = "red" | "amber" | "green";

export const HYPO = { level2: 54, level1: 70 } as const;
export const FASTING = { prediabetes: 100, diabetes: 126 } as const;
export const POST_MEAL = { prediabetes: 140, diabetes: 200 } as const;

const BANDS: Record<GlucoseBand, { label: string; tone: BandTone }> = {
    hypoL2: { label: "Level 2 low (serious hypoglycaemia)", tone: "red" },
    hypoL1: { label: "Level 1 low (hypoglycaemia)", tone: "amber" },
    normal: { label: "Normal", tone: "green" },
    prediabetes: { label: "Prediabetes range", tone: "amber" },
    diabetes: { label: "Diabetes range", tone: "red" },
    inTarget: {
        label: `Within the ${GLUCOSE_TARGET.low}–${GLUCOSE_TARGET.high} mg/dL target`,
        tone: "green",
    },
    aboveTarget: {
        label: `Above the ${GLUCOSE_TARGET.high} mg/dL target`,
        tone: "amber",
    },
};

export function classifyGlucose(
    mgdl: number,
    context: GlucoseContext
): { band: GlucoseBand; label: string; tone: BandTone } | null {
    if (!Number.isFinite(mgdl) || mgdl <= 0) return null;

    let band: GlucoseBand;
    if (mgdl < HYPO.level2) band = "hypoL2";
    else if (mgdl < HYPO.level1) band = "hypoL1";
    else if (context === "fasting")
        band =
            mgdl < FASTING.prediabetes
                ? "normal"
                : mgdl < FASTING.diabetes
                  ? "prediabetes"
                  : "diabetes";
    else if (context === "postMeal")
        band =
            mgdl < POST_MEAL.prediabetes
                ? "normal"
                : mgdl < POST_MEAL.diabetes
                  ? "prediabetes"
                  : "diabetes";
    else band = glucoseStatus(mgdl) === "high" ? "aboveTarget" : "inTarget";

    return { band, ...BANDS[band] };
}

/** Plausible readings: roughly the span a home meter can display. */
export const GLUCOSE_MGDL_BOUNDS = { min: 10, max: 1000 } as const;

export function convertGlucose(
    value: number,
    from: GlucoseUnit
): { mgdl: number; mmol: number; exactMgdl: number } | null {
    const mgdl = toMgdl(value, from);
    if (
        !Number.isFinite(mgdl) ||
        mgdl < GLUCOSE_MGDL_BOUNDS.min ||
        mgdl > GLUCOSE_MGDL_BOUNDS.max
    ) {
        return null;
    }
    return { ...formatGlucosePair(mgdl), exactMgdl: mgdl };
}

/** Quick conversion table rows, in mg/dL. */
export const CONVERSION_POINTS = [
    40, 54, 60, 70, 80, 90, 100, 110, 126, 140, 160, 180, 200, 250, 300, 350,
    400,
] as const;

export function conversionRows() {
    return CONVERSION_POINTS.map((mgdl) => formatGlucosePair(mgdl));
}

/** The ranges table, with mmol/L computed from the mg/dL thresholds. */
export function rangeRows() {
    const m = (mgdl: number) => formatGlucosePair(mgdl).mmol.toFixed(1);
    return [
        {
            reading: "Level 2 low",
            mgdl: `Below ${HYPO.level2}`,
            mmol: `Below ${m(HYPO.level2)}`,
        },
        {
            reading: "Level 1 low",
            mgdl: `${HYPO.level2}–${HYPO.level1 - 1}`,
            mmol: `${m(HYPO.level2)}–${m(HYPO.level1 - 1)}`,
        },
        {
            reading: "Normal fasting",
            mgdl: `${HYPO.level1}–${FASTING.prediabetes - 1}`,
            mmol: `${m(HYPO.level1)}–${m(FASTING.prediabetes - 1)}`,
        },
        {
            reading: "Prediabetes (fasting)",
            mgdl: `${FASTING.prediabetes}–${FASTING.diabetes - 1}`,
            mmol: `${m(FASTING.prediabetes)}–${m(FASTING.diabetes - 1)}`,
        },
        {
            reading: "Diabetes range (fasting)",
            mgdl: `${FASTING.diabetes} or higher`,
            mmol: `${m(FASTING.diabetes)} or higher`,
        },
        {
            reading: "Normal 2 hours after glucose load",
            mgdl: `Below ${POST_MEAL.prediabetes}`,
            mmol: `Below ${m(POST_MEAL.prediabetes)}`,
        },
        {
            reading: "Diabetes range (2 hours)",
            mgdl: `${POST_MEAL.diabetes} or higher`,
            mmol: `${m(POST_MEAL.diabetes)} or higher`,
        },
        {
            reading: "Common target for people with diabetes",
            mgdl: `${GLUCOSE_TARGET.low}–${GLUCOSE_TARGET.high}`,
            mmol: `${m(GLUCOSE_TARGET.low)}–${m(GLUCOSE_TARGET.high)}`,
        },
    ];
}
