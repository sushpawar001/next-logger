/**
 * Weight-loss progress: percentage lost, progress towards a goal, average
 * weekly rate and a projected goal date if that rate continues. All weights
 * must be in the same unit; the maths is unit-free.
 */

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

export interface WeightLossInput {
    start: number;
    current: number;
    /** Optional; NaN when not given. */
    goal: number;
    /** Optional start date; null when not given. */
    startDate: Date | null;
    today: Date;
}

export interface WeightLossResult {
    /** Positive when weight has gone down. */
    change: number;
    /** Change as a share of the starting weight, %. Positive = loss. */
    percentLost: number;
    /** Share of the planned loss achieved, %, or null without a goal. */
    goalProgress: number | null;
    /** Still to lose, or null without a goal. */
    remaining: number | null;
    weeks: number | null;
    /** Average loss per week; null without a start date. */
    weeklyRate: number | null;
    /** Projected date to reach the goal at the current rate, or null. */
    projectedGoalDate: Date | null;
    /** Target weights for the 5% and 10% milestones. */
    milestones: { percent: 5 | 10; weight: number; reached: boolean }[];
}

/** Parses a yyyy-mm-dd input value as a local calendar date. */
export function parseDateInput(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime()) ? null : date;
}

export function weightLossProgress(input: WeightLossInput): WeightLossResult | null {
    const { start, current, goal, startDate, today } = input;
    if (!Number.isFinite(start) || !Number.isFinite(current) || start <= 0 || current <= 0) {
        return null;
    }

    const change = start - current;
    const hasGoal = Number.isFinite(goal) && goal > 0 && goal < start;
    const goalProgress = hasGoal ? (change / (start - goal)) * 100 : null;
    const remaining = hasGoal ? Math.max(0, current - goal) : null;

    const weeks =
        startDate && startDate.getTime() < today.getTime()
            ? (today.getTime() - startDate.getTime()) / MS_PER_WEEK
            : null;
    const weeklyRate = weeks !== null && weeks >= 1 ? change / weeks : null;

    let projectedGoalDate: Date | null = null;
    if (remaining !== null && remaining > 0 && weeklyRate !== null && weeklyRate > 0) {
        projectedGoalDate = new Date(today.getTime() + (remaining / weeklyRate) * MS_PER_WEEK);
    }

    return {
        change,
        percentLost: (change / start) * 100,
        goalProgress,
        remaining,
        weeks,
        weeklyRate,
        projectedGoalDate,
        milestones: ([5, 10] as const).map((percent) => {
            const weight = start * (1 - percent / 100);
            return { percent, weight, reached: current <= weight };
        }),
    };
}
