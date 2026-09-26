import React, { useEffect, useState, useCallback } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    LabelList,
} from "recharts";
import axios from "axios";
import dayjs from "dayjs";
import { insulin } from "@/types/models";
import { insulinKind } from "@/helpers/insulinKind";
import { CHART, axisProps, gridProps, tooltipBoxStyle } from "./chartTheme";

type DayTotal = {
    day: string;
    timestamp: number;
    basal: number;
    bolus: number;
    total: number;
};

/** Sum each day's doses into basal and bolus, oldest day first. */
export function dailyInsulinTotals(
    doses: { name?: string | null; units: number; createdAt?: string | Date }[]
): DayTotal[] {
    const byDay = new Map<string, DayTotal>();
    for (const d of doses) {
        const day = dayjs(d.createdAt).format("YYYY-MM-DD");
        const row =
            byDay.get(day) ??
            { day, timestamp: dayjs(day).valueOf(), basal: 0, bolus: 0, total: 0 };
        const units = Number(d.units) || 0;
        row[insulinKind(d.name)] += units;
        row.total += units;
        byDay.set(day, row);
    }
    return [...byDay.values()].sort((a, b) => a.timestamp - b.timestamp);
}

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const row: DayTotal = payload[0].payload;
    return (
        <div style={tooltipBoxStyle}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
                {dayjs(row.timestamp).format("ddd, D MMM")}
            </div>
            <div style={{ color: CHART.bolus }}>Bolus {row.bolus} IU</div>
            <div style={{ color: CHART.basal }}>Basal {row.basal} IU</div>
            <div style={{ fontWeight: 600, marginTop: 2 }}>Total {row.total} IU</div>
        </div>
    );
};

/**
 * Daily insulin totals: basal (Lavender) stacked under bolus (Aubergine),
 * with a dashed line for the average day.
 */
export default function InsulinChartRecharts(props: {
    days?: number;
    fetch?: boolean;
    data?: insulin[];
}) {
    const [fetched, setFetched] = useState<insulin[]>([]);
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

    // Supplied rows win; otherwise show what was fetched (nothing when fetch={false}).
    const insulin = hasData ? props.data : props.fetch === false ? [] : fetched;

    const chartData = dailyInsulinTotals(insulin);
    const average = chartData.length
        ? chartData.reduce((sum, d) => sum + d.total, 0) / chartData.length
        : 0;
    const shortTicks = chartData.length <= 7;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                barCategoryGap="35%"
            >
                <CartesianGrid {...gridProps} />
                <XAxis
                    dataKey="timestamp"
                    {...axisProps}
                    tickFormatter={(value) =>
                        dayjs(value).format(shortTicks ? "ddd" : "D MMM")
                    }
                />
                <YAxis {...axisProps} width={32} allowDecimals={false} />
                <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: CHART.cream }}
                />
                <Bar
                    dataKey="basal"
                    stackId="dose"
                    fill={CHART.basal}
                    radius={[0, 0, 4, 4]}
                    isAnimationActive={false}
                />
                <Bar
                    dataKey="bolus"
                    stackId="dose"
                    fill={CHART.bolus}
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                >
                    <LabelList
                        dataKey="total"
                        position="top"
                        fill={CHART.ink}
                        fontSize={12}
                        fontWeight={600}
                    />
                </Bar>
                {average > 0 && (
                    <ReferenceLine
                        y={average}
                        stroke={CHART.lavender}
                        strokeWidth={1.5}
                        strokeDasharray="6 4"
                    />
                )}
            </BarChart>
        </ResponsiveContainer>
    );
}
