import {
    ACTIVITY_FACTORS,
    calculateBMR,
    validateInputs,
    type FormData,
} from "./bmr";

/**
 * Daily energy needs, built on the BMR calculator's Mifflin-St Jeor maths.
 * TDEE = BMR × activity factor. Deficit and maintenance plans are simple
 * offsets from TDEE; the ~7,700 kcal per kg of body weight rule is a
 * first-order estimate that overstates long-run loss as metabolism adapts.
 */

export type ActivityLevel = keyof typeof ACTIVITY_FACTORS;

export const ACTIVITY_LEVELS = Object.keys(ACTIVITY_FACTORS) as ActivityLevel[];

export const KCAL_PER_KG = 7700;

/** Common minimum intakes without medical supervision. */
export const CALORIE_FLOOR = { male: 1500, female: 1200 } as const;

/** Weekly loss rates offered, in kg. */
export const PACES = [0.25, 0.5, 0.75, 1] as const;
export type Pace = (typeof PACES)[number];

export interface EnergyResult {
    bmr: number;
    tdee: number;
}

/** BMR and TDEE, or null while the body-stats form is incomplete or invalid. */
export function energyNeeds(
    form: FormData,
    activity: ActivityLevel
): EnergyResult | null {
    if (validateInputs(form).length > 0) return null;
    const { bmr } = calculateBMR(form);
    const tdee = bmr * ACTIVITY_FACTORS[activity];
    if (!Number.isFinite(tdee) || tdee <= 0) return null;
    return { bmr, tdee };
}

export interface DeficitPlan {
    pace: Pace;
    dailyDeficit: number;
    target: number;
    floor: number;
    belowFloor: boolean;
}

export function deficitPlan(
    tdee: number,
    sex: FormData["gender"],
    pace: Pace
): DeficitPlan {
    const dailyDeficit = (pace * KCAL_PER_KG) / 7;
    const target = tdee - dailyDeficit;
    const floor = CALORIE_FLOOR[sex];
    return { pace, dailyDeficit, target, floor, belowFloor: target < floor };
}

export function deficitTable(tdee: number, sex: FormData["gender"]) {
    return PACES.map((pace) => deficitPlan(tdee, sex, pace));
}

/** Whole weeks to reach a lower goal weight at a steady pace. */
export function weeksToGoal(
    currentKg: number,
    goalKg: number,
    pace: Pace
): number | null {
    if (
        !Number.isFinite(currentKg) ||
        !Number.isFinite(goalKg) ||
        goalKg <= 0 ||
        goalKg >= currentKg
    ) {
        return null;
    }
    return Math.ceil((currentKg - goalKg) / pace);
}

export function maintenancePlan(tdee: number) {
    return {
        low: tdee - 100,
        high: tdee + 100,
        leanGain: tdee + 250,
        cut: tdee - 500,
    };
}
