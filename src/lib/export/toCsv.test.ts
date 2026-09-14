import { describe, expect, it } from "vitest";
import formatDate from "@/helpers/formatDate";
import { rowsToCsv } from "./toCsv";
import { metricMeta } from "./metricMeta";

describe("rowsToCsv", () => {
    it("writes a header row with units, CRLF-joined", () => {
        const csv = rowsToCsv([], metricMeta.glucose.columns);
        expect(csv).toBe("Date,Glucose (mg/dL),Tag");
        expect(csv.includes("\r\n")).toBe(false); // header only, no rows
    });

    it("formats createdAt through formatDate and renders values", () => {
        const iso = "2026-09-14T08:30:00.000Z";
        const csv = rowsToCsv(
            [{ createdAt: iso, value: 110, tag: "Fasting" }],
            metricMeta.glucose.columns
        );
        const [header, row] = csv.split("\r\n");
        expect(header).toBe("Date,Glucose (mg/dL),Tag");
        // formatDate output contains a comma, so it is (correctly) quoted
        expect(row).toBe(`"${formatDate(iso)}",110,Fasting`);
    });

    it("blanks null/undefined cells (e.g. no tag)", () => {
        const csv = rowsToCsv(
            [{ createdAt: "2026-09-14T08:30:00.000Z", value: 90, tag: null }],
            metricMeta.glucose.columns
        );
        expect(csv.split("\r\n")[1].endsWith(",90,")).toBe(true);
    });

    it("escapes commas, quotes and newlines per RFC 4180", () => {
        const csv = rowsToCsv(
            [
                {
                    createdAt: "2026-09-14T08:30:00.000Z",
                    value: 100,
                    tag: 'a,"b"\nc',
                },
            ],
            metricMeta.glucose.columns
        );
        // comma/quote/newline field is wrapped and inner quotes doubled
        expect(csv).toContain('"a,""b""\nc"');
    });

    it("serialises every measurement circumference column", () => {
        const csv = rowsToCsv(
            [
                {
                    createdAt: "2026-09-14T08:30:00.000Z",
                    arms: 30,
                    chest: 100,
                    abdomen: 85,
                    waist: 80,
                    hip: 95,
                    thighs: 55,
                    calves: 38,
                    tag: null,
                },
            ],
            metricMeta.measurements.columns
        );
        const [, row] = csv.split("\r\n");
        expect(row).toContain("30,100,85,80,95,55,38");
    });
});
