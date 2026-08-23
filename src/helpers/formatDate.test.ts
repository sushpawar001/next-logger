import { describe, expect, it } from "vitest";
import formatDate, {
    DatetimeLocalFormat,
    ShortDateformat,
} from "./formatDate";

/**
 * Timezone drift has been a recurring bug source here, so these assert the
 * UTC -> local conversion explicitly. The suite pins TZ=UTC (see
 * vitest.config.ts) so `dayjs.tz.guess()` resolves predictably; the tests below
 * assert format and round-trip rather than a hardcoded offset.
 */
const UTC_INSTANT = "2026-01-30T08:05:00.000Z";

describe("formatDate (default export)", () => {
    it('formats as "DD MMM YY, hh:mm A"', () => {
        expect(formatDate(UTC_INSTANT)).toMatch(
            /^\d{2} [A-Z][a-z]{2} \d{2}, \d{2}:\d{2} (AM|PM)$/
        );
    });

    it("accepts a Date as well as a string", () => {
        expect(formatDate(new Date(UTC_INSTANT))).toBe(formatDate(UTC_INSTANT));
    });

    it("is stable for the same instant", () => {
        expect(formatDate(UTC_INSTANT)).toBe(formatDate(UTC_INSTANT));
    });

    it("distinguishes different instants", () => {
        expect(formatDate("2026-01-30T08:05:00.000Z")).not.toBe(
            formatDate("2026-02-15T19:45:00.000Z")
        );
    });
});

describe("ShortDateformat", () => {
    it('formats as "DD-MM hh:mm A"', () => {
        expect(ShortDateformat(UTC_INSTANT)).toMatch(
            /^\d{2}-\d{2} \d{2}:\d{2} (AM|PM)$/
        );
    });

    it("accepts a Date as well as a string", () => {
        expect(ShortDateformat(new Date(UTC_INSTANT))).toBe(
            ShortDateformat(UTC_INSTANT)
        );
    });

    it("uses a 12-hour clock", () => {
        const hour = Number(ShortDateformat(UTC_INSTANT).split(" ")[1].split(":")[0]);

        expect(hour).toBeGreaterThanOrEqual(1);
        expect(hour).toBeLessThanOrEqual(12);
    });
});

describe("DatetimeLocalFormat", () => {
    it("produces a value a datetime-local input accepts", () => {
        expect(DatetimeLocalFormat(UTC_INSTANT)).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
        );
    });

    it("round-trips through a Date without drifting", () => {
        const formatted = DatetimeLocalFormat(UTC_INSTANT);

        expect(DatetimeLocalFormat(new Date(formatted))).toBe(formatted);
    });

    it("does not apply the UTC conversion the other two formatters do", () => {
        // DatetimeLocalFormat calls dayjs(raw) directly, with no .utc().tz()
        expect(DatetimeLocalFormat(UTC_INSTANT)).toBe(
            `${UTC_INSTANT.slice(0, 10)}T${UTC_INSTANT.slice(11, 16)}`
        );
    });
});
