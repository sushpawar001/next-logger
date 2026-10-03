import React, { memo, useEffect, useState, useCallback, useMemo } from "react";
import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import axios from "axios";
import dayjs from "dayjs";
import {
    CHART,
    axisProps,
    gridProps,
    tooltipBoxStyle,
    formatDay,
    toTimestamp,
} from "./chartTheme";
import { EMPTY_ROWS } from "@/lib/query/keys";

interface WeightData {
    createdAt?: string | number | Date;
    value: number;
}

type WeightPoint = { createdAt: number; value: number; avg: number };

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Trailing 7-day average at each weigh-in: the mean of every weigh-in in the
 * seven days up to and including it. Expects points sorted oldest first.
 */
export function withSevenDayAverage(
    points: { createdAt: number; value: number }[]
): WeightPoint[] {
    return points.map((p, i) => {
        let sum = 0;
        let n = 0;
        for (let j = i; j >= 0; j--) {
            if (p.createdAt - points[j].createdAt >= 7 * DAY_MS) break;
            sum += Number(points[j].value);
            n++;
        }
        return { ...p, avg: +(sum / n).toFixed(2) };
    });
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload as WeightPoint;
    return (
        <div style={tooltipBoxStyle}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>
                {dayjs(label).format("D MMM YYYY, HH:mm")}
            </div>
            <div>Weigh-in: {point.value} kg</div>
            <div style={{ color: CHART.muted }}>7-day average: {point.avg} kg</div>
        </div>
    );
};

/** Hollow Aubergine dots, with the latest weigh-in filled and larger. */
function WeighInDot(props: any) {
    const { cx, cy, index, points } = props;
    if (cx == null || cy == null) return null;
    const last = index === points - 1;
    return (
        <circle
            key={`dot-${index}`}
            cx={cx}
            cy={cy}
            r={last ? 5 : 2.5}
            fill={last ? CHART.aubergine : "#FFFFFF"}
            stroke={CHART.aubergine}
            strokeWidth={1.5}
        />
    );
}

/** About five evenly spaced date ticks, whatever the period. */
function dateTicks(min: number, max: number, count = 5) {
    if (min === max) return [min];
    const step = (max - min) / (count - 1);
    return Array.from({ length: count }, (_, i) => Math.round(min + step * i));
}

/**
 * Weight trend (A1): the Lavender 7-day average is the main line; daily
 * weigh-ins sit behind it as a thin Aubergine line with small dots, so
 * day-to-day noise reads as secondary.
 */
type RawPoint = { createdAt: number; value: number };

// Convert createdAt to a timestamp (ms) so the time-scaled axis can plot it.
const prepareData = (data: WeightData[]): RawPoint[] =>
    data.map((item) => ({
        createdAt: toTimestamp(item.createdAt),
        value: item.value,
    }));

function WeightChartRecharts(props: {
    days?: number;
    fetch: boolean;
    data?: WeightData[];
    /** Draw the 7-day average line. Defaults to true. */
    showAverage?: boolean;
    /** Draw a dot per weigh-in. Defaults to true. */
    showDots?: boolean;
}) {
    const [fetched, setFetched] = useState<RawPoint[]>(EMPTY_ROWS);
    const daysOfData = props.days || 7;
    const showAverage = props.showAverage ?? true;
    const showDots = props.showDots ?? true;

    const getWeight = useCallback(async () => {
        try {
            const response = await axios.get(`/api/weight/get/${daysOfData}`);
            if (response.status === 200) {
                setFetched(prepareData(response.data.data.slice().reverse()));
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
        if (props.fetch) getWeight();
    }, [getWeight, props.fetch]);

    // Derived rather than copied into state, so a new data prop paints once.
    const points = useMemo(
        () =>
            withSevenDayAverage(
                props.fetch === false
                    ? props.data
                        ? prepareData(props.data.slice().reverse())
                        : EMPTY_ROWS
                    : props.fetch
                      ? fetched
                      : EMPTY_ROWS
            ),
        [props.fetch, props.data, fetched]
    );
    const minTime = points.length ? points[0].createdAt : undefined;
    const maxTime = points.length ? points[points.length - 1].createdAt : undefined;

    const yDomain = useMemo((): [number, number] | ["auto", "auto"] => {
        if (!points.length) return ["auto", "auto"];
        let lo = Infinity;
        let hi = -Infinity;
        for (const d of points) {
            const v = Number(d.value);
            if (v < lo) lo = v;
            if (v > hi) hi = v;
        }
        return [Math.floor(lo - 0.5), Math.ceil(hi + 0.5)];
    }, [points]);
    const ticks = useMemo(
        () => (minTime !== undefined ? dateTicks(minTime, maxTime) : []),
        [minTime, maxTime]
    );

    const pointCount = points.length;
    const dot = useMemo(
        () =>
            showDots
                ? (p: any) => <WeighInDot {...p} points={pointCount} />
                : false,
        [showDots, pointCount]
    );

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
                data={points}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
                <CartesianGrid {...gridProps} />
                <XAxis
                    dataKey="createdAt"
                    type="number"
                    scale="time"
                    domain={
                        minTime !== undefined && maxTime !== undefined
                            ? [minTime, maxTime]
                            : ["auto", "auto"]
                    }
                    ticks={ticks}
                    tickFormatter={formatDay}
                    {...axisProps}
                />
                <YAxis
                    domain={yDomain}
                    allowDecimals={false}
                    tickCount={5}
                    width={36}
                    {...axisProps}
                />
                <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: CHART.border }}
                />
                <Area
                    type="linear"
                    dataKey="value"
                    stroke="none"
                    fill={CHART.lavender}
                    fillOpacity={0.1}
                    isAnimationActive={false}
                    activeDot={false}
                />
                <Line
                    type="linear"
                    dataKey="value"
                    name="Weigh-in"
                    stroke={CHART.aubergine}
                    strokeOpacity={0.55}
                    strokeWidth={1.5}
                    dot={dot}
                    activeDot={{ r: 4, fill: CHART.aubergine, stroke: "#FFFFFF" }}
                    connectNulls
                />
                {showAverage && (
                    <Line
                        type="monotone"
                        dataKey="avg"
                        name="7-day average"
                        stroke={CHART.lavender}
                        strokeWidth={3}
                        strokeLinecap="round"
                        dot={false}
                        activeDot={false}
                        connectNulls
                    />
                )}
            </ComposedChart>
        </ResponsiveContainer>
    );
}

export default memo(WeightChartRecharts);
