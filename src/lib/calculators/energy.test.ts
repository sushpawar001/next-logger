import { describe, expect, it } from "vitest";
import type { FormData } from "./bmr";
import {
    deficitPlan,
    deficitTable,
    energyNeeds,
    maintenancePlan,
    PACES,
    weeksToGoal,
} from "./energy";

const form = (overrides: Partial<FormData> = {}): FormData => ({
    age: "30",
    gender: "male",
    heightUnit: "cm",
    heightCm: "180",
    heightFeet: "",
    heightInches: "",
    weightUnit: "kg",
    weight: "80",
    ...overrides,
});

describe("energyNeeds", () => {
    it("multiplies Mifflin-St Jeor BMR by the activity factor", () => {
        // 10×80 + 6.25×180 − 5×30 + 5 = 1780
        const result = energyNeeds(form(), "sedentary")!;

        expect(result.bmr).toBe(1780);
        expect(result.tdee).toBeCloseTo(1780 * 1.2, 6);
    });

    it("uses the deliberate 1.465 factor for moderate activity", () => {
        expect(energyNeeds(form(), "moderate")!.tdee).toBeCloseTo(
            1780 * 1.465,
            6
        );
    });

    it("returns null while the form is incomplete", () => {
        expect(energyNeeds(form({ weight: "" }), "light")).toBeNull();
        expect(energyNeeds(form({ age: "abc" }), "light")).toBeNull();
    });
});

describe("deficitPlan", () => {
    it("subtracts 1,100 kcal a day per kg a week", () => {
        const plan = deficitPlan(2500, "male", 0.5);

        expect(plan.dailyDeficit).toBeCloseTo(550, 6);
        expect(plan.target).toBeCloseTo(1950, 6);
        expect(plan.belowFloor).toBe(false);
    });

    it("flags a target below the sex-specific floor", () => {
        expect(deficitPlan(2200, "female", 1).belowFloor).toBe(true);
        expect(deficitPlan(2200, "female", 0.25).belowFloor).toBe(false);
        expect(deficitPlan(2200, "female", 1).floor).toBe(1200);
        expect(deficitPlan(2200, "male", 1).floor).toBe(1500);
    });

    it("tabulates every pace in order", () => {
        expect(deficitTable(2500, "male").map((p) => p.pace)).toEqual([
            ...PACES,
        ]);
    });
});

describe("weeksToGoal", () => {
    it("rounds up to whole weeks", () => {
        expect(weeksToGoal(90, 80, 0.75)).toBe(14);
    });

    it.each([
        [80, 80],
        [80, 85],
        [80, 0],
        [NaN, 70],
    ])("returns null from %s kg to %s kg", (current, goal) => {
        expect(weeksToGoal(current, goal, 0.5)).toBeNull();
    });
});

describe("maintenancePlan", () => {
    it("gives a ±100 kcal range plus gain and cut targets", () => {
        expect(maintenancePlan(2400)).toEqual({
            low: 2300,
            high: 2500,
            leanGain: 2650,
            cut: 1900,
        });
    });
});
