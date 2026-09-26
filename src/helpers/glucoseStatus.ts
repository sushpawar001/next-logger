import { GLUCOSE_TARGET } from "@/constants/constants";

export type GlucoseStatus = "low" | "in" | "high";

/** Where a reading sits against the target range. The bounds are in range. */
export function glucoseStatus(value: number): GlucoseStatus {
    if (value < GLUCOSE_TARGET.low) return "low";
    if (value > GLUCOSE_TARGET.high) return "high";
    return "in";
}

/** Share of readings below, inside and above the range, as whole percentages. */
export function timeInRange(values: number[]): Record<GlucoseStatus, number> {
    if (values.length === 0) return { low: 0, in: 0, high: 0 };
    const counts = { low: 0, in: 0, high: 0 };
    for (const v of values) counts[glucoseStatus(v)]++;
    const pct = (n: number) => Math.round((n / values.length) * 100);
    const low = pct(counts.low);
    const high = pct(counts.high);
    // Derive "in" so the three always add up to 100 after rounding.
    return { low, in: 100 - low - high, high };
}
