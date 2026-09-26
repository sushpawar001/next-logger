import React, { useEffect, useState, useCallback } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea,
} from "recharts";
import axios from "axios";
import dayjs from "dayjs";
import { simpleMovingAverage } from "@/helpers/statsHelpers";
import getMovingAvgInterval from "@/helpers/getMovingAvgInterval";
import { GLUCOSE_TARGET } from "@/constants/constants";
import { CHART, axisProps, gridProps, statusColor } from "./chartTheme";
import { ChartTooltip, SeriesToggle, dailyTicks } from "./chartParts";

interface GlucoseData {
    createdAt: string | number;
    value: number;
}

/** In-range readings are hollow Aubergine dots; highs and lows take their status colour. */
const ReadingDot = (props: any) => {
    const { cx, cy, value } = props;
    if (cx == null || cy == null || value == null) return null;
    const color = statusColor(value);
    const inRange = color === CHART.aubergine;
    return (
        <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={inRange ? 2.5 : 3.5}
            fill={inRange ? "#FFFFFF" : color}
            stroke={inRange ? CHART.aubergine : "#FFFFFF"}
            strokeWidth={1.5}
        />
    );
};

export default function AdvGlucoseChartRecharts(props: {
    days?: number;
    fetch: boolean;
    data?: GlucoseData[];
}) {
    const [glucose, setGlucose] = useState<GlucoseData[]>([]);
    const [maInterval, setMaInterval] = useState(1);
    const [visibleLines, setVisibleLines] = useState<{
        value: boolean;
        ma: boolean;
    }>({ value: true, ma: true });
    const daysOfData = props.days || 7;

    // Helper to convert createdAt to timestamp (number)
    const prepareData = (data: GlucoseData[]): GlucoseData[] => {
        return data.map((item) => ({
            ...item,
            createdAt:
                typeof item.createdAt === "number"
                    ? item.createdAt
                    : new Date(item.createdAt).getTime(),
        }));
    };

    const getGlucose = useCallback(async () => {
        try {
            const response = await axios.get(`/api/glucose/get/${daysOfData}`);
            if (response.status === 200) {
                let glucoseData = prepareData(response.data.data.reverse());
                setGlucose(glucoseData);
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
            setGlucose(prepareData(props.data.slice().reverse()));
            setMaInterval(getMovingAvgInterval(daysOfData));
        } else if (props.fetch) {
            getGlucose();
        }
    }, [getGlucose, props.data, props.fetch]);

    const glucoseValues = glucose.map((d) => d.value);
    const maValues = simpleMovingAverage(glucoseValues, maInterval);
    const chartData = glucose.map((d, i) => ({
        ...d,
        ma: maValues[i],
    }));

    const minTime = glucose.length
        ? Math.min(...glucose.map((d) => d.createdAt as number))
        : undefined;
    const maxTime = glucose.length
        ? Math.max(...glucose.map((d) => d.createdAt as number))
        : undefined;

    const maLabel = `Moving avg (${maInterval})`;

    return (
        <div className="flex h-full w-full flex-col">
            <div className="min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid {...gridProps} />
                        <ReferenceArea
                            y1={GLUCOSE_TARGET.low}
                            y2={GLUCOSE_TARGET.high}
                            fill={CHART.oat}
                            fillOpacity={0.6}
                            ifOverflow="extendDomain"
                        />
                        <XAxis
                            {...axisProps}
                            dataKey="createdAt"
                            type="number"
                            domain={
                                minTime !== undefined && maxTime !== undefined
                                    ? [minTime, maxTime]
                                    : ["auto", "auto"]
                            }
                            ticks={dailyTicks(minTime, maxTime)}
                            tickFormatter={(value) =>
                                dayjs(value).format("D MMM")
                            }
                        />
                        <YAxis {...axisProps} width={36} />
                        <Tooltip content={<ChartTooltip unit="mg/dL" />} />
                        <Line
                            type="monotone"
                            dataKey="value"
                            name="Glucose"
                            stroke={CHART.aubergine}
                            dot={<ReadingDot />}
                            activeDot={{ r: 4 }}
                            strokeWidth={2}
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
                            connectNulls={true}
                            hide={!visibleLines.ma}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
                <SeriesToggle
                    label="Glucose"
                    color={CHART.aubergine}
                    visible={visibleLines.value}
                    onToggle={() =>
                        setVisibleLines((prev) => ({ ...prev, value: !prev.value }))
                    }
                />
                <SeriesToggle
                    label={maLabel}
                    color={CHART.lavender}
                    thick
                    visible={visibleLines.ma}
                    onToggle={() =>
                        setVisibleLines((prev) => ({ ...prev, ma: !prev.ma }))
                    }
                />
            </div>
        </div>
    );
}
