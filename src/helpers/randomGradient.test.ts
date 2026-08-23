import { afterEach, describe, expect, it, vi } from "vitest";
import {
    randomGradient,
    randomGradient2,
    randomLinearGradient,
    randomPattern,
} from "./randomGradient";

/**
 * These generate CSS gradient strings from Math.random(), so the tests pin the
 * randomness rather than asserting exact colours.
 */
const seedRandom = (value = 0.5) =>
    vi.spyOn(Math, "random").mockReturnValue(value);

afterEach(() => {
    vi.restoreAllMocks();
});

const GENERATORS = [
    ["randomGradient", randomGradient],
    ["randomGradient2", randomGradient2],
    ["randomLinearGradient", randomLinearGradient],
    ["randomPattern", randomPattern],
] as const;

describe.each(GENERATORS)("%s", (_name, generate) => {
    it("returns the requested number of entries", () => {
        seedRandom();

        expect(generate(5)).toHaveLength(5);
    });

    it("returns CSS gradient strings", () => {
        seedRandom();

        for (const value of generate(3)) {
            expect(typeof value).toBe("string");
            expect(value).toMatch(/gradient|url|#|rgb/i);
        }
    });

    it("is deterministic for a fixed random source", () => {
        seedRandom(0.25);
        const first = generate(4);
        seedRandom(0.25);
        const second = generate(4);

        expect(first).toEqual(second);
    });

    it("returns something for a single entry", () => {
        seedRandom();

        expect(generate(1).length).toBeGreaterThan(0);
    });
});

describe("randomGradient2", () => {
    /**
     * KNOWN BUG (docs/BUGS.md #27): the final assembly is
     * `[firstElem, ...gradients.slice(0, num - 2), gradients[0]]`, so the
     * length only equals `num` when num >= 2 -- asking for 1 gradient returns
     * 3. Characterizing current behavior.
     */
    it("returns three entries when asked for one", () => {
        seedRandom();

        expect(randomGradient2(1)).toHaveLength(3);
    });

    it("returns the requested count for two or more", () => {
        seedRandom();

        expect(randomGradient2(2)).toHaveLength(2);
        expect(randomGradient2(6)).toHaveLength(6);
    });

    it("always leads with the fixed brand gradient", () => {
        seedRandom();

        expect(randomGradient2(4)[0]).toContain("30% 65%");
    });
});

describe("randomGradient", () => {
    /** The last entry repeats the first so a loop of swatches joins up. */
    it("closes the loop by repeating the first gradient", () => {
        seedRandom();

        const gradients = randomGradient(4);

        expect(gradients[gradients.length - 1]).toBe(gradients[0]);
    });

    it("uses the brand purple", () => {
        seedRandom();

        expect(randomGradient(2)[0]).toContain("94, 74, 227");
    });

    it("varies with the random source", () => {
        seedRandom(0.1);
        const low = randomGradient(3)[0];
        vi.restoreAllMocks();
        seedRandom(0.9);
        const high = randomGradient(3)[0];

        expect(low).not.toBe(high);
    });
});
