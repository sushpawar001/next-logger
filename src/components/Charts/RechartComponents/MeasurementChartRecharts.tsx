import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import axios from "axios";
import dayjs from "dayjs";
import { measurement } from "@/types/models";
import {
    CHART,
    SERIES,
    axisProps,
    gridProps,
    tooltipBoxStyle,
} from "./chartTheme";

export const MEASUREMENT_FIELDS = [
    "arms",
    "chest",
    "abdomen",
    "waist",
    "hip",
    "thighs",
    "calves",
] as const;
export type MeasurementField = (typeof MEASUREMENT_FIELDS)[number];

const label = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);

// Seven series, so the brand colours repeat after five; the legend toggles
// keep only the ones being compared on screen.
const seriesColor = (key: MeasurementField) =>
    SERIES[MEASUREMENT_FIELDS.indexOf(key) % SERIES.length];

const CustomTooltip = ({ active, payload, label: time }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={tooltipBoxStyle}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>
                    {dayjs(time).format("D MMM YYYY")}
                </div>
                {payload.map((item: any) => (
                    <div key={item.dataKey} style={{ color: CHART.muted }}>
                        {label(item.dataKey)}:{" "}
                        <strong style={{ color: CHART.ink }}>
                            {item.value} cm
                        </strong>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

/**
 * Circumferences over time. Pass `field` to plot one measurement (the
 * Measurements page picks it from its strip); without it every series can be
 * toggled from the legend.
 */
export default function MeasurementChartRecharts(props: {
    days?: number;
    fetch?: boolean;
    data?: measurement[];
    field?: MeasurementField;
}) {
    const [fetched, setFetched] = useState<measurement[]>([]);
    const [visibleLines, setVisibleLines] = useState<
        Record<MeasurementField, boolean>
    >(() =>
        Object.fromEntries(
            MEASUREMENT_FIELDS.map((key) => [key, key === "abdomen"])
        ) as Record<MeasurementField, boolean>
    );
    const daysOfData = props.days || 14;

    const getMeasurementData = useCallback(async () => {
        try {
            const response = await axios.get(
                `/api/measurements/get/${daysOfData}`
            );
            if (response.status === 200) {
                setFetched(response.data.data.reverse());
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

    // Rows handed down by the page are used as-is (oldest first for the X
    // axis); only a self-fetching chart keeps its own copy.
    const usesProps =
        (props.data && props.data.length > 0) || props.fetch === false;
    useEffect(() => {
        if (!usesProps) getMeasurementData();
    }, [getMeasurementData, usesProps]);
    const measurementData = useMemo(
        () => (usesProps ? (props.data ?? []).slice().reverse() : fetched),
        [usesProps, props.data, fetched]
    );

    const chartData = measurementData.map((entry) => ({
        ...entry,
        timestamp: entry.createdAt
            ? new Date(entry.createdAt).getTime()
            : undefined,
    }));

    const shown = props.field
        ? [props.field]
        : MEASUREMENT_FIELDS.filter((key) => visibleLines[key]);

    // Fit the Y axis to the visible series, with a little headroom.
    const getYDomain = (): [number, number] => {
        const values = chartData.flatMap((entry) =>
            shown
                .map((key) => entry[key])
                .filter((v): v is number => typeof v === "number" && !isNaN(v))
        );
        if (values.length === 0) return [0, 1];
        const min = Math.min(...values);
        const max = Math.max(...values);
        if (min === max) return [min - 1, max + 1];
        const padding = (max - min) * 0.15;
        return [
            Math.floor((min - padding) * 10) / 10,
            Math.ceil((max + padding) * 10) / 10,
        ];
    };

    return (
        <div className="flex h-full w-full flex-col">
            <div className="min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid {...gridProps} />
                        <XAxis
                            {...axisProps}
                            dataKey="timestamp"
                            type="number"
                            scale="time"
                            domain={["dataMin", "dataMax"]}
                            tickFormatter={(value) =>
                                dayjs(value).format("D MMM")
                            }
                            minTickGap={24}
                        />
                        <YAxis
                            {...axisProps}
                            width={40}
                            domain={getYDomain()}
                            tickCount={5}
                            allowDecimals={false}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: CHART.border }}
                        />
                        {MEASUREMENT_FIELDS.map((key) => {
                            const single = props.field === key;
                            const color = props.field
                                ? CHART.aubergine
                                : seriesColor(key);
                            return (
                                <Line
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={color}
                                    strokeWidth={2.5}
                                    strokeLinecap="round"
                                    dot={
                                        single
                                            ? {
                                                  r: 3.5,
                                                  fill: "#FFFFFF",
                                                  stroke: color,
                                                  strokeWidth: 2,
                                              }
                                            : false
                                    }
                                    activeDot={{ r: 5, fill: color }}
                                    connectNulls
                                    hide={!shown.includes(key)}
                                    isAnimationActive={false}
                                />
                            );
                        })}
                    </LineChart>
                </ResponsiveContainer>
            </div>
            {!props.field && (
                <div
                    role="group"
                    aria-label="Series"
                    className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2"
                >
                    {MEASUREMENT_FIELDS.map((key) => (
                        <button
                            key={key}
                            type="button"
                            aria-pressed={visibleLines[key]}
                            onClick={() =>
                                setVisibleLines((prev) => ({
                                    ...prev,
                                    [key]: !prev[key],
                                }))
                            }
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                                visibleLines[key]
                                    ? "text-brand-ink"
                                    : "text-brand-muted/60 line-through"
                            }`}
                        >
                            <span
                                className="h-[3px] w-[18px] rounded-sm"
                                style={{
                                    background: seriesColor(key),
                                    opacity: visibleLines[key] ? 1 : 0.3,
                                }}
                                aria-hidden="true"
                            />
                            {label(key)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
