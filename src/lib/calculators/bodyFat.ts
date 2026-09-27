/**
 * Body fat % from circumferences: the US Navy method (Hodgdon & Beckett,
 * Naval Health Research Center reports 84-11 and 84-29, 1984), metric form:
 *   men:   495 / (1.0324 − 0.19077·log10(waist − neck) + 0.15456·log10(height)) − 450
 *   women: 495 / (1.29579 − 0.35004·log10(waist + hip − neck) + 0.22100·log10(height)) − 450
 * All lengths in centimetres.
 */

export type Sex = "male" | "female";

export interface NavyInput {
    sex: Sex;
    heightCm: number;
    neckCm: number;
    waistCm: number;
    /** Required for women, ignored for men. */
    hipCm?: number;
}

/** Outside this range the equations are extrapolating past their data. */
export const BODY_FAT_BOUNDS = { min: 2, max: 60 } as const;

export function navyBodyFat(input: NavyInput): number | null {
    const { sex, heightCm, neckCm, waistCm, hipCm } = input;
    const values = [heightCm, neckCm, waistCm, ...(sex === "female" ? [hipCm] : [])];
    if (values.some((v) => v === undefined || !Number.isFinite(v) || v <= 0)) {
        return null;
    }

    const girth = sex === "male" ? waistCm - neckCm : waistCm + hipCm! - neckCm;
    if (girth <= 0) return null;

    const density =
        sex === "male"
            ? 1.0324 - 0.19077 * Math.log10(girth) + 0.15456 * Math.log10(heightCm)
            : 1.29579 -
              0.35004 * Math.log10(girth) +
              0.221 * Math.log10(heightCm);
    const pct = 495 / density - 450;

    if (
        !Number.isFinite(pct) ||
        pct < BODY_FAT_BOUNDS.min ||
        pct > BODY_FAT_BOUNDS.max
    ) {
        return null;
    }
    return pct;
}

export type BodyFatCategory =
    | "belowEssential"
    | "essential"
    | "athletes"
    | "fitness"
    | "average"
    | "obese";

interface Band {
    category: BodyFatCategory;
    label: string;
    range: string;
    min: number;
    max: number;
}

/**
 * American Council on Exercise categories. Bands are half-open [min, max) and
 * contiguous, so every value lands in exactly one.
 */
export const BODY_FAT_CATEGORIES: Record<Sex, Band[]> = {
    male: [
        { category: "belowEssential", label: "Below essential fat", range: "Below 2%", min: 0, max: 2 },
        { category: "essential", label: "Essential fat", range: "2–5%", min: 2, max: 6 },
        { category: "athletes", label: "Athletes", range: "6–13%", min: 6, max: 14 },
        { category: "fitness", label: "Fitness", range: "14–17%", min: 14, max: 18 },
        { category: "average", label: "Average", range: "18–24%", min: 18, max: 25 },
        { category: "obese", label: "Obese", range: "25% or more", min: 25, max: Infinity },
    ],
    female: [
        { category: "belowEssential", label: "Below essential fat", range: "Below 10%", min: 0, max: 10 },
        { category: "essential", label: "Essential fat", range: "10–13%", min: 10, max: 14 },
        { category: "athletes", label: "Athletes", range: "14–20%", min: 14, max: 21 },
        { category: "fitness", label: "Fitness", range: "21–24%", min: 21, max: 25 },
        { category: "average", label: "Average", range: "25–31%", min: 25, max: 32 },
        { category: "obese", label: "Obese", range: "32% or more", min: 32, max: Infinity },
    ],
};

export function classifyBodyFat(pct: number, sex: Sex): Band | null {
    if (!Number.isFinite(pct) || pct < 0) return null;
    // Classify on the one-decimal value the user sees, so 13.96% shown as
    // "14.0%" is not reported as the band below.
    const shown = Math.round(pct * 10) / 10;
    return (
        BODY_FAT_CATEGORIES[sex].find((b) => shown >= b.min && shown < b.max) ??
        null
    );
}

export function fatAndLeanMass(pct: number, weightKg: number) {
    const fatKg = (weightKg * pct) / 100;
    return { fatKg, leanKg: weightKg - fatKg };
}
