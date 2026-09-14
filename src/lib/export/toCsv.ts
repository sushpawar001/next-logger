/**
 * CSV serialisation for a single metric's rows, driven by its column defs.
 * Fields are escaped per RFC 4180 and `createdAt` is rendered through the app's
 * shared `formatDate` (UTC -> local) so the CSV matches what the dashboard shows.
 */
import formatDate from "@/helpers/formatDate";
import { columnHeader, type ColumnDef } from "./metricMeta";

/** Wrap in quotes and double any inner quotes when the field needs it. */
function escapeCsv(field: string): string {
    if (/[",\n\r]/.test(field)) {
        return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
}

/** One cell's display string: dates formatted, null/undefined blank. */
export function formatCell(row: any, col: ColumnDef): string {
    const value = row?.[col.key];
    if (col.key === "createdAt") return value ? formatDate(value) : "";
    if (value === null || value === undefined) return "";
    return String(value);
}

export function rowsToCsv(rows: any[], columns: ColumnDef[]): string {
    const header = columns.map((c) => escapeCsv(columnHeader(c))).join(",");
    const body = rows.map((row) =>
        columns.map((c) => escapeCsv(formatCell(row, c))).join(",")
    );
    return [header, ...body].join("\r\n");
}
