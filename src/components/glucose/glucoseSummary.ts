import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import { localZone } from "@/helpers/formatDate";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

/** UTC → the viewer's zone, the same conversion as src/helpers/formatDate.ts. */
const local = (raw: string | Date) => dayjs.utc(raw).tz(localZone());

/** "26 Sep" */
export const dayLabel = (raw: string | Date) => local(raw).format("D MMM");
/** "14:40" */
export const timeLabel = (raw: string | Date) => local(raw).format("HH:mm");
/** "26 Sep, 14:40" */
export const dayTimeLabel = (raw: string | Date) =>
    local(raw).format("D MMM, HH:mm");
/** "26 Sep 2026 at 14:40" */
export const longLabel = (raw: string | Date) =>
    local(raw).format("D MMM YYYY [at] HH:mm");
/** "12 minutes ago" */
export const relativeLabel = (raw: string | Date, now: Date = new Date()) =>
    local(raw).from(dayjs(now));

type Reading = { value: number | string; tag?: string | null };

export type GlucoseSummary = {
    count: number;
    average: number | null;
    highest: number | null;
    lowest: number | null;
};

export function summarise(rows: readonly Reading[]): GlucoseSummary {
    const values = rows.map((r) => Number(r.value)).filter(Number.isFinite);
    if (values.length === 0) {
        return { count: 0, average: null, highest: null, lowest: null };
    }
    return {
        count: values.length,
        average: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
        highest: Math.max(...values),
        lowest: Math.min(...values),
    };
}

/** Average reading per tag, in `order` (untagged readings are left out). */
export function averageByTag(
    rows: readonly Reading[],
    order: readonly string[]
): { tag: string; average: number; count: number }[] {
    const sums = new Map<string, { total: number; count: number }>();
    for (const r of rows) {
        const v = Number(r.value);
        if (!r.tag || !Number.isFinite(v)) continue;
        const s = sums.get(r.tag) ?? { total: 0, count: 0 };
        s.total += v;
        s.count += 1;
        sums.set(r.tag, s);
    }
    const known = order.filter((t) => sums.has(t));
    const other = [...sums.keys()].filter((t) => !order.includes(t));
    return [...known, ...other].map((tag) => {
        const { total, count } = sums.get(tag)!;
        return { tag, average: Math.round(total / count), count };
    });
}
