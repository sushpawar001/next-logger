import { describe, expect, it, vi } from "vitest";

const { jsPDFCtor, autoTableMock, textMock, outputMock } = vi.hoisted(() => {
    const textMock = vi.fn();
    const outputMock = vi.fn(
        () => new Blob(["%PDF"], { type: "application/pdf" })
    );
    const docInstance = {
        setFontSize: vi.fn(),
        setTextColor: vi.fn(),
        text: textMock,
        output: outputMock,
        lastAutoTable: { finalY: 50 },
    };
    return {
        jsPDFCtor: vi.fn(() => docInstance),
        autoTableMock: vi.fn(),
        textMock,
        outputMock,
    };
});

vi.mock("jspdf", () => ({ default: jsPDFCtor }));
vi.mock("jspdf-autotable", () => ({ default: autoTableMock }));

import { exportPdf } from "./toPdf";

describe("exportPdf", () => {
    it("adds a titled section and an autoTable per dataset", async () => {
        const datasets = [
            {
                key: "glucose" as const,
                rows: [
                    {
                        createdAt: "2026-09-14T00:00:00.000Z",
                        value: 110,
                        tag: "Fasting",
                    },
                ],
            },
            { key: "weight" as const, rows: [] },
        ];

        const blob = await exportPdf(datasets, "Last 30 days");

        expect(jsPDFCtor).toHaveBeenCalledTimes(1);
        expect(autoTableMock).toHaveBeenCalledTimes(2);

        const glucoseTable = autoTableMock.mock.calls[0][1];
        expect(glucoseTable.head).toEqual([["Date", "Glucose (mg/dL)", "Tag"]]);
        expect(glucoseTable.body[0][1]).toBe("110");

        const texts = textMock.mock.calls.map((c) => c[0]);
        expect(texts).toContain("FitDose data export");
        expect(texts.some((t: string) => t.includes("Last 30 days"))).toBe(true);
        expect(texts.some((t: string) => t.startsWith("Glucose (1)"))).toBe(true);

        expect(outputMock).toHaveBeenCalledWith("blob");
        expect(blob).toBeInstanceOf(Blob);
    });
});
