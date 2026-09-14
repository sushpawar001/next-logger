import { describe, expect, it } from "vitest";
import { columnHeader, METRICS, metricMeta } from "./metricMeta";

describe("metricMeta", () => {
    it("defines an entry for every exportable metric", () => {
        expect(METRICS).toEqual([
            "glucose",
            "insulin",
            "weight",
            "measurements",
        ]);
        METRICS.forEach((key) => {
            const meta = metricMeta[key];
            expect(meta.key).toBe(key);
            expect(meta.label).toBeTruthy();
            expect(meta.fileBase).toBeTruthy();
            expect(meta.endpoint).toBe(`/api/${key}/get`);
            expect(meta.columns.length).toBeGreaterThan(0);
        });
    });

    it("leads every metric with a Date column and ends with a Tag column", () => {
        METRICS.forEach((key) => {
            const cols = metricMeta[key].columns;
            expect(cols[0].key).toBe("createdAt");
            expect(cols[cols.length - 1].key).toBe("tag");
        });
    });

    it("appends the unit to headers that have one", () => {
        expect(columnHeader({ key: "value", header: "Glucose", unit: "mg/dL" })).toBe(
            "Glucose (mg/dL)"
        );
        expect(columnHeader({ key: "createdAt", header: "Date" })).toBe("Date");
    });
});
