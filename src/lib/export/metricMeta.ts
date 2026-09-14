/**
 * Metadata describing each exportable metric: its human label, the file basename
 * used for CSV downloads, the all-history API endpoint to pull from, and the
 * ordered columns (with units) that CSV and PDF share as their single source of
 * truth. The app has no other metric label/unit map, so this file is it.
 *
 * `createdAt` is a column like any other; the cell formatter in `toCsv.ts`
 * special-cases it so the raw Date is rendered through `formatDate`.
 */

export type MetricKey = "glucose" | "insulin" | "weight" | "measurements";

export interface ColumnDef {
    /** Property key on the (decrypted, number-converted) row. */
    key: string;
    /** Human-readable header, without the unit. */
    header: string;
    /** Optional unit, appended to the header as "Header (unit)". */
    unit?: string;
}

export interface MetricMeta {
    key: MetricKey;
    label: string;
    fileBase: string;
    /** All-history GET endpoint (returns decrypted `{ data: [...] }`). */
    endpoint: string;
    columns: ColumnDef[];
}

/** Export order. */
export const METRICS: MetricKey[] = [
    "glucose",
    "insulin",
    "weight",
    "measurements",
];

const DATE_COL: ColumnDef = { key: "createdAt", header: "Date" };
const TAG_COL: ColumnDef = { key: "tag", header: "Tag" };

export const metricMeta: Record<MetricKey, MetricMeta> = {
    glucose: {
        key: "glucose",
        label: "Glucose",
        fileBase: "glucose",
        endpoint: "/api/glucose/get",
        columns: [
            DATE_COL,
            { key: "value", header: "Glucose", unit: "mg/dL" },
            TAG_COL,
        ],
    },
    insulin: {
        key: "insulin",
        label: "Insulin",
        fileBase: "insulin",
        endpoint: "/api/insulin/get",
        columns: [
            DATE_COL,
            { key: "name", header: "Insulin" },
            { key: "units", header: "Dose", unit: "units" },
            TAG_COL,
        ],
    },
    weight: {
        key: "weight",
        label: "Weight",
        fileBase: "weight",
        endpoint: "/api/weight/get",
        columns: [
            DATE_COL,
            { key: "value", header: "Weight", unit: "kg" },
            TAG_COL,
        ],
    },
    measurements: {
        key: "measurements",
        label: "Body measurements",
        fileBase: "measurements",
        endpoint: "/api/measurements/get",
        columns: [
            DATE_COL,
            { key: "arms", header: "Arms", unit: "cm" },
            { key: "chest", header: "Chest", unit: "cm" },
            { key: "abdomen", header: "Abdomen", unit: "cm" },
            { key: "waist", header: "Waist", unit: "cm" },
            { key: "hip", header: "Hip", unit: "cm" },
            { key: "thighs", header: "Thighs", unit: "cm" },
            { key: "calves", header: "Calves", unit: "cm" },
            TAG_COL,
        ],
    },
};

/** "Glucose (mg/dL)" for a column with a unit, "Date" otherwise. */
export function columnHeader(col: ColumnDef): string {
    return col.unit ? `${col.header} (${col.unit})` : col.header;
}
