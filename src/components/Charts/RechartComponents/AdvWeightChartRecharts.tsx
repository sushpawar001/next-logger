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
import { simpleMovingAverage } from "@/helpers/statsHelpers";
import getMovingAvgInterval from "@/helpers/getMovingAvgInterval";
import { CHART, axisProps, gridProps, formatDay, withTimestamps } from "./chartTheme";
import { EMPTY_ROWS } from "@/lib/query/keys";
import { ChartTooltip, SeriesToggle, dailyTicks } from "./chartParts";

interface WeightData {
    createdAt: string | number;
    value: number;
}

/**
 * Weight is a trend, not a verdict: the Lavender moving average is the main
 * line, and single weigh-ins sit behind it as a thin line with small dots.
 */
function AdvWeightChartRecharts(props: {
    days?: number;
    fetch: boolean;
    data?: WeightData[];
}) {
    const [fetched, setFetched] = useState<WeightData[] | null>(null);
    const [visibleLines, setVisibleLines] = useState<{
        value: boolean;
        ma: boolean;
    }>({ value: true, ma: true });
    const daysOfData = props.days || 7;

    const getWeight = useCallback(async () => {
        try {
            const response = await axios.get(`/api/weight/get/${daysOfData}`);
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
        if (props.fetch) getWeight();
    }, [getWeight, props.fetch]);

    // Supplied rows (fetch={false}) or a completed fetch; until either
    // arrives the window stays at 1, as before.
    const supplied = props.fetch === false && !!props.data;
    const weight = supplied
        ? props.data
        : props.fetch && fetched
          ? fetched
          : EMPTY_ROWS;
    const maInterval =
        supplied || (props.fetch && fetched)
            ? getMovingAvgInterval(daysOfData)
            : 1;

    // Derived rather than copied into state, so a new data prop paints once.
    const { chartData, minTime, maxTime, yDomain } = useMemo(() => {
        const rows = supplied ? withTimestamps(weight.slice().reverse()) : weight;
        const weightValues = rows.map((d) => d.value);
        const maValues = simpleMovingAverage(weightValues, maInterval);
        const chartData = rows.map((d, i) => ({
            ...d,
            ma: maValues[i],
        }));

        let lo = Infinity;
        let hi = -Infinity;
        for (const d of rows) {
            const t = d.createdAt as number;
            if (t < lo) lo = t;
            if (t > hi) hi = t;
        }

        // Tight, padded domain: a kilo matters, so don't start the axis at zero.
        const weightOnly = weightValues.filter((v) => v !== null);
        const minWeight = weightOnly.length ? Math.min(...weightOnly) : 0;
        const maxWeight = weightOnly.length ? Math.max(...weightOnly) : 100;
        const pad = Math.max(0.5, (maxWeight - minWeight) * 0.15);
        return {
            chartData,
            minTime: rows.length ? lo : undefined,
            maxTime: rows.length ? hi : undefined,
            yDomain: [
                Math.floor(Math.max(0, minWeight - pad)),
                Math.ceil(maxWeight + pad),
            ],
        };
    }, [weight, supplied, maInterval]);
    const ticks = useMemo(() => dailyTicks(minTime, maxTime, 6), [minTime, maxTime]);

    const maLabel = `Moving avg (${maInterval})`;

    return (
        <div className="flex h-full w-full flex-col">
            <div className="min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={chartData}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid {...gridProps} />
                        <XAxis
                            {...axisProps}
                            dataKey="createdAt"
                            type="number"
                            domain={
                                minTime !== undefined && maxTime !== undefined
                                    ? [minTime, maxTime]
                                    : ["auto", "auto"]
                            }
                            ticks={ticks}
                            tickFormatter={formatDay}
                        />
                        <YAxis {...axisProps} domain={yDomain} width={36} />
                        <Tooltip content={<ChartTooltip unit="kg" />} />
                        <Area
                            type="linear"
                            dataKey="value"
                            name="Weigh-in"
                            stroke={CHART.aubergine}
                            strokeOpacity={0.55}
                            strokeWidth={1.5}
                            fill={CHART.lavender}
                            fillOpacity={0.1}
                            dot={{ r: 2.5, fill: "#FFFFFF", stroke: CHART.aubergine, strokeWidth: 1.5 }}
                            activeDot={{ r: 4 }}
                            connectNulls={true}
                            hide={!visibleLines.value}
                            isAnimationActive={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="ma"
                            name={maLabel}
                            stroke={CHART.lavender}
                            dot={false}
                            strokeWidth={3}
                            strokeLinecap="round"
                            connectNulls={true}
                            hide={!visibleLines.ma}
                            isAnimationActive={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
                <SeriesToggle
                    label={maLabel}
                    color={CHART.lavender}
                    thick
                    visible={visibleLines.ma}
                    onToggle={() =>
                        setVisibleLines((prev) => ({ ...prev, ma: !prev.ma }))
                    }
                />
                <SeriesToggle
                    label="Weigh-in"
                    color={CHART.aubergine}
                    visible={visibleLines.value}
                    onToggle={() =>
                        setVisibleLines((prev) => ({ ...prev, value: !prev.value }))
                    }
                />
            </div>
        </div>
    );
}

export default memo(AdvWeightChartRecharts);
