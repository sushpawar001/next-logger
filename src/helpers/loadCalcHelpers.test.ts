import { describe, expect, it } from "vitest";
import {
    calcOneSideWeight,
    greedyApproach,
    mathApproach,
    robustApproach,
    totalWeight,
} from "./loadCalcHelpers";

/** The plate set behind the /load barbell calculator. */
const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
const BAR = 20;

describe("totalWeight", () => {
    it("counts every plate twice and adds the bar", () => {
        expect(totalWeight([20, 10], BAR)).toBe(80);
    });

    it("returns just the bar for an empty set", () => {
        expect(totalWeight([], BAR)).toBe(BAR);
    });

    it("handles fractional plates", () => {
        expect(totalWeight([1.25], BAR)).toBe(22.5);
    });
});

describe("calcOneSideWeight", () => {
    it("splits the load above the bar across both sides", () => {
        expect(calcOneSideWeight(100, BAR)).toBe(40);
    });

    it.each([
        ["equal to the bar", BAR],
        ["below the bar", 10],
    ])("returns 0 when the load is %s", (_label, load) => {
        expect(calcOneSideWeight(load, BAR)).toBe(0);
    });
});

describe("greedyApproach", () => {
    it("takes the heaviest plates first", () => {
        expect(greedyApproach(40, PLATES)).toEqual([25, 15]);
    });

    it("reuses a plate size as many times as it fits", () => {
        expect(greedyApproach(50, PLATES)).toEqual([25, 25]);
    });

    it("returns an empty set for zero weight", () => {
        expect(greedyApproach(0, PLATES)).toEqual([]);
    });

    it("stops when no remaining plate is small enough", () => {
        // 1 kg cannot be made from a set whose smallest plate is 1.25
        expect(greedyApproach(1, PLATES)).toEqual([]);
    });

    it("leaves the caller's plate array untouched", () => {
        const plates = [...PLATES];

        greedyApproach(40, plates);

        expect(plates).toEqual(PLATES);
    });

    it("reaches an exact solution when one exists", () => {
        const loaded = greedyApproach(38.75, PLATES);

        expect(loaded.reduce((sum, p) => sum + p, 0)).toBe(38.75);
    });
});

describe("mathApproach", () => {
    it("returns a symmetric set when the weight divides evenly", () => {
        // 40 per side = 2 x 20
        expect(mathApproach(40, PLATES)).toEqual([20, 20]);
    });

    it("prefers fewer sets, trying 2 before 3 and 4", () => {
        const result = mathApproach(50, PLATES)!;

        expect(result).toEqual([25, 25]);
    });

    it("uses the small-load range when the total is 40kg or under", () => {
        // oneSideWeight * 2 <= 40 switches the set counts to [1, 2]
        expect(mathApproach(20, PLATES)).toEqual([20]);
    });

    it("returns an array whose plates all come from the available set", () => {
        const result = mathApproach(45, PLATES);

        if (result) {
            for (const plate of result) expect(PLATES).toContain(plate);
        }
    });

    // KNOWN BUG (docs/BUGS.md #26): the declared return type is `number[] | null`,
    // but when no set can be built the loop exits with `plates` left as
    // undefined, so callers checking `=== null` would miss it. `robustApproach`
    // happens to use a truthy check, so it is unaffected.
    // Characterizing current behavior.
    it("returns undefined, not null, when nothing can be built", () => {
        expect(mathApproach(40, [])).toBeUndefined();
    });
});

describe("robustApproach", () => {
    it("hits the requested load exactly when possible", () => {
        const plates = robustApproach(100, BAR, PLATES);

        expect(totalWeight(plates, BAR)).toBe(100);
    });

    it.each([60, 80, 100, 120, 140])(
        "produces a loadable, exact solution for %ikg",
        (load) => {
            const plates = robustApproach(load, BAR, PLATES);

            expect(totalWeight(plates, BAR)).toBe(load);
            for (const plate of plates) expect(PLATES).toContain(plate);
        }
    );

    it("returns an empty set when the load is at or below the bar", () => {
        expect(robustApproach(BAR, BAR, PLATES)).toEqual([]);
    });

    it("falls back to the greedy result when the math approach fails", () => {
        // An empty plate set forces mathApproach to bail out
        expect(robustApproach(100, BAR, [])).toEqual([]);
    });

    it("tops up with greedy plates when the symmetric set undershoots", () => {
        const plates = robustApproach(102.5, BAR, PLATES);

        expect(totalWeight(plates, BAR)).toBeCloseTo(102.5, 5);
    });
});
