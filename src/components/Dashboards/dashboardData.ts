/**
 * Pure helpers behind the diabetes dashboard, kept out of the components so
 * they can be unit-tested without Recharts or a query client.
 */
import dayjs, { type Dayjs } from "dayjs";
import { getHba1cPrecise } from "@/helpers/statsHelpers";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

type Dated = { createdAt?: string | Date | number };

/** Entry dates are stored in UTC; show them in the browser's zone (see formatDate.ts). */
export const toLocal = (d: string | Date | number): Dayjs =>
    dayjs.utc(d).tz(dayjs.tz.guess());

export const timeOf = (d: string | Date | number) => toLocal(d).format("HH:mm");

export function isSameLocalDay(d: string | Date | number, now: Dayjs = dayjs()) {
    return toLocal(d).format("YYYY-MM-DD") === now.tz(dayjs.tz.guess()).format("YYYY-MM-DD");
}

export function greeting(now: Dayjs = dayjs()) {
    const h = now.hour();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
}

/** Rows arrive newest first, but don't rely on it. */
export function latest<T extends Dated>(rows: readonly T[]): T | undefined {
    let best: T | undefined;
    for (const r of rows) {
        if (!r.createdAt) continue;
        if (!best || +new Date(r.createdAt) > +new Date(best.createdAt!)) best = r;
    }
    return best;
}

export function average(values: number[]): number | null {
    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Estimated HbA1c (%) from average glucose in mg/dL, to one decimal: the ADAG
 * formula shared with the public A1c calculator via statsHelpers.
 */
export const estimateHba1c = (avgGlucose: number) =>
    getHba1cPrecise(avgGlucose);

export type TodayItem = {
    kind: "glucose" | "insulin" | "weight";
    id: string;
    at: string | Date | number;
    value: number;
    tag?: string | null;
    name?: string;
};

type Row = Dated & { _id?: string; value?: number; units?: number; tag?: string | null; name?: string };

/** Today's glucose, insulin and weight entries as one list, newest first. */
export function todayEntries(
    { glucose = [], insulin = [], weight = [] }: {
        glucose?: readonly Row[];
        insulin?: readonly Row[];
        weight?: readonly Row[];
    },
    now: Dayjs = dayjs()
): TodayItem[] {
    const pick = (kind: TodayItem["kind"], rows: readonly Row[]) =>
        rows
            .filter((r) => r.createdAt && isSameLocalDay(r.createdAt, now))
            .map((r, i) => ({
                kind,
                id: r._id ?? `${kind}-${i}`,
                at: r.createdAt!,
                value: Number(kind === "insulin" ? r.units : r.value),
                tag: r.tag,
                name: r.name,
            }));
    return [...pick("glucose", glucose), ...pick("insulin", insulin), ...pick("weight", weight)].sort(
        (a, b) => +new Date(b.at) - +new Date(a.at)
    );
}

/** Units per insulin name, largest first. */
export function unitsByName(rows: readonly { units: number; name: string }[]) {
    const totals = new Map<string, number>();
    for (const r of rows) totals.set(r.name, (totals.get(r.name) ?? 0) + Number(r.units));
    return [...totals].sort((a, b) => b[1] - a[1]);
}

/**
 * Weigh-ins oldest first, each with the average of every weigh-in in the
 * seven days up to and including it.
 */
export function weightTrend(rows: readonly { value: number; createdAt?: string | Date | number }[]) {
    const pts = rows
        .filter((r) => r.createdAt)
        .map((r) => ({ t: +new Date(r.createdAt!), value: Number(r.value) }))
        .sort((a, b) => a.t - b.t);
    const WEEK = 7 * 24 * 60 * 60 * 1000;
    return pts.map((p) => {
        const window = pts.filter((q) => q.t <= p.t && q.t > p.t - WEEK);
        const avg = window.reduce((a, b) => a + b.value, 0) / window.length;
        return { ...p, avg: Math.round(avg * 10) / 10 };
    });
}

export function relativeFromNow(d: string | Date | number) {
    return toLocal(d).fromNow();
}
