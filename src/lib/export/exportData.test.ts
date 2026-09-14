import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/query/fetchers", () => ({ getList: vi.fn() }));
vi.mock("./download", () => ({ downloadBlob: vi.fn() }));
vi.mock("./toPdf", () => ({
    exportPdf: vi.fn(async () => new Blob(["%PDF"], { type: "application/pdf" })),
}));

import { getList } from "@/lib/query/fetchers";
import { downloadBlob } from "./download";
import { exportPdf } from "./toPdf";
import { runExport } from "./exportData";
import { ALL_DAYS } from "./filterByPeriod";

const getListMock = vi.mocked(getList);
const downloadMock = vi.mocked(downloadBlob);
const pdfMock = vi.mocked(exportPdf);

const ROWS: Record<string, any[]> = {
    "/api/glucose/get": [
        { createdAt: "2026-09-14T00:00:00.000Z", value: 110, tag: "Fasting" },
        { createdAt: "2026-09-13T00:00:00.000Z", value: 95, tag: null },
    ],
    "/api/weight/get": [
        { createdAt: "2026-09-14T00:00:00.000Z", value: 70, tag: null },
    ],
};

beforeEach(() => {
    getListMock.mockImplementation(async (url: string) => ROWS[url] ?? []);
});

describe("runExport", () => {
    it("rejects when no dataset is selected", async () => {
        await expect(
            runExport({ metrics: [], days: 30, format: "csv" })
        ).rejects.toThrow(/no datasets/i);
    });

    it("downloads one CSV file per selected metric", async () => {
        const total = await runExport({
            metrics: ["glucose", "weight"],
            days: ALL_DAYS,
            format: "csv",
        });

        expect(total).toBe(3);
        expect(downloadMock).toHaveBeenCalledTimes(2);

        const names = downloadMock.mock.calls.map((c) => c[0]);
        expect(names[0]).toMatch(/^glucose_\d{4}-\d{2}-\d{2}\.csv$/);
        expect(names[1]).toMatch(/^weight_\d{4}-\d{2}-\d{2}\.csv$/);
        // CSV content, glucose header present
        expect(downloadMock.mock.calls[0][1]).toContain("Date,Glucose (mg/dL),Tag");
        expect(downloadMock.mock.calls[0][2]).toContain("text/csv");
    });

    it("downloads a single combined JSON file", async () => {
        const total = await runExport({
            metrics: ["glucose", "weight"],
            days: ALL_DAYS,
            format: "json",
        });

        expect(total).toBe(3);
        expect(downloadMock).toHaveBeenCalledTimes(1);

        const [name, content, mime] = downloadMock.mock.calls[0];
        expect(name).toMatch(/^fitdose_export_\d{4}-\d{2}-\d{2}\.json$/);
        expect(mime).toBe("application/json");

        const parsed = JSON.parse(content as string);
        expect(parsed.periodDays).toBe(ALL_DAYS);
        expect(parsed.glucose).toHaveLength(2);
        expect(parsed.weight).toHaveLength(1);
        expect(typeof parsed.exportedAt).toBe("string");
    });

    it("builds a single combined PDF document by default", async () => {
        await runExport({
            metrics: ["glucose", "weight"],
            days: 30,
            format: "pdf",
        });

        expect(pdfMock).toHaveBeenCalledTimes(1);
        expect(pdfMock.mock.calls[0][0]).toHaveLength(2);
        expect(pdfMock.mock.calls[0][1]).toBe("Last 30 days");

        expect(downloadMock).toHaveBeenCalledTimes(1);
        expect(downloadMock.mock.calls[0][0]).toMatch(
            /^fitdose_export_\d{4}-\d{2}-\d{2}\.pdf$/
        );
        expect(downloadMock.mock.calls[0][2]).toBe("application/pdf");
    });

    it("builds one PDF per metric in separate mode", async () => {
        await runExport({
            metrics: ["glucose", "weight"],
            days: ALL_DAYS,
            format: "pdf",
            pdfMode: "separate",
        });

        // one exportPdf + one download per selected metric, each single-metric
        expect(pdfMock).toHaveBeenCalledTimes(2);
        expect(pdfMock.mock.calls[0][0]).toEqual([
            { key: "glucose", rows: ROWS["/api/glucose/get"] },
        ]);
        expect(pdfMock.mock.calls[1][0]).toEqual([
            { key: "weight", rows: ROWS["/api/weight/get"] },
        ]);

        expect(downloadMock).toHaveBeenCalledTimes(2);
        expect(downloadMock.mock.calls[0][0]).toMatch(
            /^glucose_\d{4}-\d{2}-\d{2}\.pdf$/
        );
        expect(downloadMock.mock.calls[1][0]).toMatch(
            /^weight_\d{4}-\d{2}-\d{2}\.pdf$/
        );
    });

    it("applies the period filter before counting", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-09-14T12:00:00.000Z"));

        // both glucose rows are within 7 days; only keep the recent one by
        // pushing the second far into the past.
        getListMock.mockResolvedValueOnce([
            { createdAt: "2026-09-14T00:00:00.000Z", value: 110 },
            { createdAt: "2020-01-01T00:00:00.000Z", value: 95 },
        ]);

        const total = await runExport({
            metrics: ["glucose"],
            days: 7,
            format: "json",
        });

        expect(total).toBe(1);
        vi.useRealTimers();
    });
});
