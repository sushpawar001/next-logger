import React, { useEffect, useState, useCallback } from "react";
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
import { CHART, axisProps, gridProps } from "./chartTheme";
import { ChartTooltip, SeriesToggle, dailyTicks } from "./chartParts";

interface WeightData {
    createdAt: string | number;
    value: number;
}

/**
 * Weight is a trend, not a verdict: the Lavender moving average is the main
 * line, and single weigh-ins sit behind it as a thin line with small dots.
 */
export default function AdvWeightChartRecharts(props: {
    days?: number;
    fetch: boolean;
    data?: WeightData[];
}) {
    const [weight, setWeight] = useState<WeightData[]>([]);
    const [maInterval, setMaInterval] = useState(1);
    const [visibleLines, setVisibleLines] = useState<{
        value: boolean;
        ma: boolean;
    }>({ value: true, ma: true });
    const daysOfData = props.days || 7;

    // Helper to convert createdAt to timestamp (number)
    const prepareData = (data: WeightData[]): WeightData[] => {
        return data.map((item) => ({
            ...item,
            createdAt:
                typeof item.createdAt === "number"
                    ? item.createdAt
                    : new Date(item.createdAt).getTime(),
        }));
    };

    const getWeight = useCallback(async () => {
        try {
            const response = await axios.get(`/api/weight/get/${daysOfData}`);
            if (response.status === 200) {
                let weightData = prepareData(response.data.data.reverse());
                setWeight(weightData);
                setMaInterval(getMovingAvgInterval(daysOfData));
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
        if (props.fetch === false && props.data) {
            setWeight(prepareData(props.data.slice().reverse()));
            setMaInterval(getMovingAvgInterval(daysOfData));
        } else if (props.fetch) {
            getWeight();
        }
    }, [getWeight, props.data, props.fetch]);

    const weightValues = weight.map((d) => d.value);
    const maValues = simpleMovingAverage(weightValues, maInterval);
    const chartData = weight.map((d, i) => ({
        ...d,
        ma: maValues[i],
    }));

    const minTime = weight.length
        ? Math.min(...weight.map((d) => d.createdAt as number))
        : undefined;
    const maxTime = weight.length
        ? Math.max(...weight.map((d) => d.createdAt as number))
        : undefined;

    // Tight, padded domain: a kilo matters, so don't start the axis at zero.
    const weightOnly = weightValues.filter((v) => v !== null);
    const minWeight = weightOnly.length ? Math.min(...weightOnly) : 0;
    const maxWeight = weightOnly.length ? Math.max(...weightOnly) : 100;
    const pad = Math.max(0.5, (maxWeight - minWeight) * 0.15);
    const yDomain = [
        Math.floor(Math.max(0, minWeight - pad)),
        Math.ceil(maxWeight + pad),
    ];

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
                            ticks={dailyTicks(minTime, maxTime, 6)}
                            tickFormatter={(value) =>
                                dayjs(value).format("D MMM")
                            }
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
