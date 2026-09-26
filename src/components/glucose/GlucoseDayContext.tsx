"use client";
import dayjs from "dayjs";
import GlucoseChartRecharts from "@/components/Charts/RechartComponents/GlucoseChartRecharts";
import { Panel, PanelHead, PanelSub, PanelTitle } from "@/components/app-ui/layout";
import { useEntries } from "@/hooks/queries/useEntries";
import { EMPTY_ROWS } from "@/lib/query/keys";
import type { glucose } from "@/types/models";
import { dayLabel } from "./glucoseSummary";

/** The list page's own windows, so an edit opened from /glucose costs no request. */
const WINDOWS = [7, 14, 30] as const;

/**
 * The window that covers `createdAt`, or null when the entry is older than
 * the largest one — fetching months of readings just for context isn't worth it.
 */
export function contextWindow(createdAt: string | Date, now: Date = new Date()) {
    const age = dayjs(now).diff(dayjs(createdAt), "day", true);
    if (age < 0) return null;
    return WINDOWS.find((w) => age < w) ?? null;
}

/** "That day": the entry, circled, on its day's glucose curve. */
export default function GlucoseDayContext({
    createdAt,
    days,
}: {
    createdAt: string;
    days: number;
}) {
    const { data = EMPTY_ROWS as glucose[] } = useEntries<glucose>("glucose", days);
    const rows = Array.isArray(data) ? data : (EMPTY_ROWS as glucose[]);

    const start = dayjs(createdAt).startOf("day");
    const end = start.endOf("day");
    const sameDay = rows.filter((r) => {
        const t = dayjs(r.createdAt);
        return !t.isBefore(start) && !t.isAfter(end);
    });

    if (sameDay.length === 0) return null;

    return (
        <Panel aria-labelledby="day-title">
            <PanelHead>
                <div>
                    <PanelTitle id="day-title">That day</PanelTitle>
                    <PanelSub>
                        {dayLabel(createdAt)} · {sameDay.length}{" "}
                        {sameDay.length === 1 ? "reading" : "readings"}
                    </PanelSub>
                </div>
            </PanelHead>
            <div className="h-52">
                <GlucoseChartRecharts
                    data={sameDay}
                    fetch={false}
                    xTicks="hour"
                    xDomain={[start.valueOf(), end.valueOf()]}
                    highlight={createdAt}
                />
            </div>
        </Panel>
    );
}
