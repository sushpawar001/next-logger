import React, { memo, useEffect, useState, useCallback, useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea,
    ReferenceLine,
} from "recharts";
import axios from "axios";
import dayjs from "dayjs";
import { GLUCOSE_TARGET } from "@/constants/constants";
import { glucoseStatus } from "@/helpers/glucoseStatus";
import {
    CHART,
    axisProps,
    gridProps,
    statusColor,
    tooltipBoxStyle,
    formatDay,
    withTimestamps,
} from "./chartTheme";
import { EMPTY_ROWS } from "@/lib/query/keys";

interface GlucoseData {
    createdAt?: string | number | Date; // Normalised to a timestamp (ms) by withTimestamps
    value: number;
}

const STATUS_LABEL = { in: "In range", high: "High", low: "Low" } as const;

// Custom tooltip for human-readable date
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && payload[0].value != null) {
        const value = Number(payload[0].value);
        const status = glucoseStatus(value);
        return (
            <div style={tooltipBoxStyle}>
                <div style={{ color: CHART.muted, marginBottom: 2 }}>
                    {dayjs(label).format("D MMM, HH:mm")}
                </div>
                <div style={{ fontWeight: 600 }}>
                    {value} mg/dL{" "}
                    <span
                        style={{
                            color:
                                status === "in"
                                    ? CHART.in
                                    : statusColor(value),
                            fontWeight: 600,
                        }}
                    >
                        · {STATUS_LABEL[status]}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

/**
 * In-range readings are hollow Aubergine dots; only readings outside the
 * target band take a (filled, larger) status colour.
 */
const makeDot =
    (radius: number, highlight?: number) =>
    // eslint-disable-next-line react/display-name
    (props: any) => {
        const { cx, cy, payload, index } = props;
        if (cx == null || cy == null || payload?.value == null) {
            return <g key={`dot-${index}`} />;
        }
        const value = Number(payload.value);
        const inRange = glucoseStatus(value) === "in";
        const isHighlight =
            highlight != null && payload.createdAt === highlight;
        return (
            <g key={`dot-${index}`}>
                {isHighlight && (
                    <circle
                        cx={cx}
                        cy={cy}
                        r={12}
                        fill="none"
                        stroke={CHART.lavender}
                        strokeWidth={3}
                    />
                )}
                {inRange ? (
                    <circle
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill="#FFFFFF"
                        stroke={CHART.aubergine}
                        strokeWidth={2}
                    />
                ) : (
                    <circle
                        cx={cx}
                        cy={cy}
                        r={radius + 1.5}
                        fill={statusColor(value)}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                    />
                )}
            </g>
        );
    };

const formatHour = (value: number) => dayjs(value).format("HH:mm");
function GlucoseChartRecharts(props: {
    days?: number;
    fetch: boolean;
    data?: GlucoseData[];
    /** "day" ticks at each midnight (default); "hour" ticks every few hours for a single day. */
    xTicks?: "day" | "hour";
    /** Draw a dashed "now" marker at this timestamp (ms). */
    now?: number;
    /** Circle the reading logged at this time (ms or ISO string). */
    highlight?: number | string;
    /** Fix the x-axis span, e.g. a whole day. Defaults to the data's range. */
    xDomain?: [number, number];
    dotRadius?: number;
}) {
    const [fetched, setFetched] = useState<GlucoseData[]>(EMPTY_ROWS);
    const daysOfData = props.days || 7;

    const getGlucose = useCallback(async () => {
        try {
            const response = await axios.get(`/api/glucose/get/${daysOfData}`);
            if (response.status === 200) {
                setFetched(withTimestamps(response.data.data.slice().reverse()));
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
        if (props.fetch) getGlucose();
    }, [getGlucose, props.fetch]);

    // Derived rather than copied into state, so a new data prop paints once.
    const glucose = useMemo(
        () =>
            props.fetch === false
                ? props.data
                    ? withTimestamps(props.data.slice().reverse())
                    : EMPTY_ROWS
                : props.fetch
                  ? fetched
                  : EMPTY_ROWS,
        [props.fetch, props.data, fetched]
    );

    const { minTime, maxTime, maxValue } = useMemo(() => {
        let lo = Infinity;
        let hi = -Infinity;
        let top = 0;
        for (const d of glucose) {
            const t = d.createdAt as number;
            if (t < lo) lo = t;
            if (t > hi) hi = t;
            const v = Number(d.value) || 0;
            if (v > top) top = v;
        }
        return {
            minTime: props.xDomain
                ? props.xDomain[0]
                : glucose.length
                  ? lo
                  : undefined,
            maxTime: props.xDomain
                ? props.xDomain[1]
                : glucose.length
                  ? hi
                  : undefined,
            maxValue: top,
        };
    }, [glucose, props.xDomain]);

    const ticks = useMemo(() => {
        if (minTime === undefined || maxTime === undefined) return [];
        const ticks = [];
        if (props.xTicks === "hour") {
            let current = dayjs(minTime).startOf("hour");
            const step = 6;
            while (current.valueOf() <= maxTime) {
                if (current.valueOf() >= minTime && current.hour() % step === 0)
                    ticks.push(current.valueOf());
                current = current.add(1, "hour");
            }
            return ticks;
        }
        let current = dayjs(minTime).startOf("day").add(1, "day");
        while (current.valueOf() <= maxTime) {
            ticks.push(current.valueOf());
            current = current.add(1, "day");
        }
        // Too many midnights to label on a long window: thin them out.
        const every = Math.ceil(ticks.length / 8);
        return ticks.filter((_, i) => i % every === 0);
    }, [minTime, maxTime, props.xTicks]);

    const highlight =
        props.highlight == null
            ? undefined
            : typeof props.highlight === "number"
              ? props.highlight
              : new Date(props.highlight).getTime();

    const yMax = Math.max(260, Math.ceil((maxValue + 20) / 20) * 20);

    const dot = useMemo(
        () => makeDot(props.dotRadius ?? 3.5, highlight),
        [props.dotRadius, highlight]
    );
    const tickFormatter = props.xTicks === "hour" ? formatHour : formatDay;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={glucose}
                margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
            >
                <CartesianGrid {...gridProps} />
                <ReferenceArea
                    y1={GLUCOSE_TARGET.low}
                    y2={GLUCOSE_TARGET.high}
                    fill={CHART.oat}
                    fillOpacity={0.6}
                    stroke="none"
                    ifOverflow="extendDomain"
                />
                {[GLUCOSE_TARGET.low, GLUCOSE_TARGET.high].map((y) => (
                    <ReferenceLine
                        key={y}
                        y={y}
                        stroke={CHART.border}
                        strokeDasharray="4 4"
                    />
                ))}
                <XAxis
                    {...axisProps}
                    dataKey="createdAt"
                    type="number"
                    scale="time"
                    domain={
                        minTime !== undefined && maxTime !== undefined
                            ? [minTime, maxTime]
                            : ["auto", "auto"]
                    }
                    ticks={ticks}
                    tickFormatter={tickFormatter}
                />
                <YAxis
                    {...axisProps}
                    width={36}
                    domain={[30, yMax]}
                    ticks={[GLUCOSE_TARGET.low, GLUCOSE_TARGET.high]}
                />
                {props.now != null && (
                    <ReferenceLine
                        x={props.now}
                        stroke={CHART.muted}
                        strokeDasharray="3 4"
                        label={{
                            value: "now",
                            position: "top",
                            fill: CHART.muted,
                            fontSize: 11,
                        }}
                    />
                )}
                <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: CHART.border }}
                />
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={CHART.aubergine}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    dot={dot}
                    activeDot={{
                        r: 6,
                        fill: CHART.aubergine,
                        stroke: "#FFFFFF",
                        strokeWidth: 2,
                    }}
                    connectNulls={true}
                    isAnimationActive={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

export default memo(GlucoseChartRecharts);
