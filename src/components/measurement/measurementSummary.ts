/**
 * Pure helpers behind the Measurements page: the latest value and change for
 * each circumference, and how complete each measuring session was.
 */
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { localZone } from "@/helpers/formatDate";
import {
    MEASUREMENT_FIELDS,
    type MeasurementField,
} from "@/components/Charts/RechartComponents/MeasurementChartRecharts";

dayjs.extend(utc);
dayjs.extend(timezone);

type Row = Partial<Record<MeasurementField, unknown>> & {
    createdAt?: string | Date;
};

export const fieldLabel = (key: string) =>
    key.charAt(0).toUpperCase() + key.slice(1);

/** A usable number, or null for missing / blank / NaN fields. */
export function cm(value: unknown): number | null {
    if (value === null || value === undefined || value === "") return null;
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) ? n : null;
}

/** Rounds away float noise from subtraction (84.0 - 85.1 → -1.1). */
const round1 = (n: number) => Math.round(n * 10) / 10;

export type FieldSummary = {
    field: MeasurementField;
    latest: number | null;
    /** Change from the previous session that recorded this field. */
    change: number | null;
};

/** Rows must be newest first, as the API returns them. */
export function summariseFields(rows: Row[]): FieldSummary[] {
    return MEASUREMENT_FIELDS.map((field) => {
        const values = rows.map((r) => cm(r[field])).filter((v) => v !== null);
        const [latest = null, previous = null] = values;
        return {
            field,
            latest,
            change:
                latest !== null && previous !== null
                    ? round1(latest - previous)
                    : null,
        };
    });
}

/** How many of the seven circumferences a session recorded. */
export function filledCount(row: Row): number {
    return MEASUREMENT_FIELDS.filter((f) => cm(row[f]) !== null).length;
}

/** "23 Sep", converted from UTC to the user's zone like formatDate(). */
export function dayLabel(rawDate: string | Date): string {
    return dayjs.utc(rawDate).tz(localZone()).format("D MMM");
}

/** "+0.3 cm", "−1.2 cm", "0 cm" (with a true minus sign). */
export function formatChange(change: number): string {
    if (change === 0) return "0 cm";
    return `${change > 0 ? "+" : "−"}${Math.abs(change).toFixed(1)} cm`;
}

/** Three fields to preview per session: the charted one first. */
export function previewFields(selected: MeasurementField): MeasurementField[] {
    const base: MeasurementField[] = ["waist", "hip", "chest"];
    return base.includes(selected)
        ? [selected, ...base.filter((f) => f !== selected)]
        : [selected, "waist", "hip"];
}
