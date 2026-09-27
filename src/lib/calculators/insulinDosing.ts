import { HYPO } from "./bloodSugar";
import { mgdlToMmol, toMgdl, type GlucoseUnit } from "@/lib/units/glucose";

/**
 * Rules of thumb for insulin dosing, for education only. Sources: Texas DSHS
 * Diabetes Toolkit, "Insulin Pump Therapy" (1800/1500 correction rules and the
 * 500/450 carb-ratio rules), Whittington Health NHS Trust "Adjusting insulin"
 * (the mmol/L "100 rule"), and Nationwide Children's Hospital "Calculating
 * Bolus Injections" (meal + correction). Insulin on board only offsets a
 * positive correction, never the meal dose (Walsh et al., JDST 2011).
 *
 * None of this replaces the settings a care team gives a person.
 */

export type InsulinKind = "rapid" | "regular";

/** Plausible total daily insulin dose, units. */
export const TDD_BOUNDS = { min: 2, max: 300 } as const;

export const CORRECTION_RULE: Record<InsulinKind, number> = { rapid: 1800, regular: 1500 };
export const CARB_RULE: Record<InsulinKind, number> = { rapid: 500, regular: 450 };

const validTdd = (tdd: number) =>
    Number.isFinite(tdd) && tdd >= TDD_BOUNDS.min && tdd <= TDD_BOUNDS.max;

/**
 * Correction factor (insulin sensitivity factor): how far one unit lowers
 * blood glucose. The mmol/L figure is the same rule converted, which is where
 * the "100 rule" comes from (1800 ÷ 18 ≈ 100).
 */
export function correctionFactor(tdd: number, kind: InsulinKind) {
    if (!validTdd(tdd)) return null;
    const mgdl = CORRECTION_RULE[kind] / tdd;
    return { mgdl, mmol: mgdlToMmol(mgdl), rule: CORRECTION_RULE[kind] };
}

/** Insulin-to-carb ratio: grams of carbohydrate covered by one unit. */
export function carbRatio(tdd: number, kind: InsulinKind) {
    if (!validTdd(tdd)) return null;
    return { grams: CARB_RULE[kind] / tdd, rule: CARB_RULE[kind] };
}

export interface BolusInput {
    carbs: number;
    /** Grams of carbohydrate per unit. */
    carbRatio: number;
    glucose: number;
    target: number;
    /** Glucose drop per unit, in `unit`. */
    sensitivity: number;
    /** Insulin still active from earlier doses; 0 if none. */
    onBoard: number;
    unit: GlucoseUnit;
}

export type BolusResult =
    | { status: "low" }
    | {
          status: "ok";
          meal: number;
          /** Before insulin on board; negative when below target. */
          correction: number;
          onBoardUsed: number;
          total: number;
      };

export function bolusDose(input: BolusInput): BolusResult | null {
    const { carbs, carbRatio, glucose, target, sensitivity, onBoard, unit } = input;
    const positive = [carbRatio, glucose, target, sensitivity];
    if (positive.some((v) => !Number.isFinite(v) || v <= 0)) return null;
    if (!Number.isFinite(carbs) || carbs < 0) return null;
    if (!Number.isFinite(onBoard) || onBoard < 0) return null;

    // Never suggest insulin for a low reading.
    if (toMgdl(glucose, unit) < HYPO.level1) return { status: "low" };

    const meal = carbs / carbRatio;
    const correction = (glucose - target) / sensitivity;
    // Insulin on board offsets only a positive correction.
    const onBoardUsed = correction > 0 ? Math.min(onBoard, correction) : 0;
    const total = Math.max(0, meal + correction - onBoardUsed);

    return { status: "ok", meal, correction, onBoardUsed, total };
}
