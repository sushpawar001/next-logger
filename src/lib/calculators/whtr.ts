/**
 * Waist-to-height ratio: waist ÷ height, both in the same unit. The advice is
 * to keep your waist to less than half your height. Bands follow NICE NG246
 * rec 1.9.14 (0.4-0.49 healthy, 0.5-0.59 increased risk, 0.6+ high risk); the
 * "take care" band below 0.4 is from Ashwell's charts (Open Obesity J 2011).
 */

export type WhtrCategory = "low" | "healthy" | "increased" | "high";

interface Band {
    category: WhtrCategory;
    label: string;
    range: string;
    min: number;
    max: number;
}

export const WHTR_BANDS: Band[] = [
    { category: "low", label: "Take care (below 0.4)", range: "Below 0.4", min: 0, max: 0.4 },
    { category: "healthy", label: "Healthy", range: "0.4 to 0.49", min: 0.4, max: 0.5 },
    { category: "increased", label: "Increased health risk", range: "0.5 to 0.59", min: 0.5, max: 0.6 },
    { category: "high", label: "High health risk", range: "0.6 or more", min: 0.6, max: Infinity },
];

export function waistToHeight(waist: number, height: number): number | null {
    if (!Number.isFinite(waist) || !Number.isFinite(height) || waist <= 0 || height <= 0) {
        return null;
    }
    const ratio = waist / height;
    // A waist bigger than the whole height, or under a tenth of it, is a typo.
    return ratio < 0.1 || ratio > 1.5 ? null : ratio;
}

export function classifyWhtr(ratio: number): Band | null {
    if (!Number.isFinite(ratio) || ratio <= 0) return null;
    // Classify on the two-decimal value shown, so 0.499 shown as "0.50" is
    // not reported as healthy.
    const shown = Math.round(ratio * 100) / 100;
    return WHTR_BANDS.find((b) => shown >= b.min && shown < b.max) ?? null;
}

/** The waist size that keeps the ratio below 0.5. */
export const healthyWaistLimit = (height: number) => height / 2;
