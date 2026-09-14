/**
 * Export orchestrator: fetch each selected metric's full history, narrow it to
 * the chosen period, then serialise and download.
 *
 *  - csv  -> one file per metric (distinct columns per metric)
 *  - json -> one combined file
 *  - pdf  -> one combined document (jspdf loaded lazily)
 *
 * Reuses the existing `getList` fetcher (which unwraps `{ data }` and decrypts
 * server-side) rather than adding any new endpoint.
 */
import dayjs from "dayjs";
import { getList } from "@/lib/query/fetchers";
import { metricMeta, type MetricKey } from "./metricMeta";
import { ALL_DAYS, filterByPeriod } from "./filterByPeriod";
import { rowsToCsv } from "./toCsv";
import { downloadBlob } from "./download";

export type ExportFormat = "csv" | "json" | "pdf";

/** For PDF: one document for everything, or one document per metric. */
export type PdfMode = "combined" | "separate";

export interface ExportOptions {
    metrics: MetricKey[];
    days: number;
    format: ExportFormat;
    /** Only consulted when `format === "pdf"`; defaults to "combined". */
    pdfMode?: PdfMode;
}

interface Dataset {
    key: MetricKey;
    rows: any[];
}

function periodLabel(days: number): string {
    return !days || days >= ALL_DAYS ? "All time" : `Last ${days} days`;
}

/** Pull and period-filter each selected metric (at most four parallel reads). */
export async function fetchDatasets(
    metrics: MetricKey[],
    days: number
): Promise<Dataset[]> {
    return Promise.all(
        metrics.map(async (key) => {
            const rows = await getList(metricMeta[key].endpoint);
            return { key, rows: filterByPeriod(rows, days) };
        })
    );
}

/** Runs the export end to end. Returns the total number of records exported. */
export async function runExport({
    metrics,
    days,
    format,
    pdfMode = "combined",
}: ExportOptions): Promise<number> {
    if (metrics.length === 0) throw new Error("No datasets selected");

    const datasets = await fetchDatasets(metrics, days);
    const total = datasets.reduce((sum, ds) => sum + ds.rows.length, 0);
    const stamp = dayjs().format("YYYY-MM-DD");

    if (format === "csv") {
        datasets.forEach((ds) => {
            const meta = metricMeta[ds.key];
            const csv = rowsToCsv(ds.rows, meta.columns);
            downloadBlob(
                `${meta.fileBase}_${stamp}.csv`,
                csv,
                "text/csv;charset=utf-8"
            );
        });
    } else if (format === "json") {
        const payload: Record<string, unknown> = {
            exportedAt: new Date().toISOString(),
            periodDays: days,
        };
        datasets.forEach((ds) => {
            payload[ds.key] = ds.rows;
        });
        downloadBlob(
            `fitdose_export_${stamp}.json`,
            JSON.stringify(payload, null, 2),
            "application/json"
        );
    } else {
        const { exportPdf } = await import("./toPdf");
        const label = periodLabel(days);
        if (pdfMode === "separate") {
            for (const ds of datasets) {
                const blob = await exportPdf([ds], label);
                downloadBlob(
                    `${metricMeta[ds.key].fileBase}_${stamp}.pdf`,
                    blob,
                    "application/pdf"
                );
            }
        } else {
            const blob = await exportPdf(datasets, label);
            downloadBlob(`fitdose_export_${stamp}.pdf`, blob, "application/pdf");
        }
    }

    return total;
}
