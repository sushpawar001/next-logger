/**
 * Build a single PDF document with one table section per selected metric.
 *
 * jspdf and jspdf-autotable are imported dynamically so they stay out of the
 * main bundle and off the SSR path -- this only runs client-side when the user
 * actually picks the PDF format.
 */
import formatDate from "@/helpers/formatDate";
import { columnHeader, metricMeta, type MetricKey } from "./metricMeta";
import { formatCell } from "./toCsv";

export interface Dataset {
    key: MetricKey;
    rows: any[];
}

/** Brand purple (#5E4AE3) for table headers. */
const BRAND: [number, number, number] = [94, 74, 227];

export async function exportPdf(
    datasets: Dataset[],
    periodLabel: string
): Promise<Blob> {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("FitDose data export", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Exported: ${formatDate(new Date())}`, 14, 28);
    doc.text(`Period: ${periodLabel}`, 14, 34);

    let startY = 44;

    datasets.forEach((ds) => {
        const meta = metricMeta[ds.key];
        doc.setFontSize(13);
        doc.setTextColor(30);
        doc.text(`${meta.label} (${ds.rows.length})`, 14, startY);

        autoTable(doc, {
            startY: startY + 3,
            head: [meta.columns.map(columnHeader)],
            body: ds.rows.map((row) =>
                meta.columns.map((col) => formatCell(row, col))
            ),
            styles: { fontSize: 8 },
            headStyles: { fillColor: BRAND },
            margin: { left: 14, right: 14 },
        });

        const lastY = (doc as any).lastAutoTable?.finalY ?? startY + 10;
        startY = lastY + 14;
    });

    return doc.output("blob");
}
