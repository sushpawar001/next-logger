import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import axios from "axios";
import dayjs from "dayjs";
import { insulin } from "@/types/models";
import { CHART, SERIES, axisProps, gridProps } from "./chartTheme";
import { EMPTY_ROWS } from "@/lib/query/keys";
import { ChartTooltip } from "./chartParts";

/** Daily units per insulin type, keyed by local day. */
function dailyUnitsByType(rows: insulin[]) {
    const names: string[] = [];
    const byDay = new Map<number, Record<string, number>>();
    for (const row of rows) {
        if (!names.includes(row.name)) names.push(row.name);
        const day = dayjs(row.createdAt).startOf("day").valueOf();
        const totals = byDay.get(day) ?? {};
        totals[row.name] = (totals[row.name] ?? 0) + Number(row.units);
        byDay.set(day, totals);
    }
    const days = [...byDay.keys()].sort((a, b) => a - b);
    return { names, days, byDay };
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Insulin split into one small bar chart per type, so doses of different
 * sizes (a 10 IU basal, a 4 IU correction) never share a scale. The first
 * type is Aubergine and the second Lavender, matching bolus and basal on the
 * Insulin page when a user has one of each.
 */
export default function AdvInsulinChartSeparateRecharts(props: {
    days?: number;
    fetch?: boolean;
    data?: insulin[];
}) {
    const [fetched, setFetched] = useState<insulin[]>(EMPTY_ROWS);
    const daysOfData = props.days || 7;
    const hasData = !!props.data && props.data.length > 0;

    const getInsulin = useCallback(async () => {
        try {
            const response = await axios.get(`/api/insulin/get/${daysOfData}`);
            if (response.status === 200) {
                setFetched(response.data.data);
            } else {
                console.error(
                    "API request failed with status:",
                    response.status
                );
            }
        } catch (error) {
            console.log(error);
        }
    }, [daysOfData]);

    useEffect(() => {
        if (!hasData && props.fetch !== false) getInsulin();
    }, [getInsulin, hasData, props.fetch]);

    // Supplied rows win; otherwise show what was fetched. With fetch={false}
    // an empty list (e.g. a tag filter matching no insulin) renders the empty
    // state instead of refetching the unfiltered period.
    const source = hasData ? props.data : props.fetch === false ? EMPTY_ROWS : fetched;

    // Oldest first, so the first type logged takes the first series colour.
    const { names, days, byDay } = useMemo(
        () => dailyUnitsByType(source.slice().reverse()),
        [source]
    );

    if (names.length === 0) {
        return (
            <div className="relative h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]}>
                        <CartesianGrid {...gridProps} />
                    </BarChart>
                </ResponsiveContainer>
                <p className="absolute inset-0 grid place-items-center text-sm text-brand-muted">
                    No doses in this period.
                </p>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-5">
            {names.map((name, idx) => {
                const color = SERIES[idx % SERIES.length];
                const data = days
                    .filter((day) => byDay.get(day)[name] !== undefined)
                    .map((day) => ({ day, units: round1(byDay.get(day)[name]) }));
                const avg = data.length
                    ? round1(data.reduce((a, d) => a + d.units, 0) / data.length)
                    : 0;
                return (
                    <div key={name}>
                        <div className="mb-1 flex justify-between text-[13px]">
                            <strong className="inline-flex items-center gap-2">
                                <span
                                    aria-hidden="true"
                                    className="inline-block h-[18px] w-1.5 rounded-[3px]"
                                    style={{ background: color }}
                                />
                                {name}
                            </strong>
                            <span className="text-brand-muted tabular-nums">
                                avg {avg} IU/day
                            </span>
                        </div>
                        <div className="h-[120px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data}
                                    margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid {...gridProps} />
                                    <XAxis
                                        {...axisProps}
                                        dataKey="day"
                                        tickFormatter={(value) =>
                                            dayjs(value).format("D MMM")
                                        }
                                        minTickGap={16}
                                    />
                                    <YAxis
                                        {...axisProps}
                                        width={36}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: CHART.cream }}
                                        content={
                                            <ChartTooltip
                                                unit="IU"
                                                dateFormat="D MMM YYYY"
                                            />
                                        }
                                    />
                                    <ReferenceLine
                                        y={avg}
                                        stroke={CHART.muted}
                                        strokeDasharray="6 4"
                                        strokeWidth={1}
                                    />
                                    <Bar
                                        dataKey="units"
                                        name={name}
                                        fill={color}
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={18}
                                        isAnimationActive={false}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
