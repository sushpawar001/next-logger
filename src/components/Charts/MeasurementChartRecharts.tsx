import React, { useEffect, useState, useCallback } from "react";
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

const lineChartColorMap = {
    arms: { color: "#1565c0", backgroundColor: "#88bbf1" },
    chest: { color: "#009688", backgroundColor: "#51f7dc" },
    abdomen: { color: "#8bc34a", backgroundColor: "#e6f3d4" },
    waist: { color: "#ff9800", backgroundColor: "#ffe585" },
    hip: { color: "#f44336", backgroundColor: "#ffccc8" },
    thighs: { color: "#ad1457", backgroundColor: "#f1439f" },
    calves: { color: "#404048", backgroundColor: "#747483" },
};
const measurementKeys = Object.keys(lineChartColorMap);

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
                    {dayjs(label).format("MMM D, YYYY")}
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

export default function MeasurementChartRecharts(props: {
    days?: number;
    fetch?: boolean;
    data?: measurement[];
}) {
    const [measurementData, setMeasurementData] = useState<measurement[]>([]);
    const [visibleLines, setVisibleLines] = useState<{
        [key: string]: boolean;
    }>({});
    const daysOfData = props.days || 14;

    // Fetch and prepare data
    const getMeasurementData = useCallback(async () => {
        try {
            const response = await axios.get(
                `/api/measurements/get/${daysOfData}`
            );
            if (response.status === 200) {
                let data = response.data.data.reverse();
                setMeasurementData(data);
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
        if (props.data && props.data.length > 0) {
            setMeasurementData(props.data.slice().reverse());
        } else if (props.fetch !== false) {
            getMeasurementData();
        }
    }, [getMeasurementData, props.data, props.fetch]);

    // Prepare chart data for Recharts
    const chartData = measurementData.map((entry) => ({
        ...entry,
        date: dayjs(entry.createdAt).format("YYYY-MM-DD"),
        timestamp: entry.createdAt
            ? new Date(entry.createdAt).getTime()
            : undefined,
    }));

    // Set initial visible lines
    useEffect(() => {
        if (Object.keys(visibleLines).length === 0) {
            const initial: { [key: string]: boolean } = {};
            measurementKeys.forEach(
                (key) => (initial[key] = key === "abdomen" ? true : false)
            );
            setVisibleLines(initial);
        }
    }, [visibleLines]);

    // Find min/max for domain
    const minTime = chartData.length
        ? Math.min(...chartData.map((d) => d.timestamp || 0))
        : undefined;
    const maxTime = chartData.length
        ? Math.max(...chartData.map((d) => d.timestamp || 0))
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

    // Compute min/max for Y axis based on visible lines
    const getYDomain = () => {
        let min = Infinity;
        let max = -Infinity;
        chartData.forEach((entry) => {
            measurementKeys.forEach((key) => {
                if (visibleLines[key] && typeof entry[key] === "number") {
                    if (entry[key] < min) min = entry[key];
                    if (entry[key] > max) max = entry[key];
                }
            });
        });
        if (min === Infinity || max === -Infinity) {
            // fallback if no data is visible
            return [0, 1];
        }
        if (min === max) {
            // fallback if all values are the same
            return [min - 1, max + 1];
        }
        const range = max - min;
        const padding = range * 0.02;
        return [min - padding, max + padding];
    };
    const yDomain = getYDomain();

    // Custom legend for toggling
    const renderLegend = () => (
        <div className="flex gap-4 flex-wrap mb-2 justify-center">
            {measurementKeys.map((key, idx) => (
                <span
                    key={key}
                    onClick={() =>
                        setVisibleLines((prev) => ({
                            ...prev,
                            [key]: !prev[key],
                        }))
                    }
                    style={{
                        color: visibleLines[key]
                            ? lineChartColorMap[key].color
                            : "#ccc",
                        cursor: "pointer",
                        fontWeight: visibleLines[key] ? 600 : 400,
                        textDecoration: visibleLines[key]
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
                            background: lineChartColorMap[key].color,
                            borderRadius: 2,
                            marginRight: 6,
                            opacity: visibleLines[key] ? 1 : 0.3,
                        }}
                    ></span>
                    {key}
                </span>
            ))}
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
                        margin={{ top: 0, right: 0, left: 25, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="timestamp"
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
                            domain={yDomain}
                            tickCount={6}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {measurementKeys.map((key, idx) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={lineChartColorMap[key].color}
                                dot={false}
                                strokeWidth={2.2}
                                connectNulls={true}
                                hide={!visibleLines[key]}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
            {renderLegend()}
        </div>
    );
}
