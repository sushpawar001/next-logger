/**
 * One-rep max (1RM) estimates from a set taken close to failure.
 *   Epley (1985):    1RM = weight × (1 + reps / 30)
 *   Brzycki (1993):  1RM = weight × 36 / (37 − reps)
 *   Lombardi (1989): 1RM = weight × reps^0.10
 * Prediction is most accurate with 10 reps or fewer (Reynolds et al., JSCR
 * 2006); above that the estimate is shown but flagged as less reliable.
 * The %1RM-to-reps chart is the NSCA Training Load Chart.
 */

export const MAX_REPS = 12;
export const RELIABLE_REPS = 10;

export const epley = (weight: number, reps: number) => weight * (1 + reps / 30);
export const brzycki = (weight: number, reps: number) => (weight * 36) / (37 - reps);
export const lombardi = (weight: number, reps: number) => weight * reps ** 0.1;

export interface OneRepMaxResult {
    epley: number;
    brzycki: number;
    lombardi: number;
    /** Mean of the three formulas. */
    average: number;
    /** False above 10 reps, where every formula loses accuracy. */
    reliable: boolean;
}

export function estimateOneRepMax(weight: number, reps: number): OneRepMaxResult | null {
    if (!Number.isFinite(weight) || weight <= 0) return null;
    if (!Number.isInteger(reps) || reps < 1 || reps > MAX_REPS) return null;

    // A single rep is already a 1RM; the formulas would inflate it slightly.
    if (reps === 1) {
        return { epley: weight, brzycki: weight, lombardi: weight, average: weight, reliable: true };
    }

    const e = epley(weight, reps);
    const b = brzycki(weight, reps);
    const l = lombardi(weight, reps);
    return {
        epley: e,
        brzycki: b,
        lombardi: l,
        average: (e + b + l) / 3,
        reliable: reps <= RELIABLE_REPS,
    };
}

/** NSCA Training Load Chart: reps typically possible at each %1RM. */
export const NSCA_LOAD_CHART: { reps: number; percent: number }[] = [
    { reps: 1, percent: 100 },
    { reps: 2, percent: 95 },
    { reps: 3, percent: 93 },
    { reps: 4, percent: 90 },
    { reps: 5, percent: 87 },
    { reps: 6, percent: 85 },
    { reps: 7, percent: 83 },
    { reps: 8, percent: 80 },
    { reps: 9, percent: 77 },
    { reps: 10, percent: 75 },
    { reps: 12, percent: 70 },
];

/** Training loads at each chart percentage for a given 1RM. */
export function trainingLoads(oneRepMax: number) {
    return NSCA_LOAD_CHART.map(({ reps, percent }) => ({
        reps,
        percent,
        load: (oneRepMax * percent) / 100,
    }));
}
