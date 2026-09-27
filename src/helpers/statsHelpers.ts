import { insulin } from "@/types/models";
import { a1cFromEag } from "@/lib/calculators/a1c";

export function getDailyInsulinValues(valuesArray: insulin[]): number[] {
    const dates = {};

    for (let index = 0; index < valuesArray.length; index++) {
        const element = valuesArray[index];
        const date = new Date(element.createdAt);
        const dateStr = date.toDateString();
        if (dates[dateStr]) {
            dates[dateStr] = dates[dateStr] + element.units;
        } else {
            dates[dateStr] = element.units;
        }
    }
    return Object.values(dates);
}

export function simpleMovingAverage(arr: number[], period: number): number[] {
    const result = [];
    for (let i = 0; i <= arr.length - period; i++) {
        const window = arr.slice(i, i + period);
        const avg = window.reduce((sum, val) => sum + val, 0) / period;
        result.push(avg);
    }
    if (result.length < arr.length) {
        const myArray = new Array(arr.length - result.length);
        myArray.fill(null);
        return myArray.concat(result);
    }
    return result;
}

export function getHba1cValue(averageGlucose: number): number {
    return Math.round(a1cFromEag(averageGlucose));
}
/**
 * Estimated HbA1c (ADAG formula) to one decimal, the precision it is quoted
 * at clinically. `getHba1cValue` above rounds to a whole number.
 */
export function getHba1cPrecise(averageGlucose: number): number {
    return Math.round(a1cFromEag(averageGlucose) * 10) / 10;
}

export interface Summary {
    count: number;
    avg: number | null;
    min: number | null;
    max: number | null;
}

/** Count, average, lowest and highest of a list; nulls when it is empty. */
export function summarize(values: number[]): Summary {
    const nums = values.filter((v) => Number.isFinite(v));
    if (nums.length === 0) return { count: 0, avg: null, min: null, max: null };
    return {
        count: nums.length,
        avg: nums.reduce((a, b) => a + b, 0) / nums.length,
        min: Math.min(...nums),
        max: Math.max(...nums),
    };
}

/** Local calendar day of a timestamp, as "YYYY-MM-DD". */
function localDayKey(createdAt?: string | number | Date): string {
    const d = new Date(createdAt);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** How many distinct local days have at least one entry. */
export function countDistinctDays(
    rows: { createdAt?: string | number | Date }[]
): number {
    return new Set(rows.map((r) => localDayKey(r.createdAt))).size;
}

export interface DailyRange {
    /** Local midnight of the day, as a timestamp. */
    day: number;
    min: number;
    max: number;
    avg: number;
    count: number;
}

/** One lowest / highest / average per local day, oldest first. */
export function dailyRanges(
    rows: { createdAt?: string | number | Date; value: number }[]
): DailyRange[] {
    const byDay = new Map<string, number[]>();
    for (const r of rows) {
        if (!Number.isFinite(r.value)) continue;
        const key = localDayKey(r.createdAt);
        const list = byDay.get(key);
        if (list) list.push(r.value);
        else byDay.set(key, [r.value]);
    }
    return [...byDay.entries()]
        .map(([key, values]) => {
            const [y, m, d] = key.split("-").map(Number);
            const s = summarize(values);
            return {
                day: new Date(y, m - 1, d).getTime(),
                min: s.min,
                max: s.max,
                avg: s.avg,
                count: s.count,
            };
        })
        .sort((a, b) => a.day - b.day);
}
