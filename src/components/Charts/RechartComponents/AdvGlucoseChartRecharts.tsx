import React, { useEffect, useState, useCallback } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import axios from "axios";
import dayjs from "dayjs";
import { simpleMovingAverage } from "@/helpers/statsHelpers";
import getMovingAvgInterval from "@/helpers/getMovingAvgInterval";

interface GlucoseData {
    createdAt: string | number;
    value: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div
                style={{
                    background: "white",
                    border: "1px solid #eee",
                    padding: 10,
                }}
            >
                <div style={{ fontWeight: 600 }}>
                    {dayjs(label).format("MMM D, YYYY h:mm A")}
                </div>
                {payload.map((item: any, idx: number) => (
                    <div key={idx} style={{ color: item.stroke }}>
                        {item.name}: {item.value}
                    </div>
                ))}
            </div>
        );
    }
    return null;
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

    // Prepare chart data with moving average
    const glucoseValues = glucose.map((d) => d.value);
    const maValues = simpleMovingAverage(glucoseValues, maInterval);
    const chartData = glucose.map((d, i) => ({
        ...d,
        ma: maValues[i],
    }));

    // Find min/max for domain
    const minTime = glucose.length
        ? Math.min(...glucose.map((d) => d.createdAt as number))
        : undefined;
    const maxTime = glucose.length
        ? Math.max(...glucose.map((d) => d.createdAt as number))
        : undefined;

    // Generate ticks at 24-hour intervals (midnight)
    const getDailyTicks = () => {
        if (!minTime || !maxTime) return [];
        const ticks = [];
        let current = dayjs(minTime).valueOf();
        while (current <= maxTime) {
            ticks.push(current);
            current = dayjs(current).add(1, "day").valueOf();
        }
        return ticks;
    };

    // Custom legend for toggling
    const renderLegend = () => (
        <div className="flex gap-4 flex-wrap mb-2 justify-center">
            <span className="flex items-center gap-2">
                <span
                    onClick={() =>
                        setVisibleLines((prev) => ({
                            ...prev,
                            value: !prev.value,
                        }))
                    }
                    style={{
                        color: visibleLines.value ? "#d62828" : "#ccc",
                        cursor: "pointer",
                        fontWeight: visibleLines.value ? 600 : 400,
                        textDecoration: visibleLines.value
                            ? "none"
                            : "line-through",
                        userSelect: "none",
                    }}
                >
                    <span
                        style={{
                            display: "inline-block",
                            width: 12,
                            height: 12,
                            background: "#d62828",
                            borderRadius: 2,
                            marginRight: 6,
                            opacity: visibleLines.value ? 1 : 0.3,
                        }}
                    ></span>
                    Glucose
                </span>
                <span
                    onClick={() =>
                        setVisibleLines((prev) => ({ ...prev, ma: !prev.ma }))
                    }
                    style={{
                        color: visibleLines.ma ? "#1f2937" : "#ccc",
                        cursor: "pointer",
                        fontWeight: visibleLines.ma ? 600 : 400,
                        textDecoration: visibleLines.ma
                            ? "none"
                            : "line-through",
                        userSelect: "none",
                    }}
                >
                    <span
                        style={{
                            display: "inline-block",
                            width: 12,
                            height: 12,
                            background: "#1f2937",
                            borderRadius: 2,
                            marginRight: 6,
                            opacity: visibleLines.ma ? 1 : 0.3,
                        }}
                    ></span>
                    {`Moving Avg (${maInterval})`}
                </span>
            </span>
        </div>
    );

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 0, right: 0, left: 20, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="createdAt"
                            type="number"
                            domain={
                                minTime !== undefined && maxTime !== undefined
                                    ? [minTime, maxTime]
                                    : ["auto", "auto"]
                            }
                            ticks={getDailyTicks()}
                            tick={{ fontSize: 12 }}
                            tickMargin={8}
                            tickFormatter={(value) =>
                                dayjs(value).format("MMM D")
                            }
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            tickMargin={8}
                            width={20}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {/* Remove <Legend /> and use custom legend below */}
                        <Line
                            type="monotone"
                            dataKey="value"
                            name="Glucose"
                            stroke="#d62828"
                            dot={false}
                            strokeWidth={2.2}
                            connectNulls={true}
                            hide={!visibleLines.value}
                        />
                        <Line
                            type="monotone"
                            dataKey="ma"
                            name={`Moving Avg (${maInterval})`}
                            stroke="#1f2937"
                            dot={false}
                            strokeWidth={2.2}
                            connectNulls={true}
                            hide={!visibleLines.ma}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div style={{ height: 48, marginTop: 8, overflow: "hidden" }}>
                {renderLegend()}
            </div>
        </div>
    );
}
