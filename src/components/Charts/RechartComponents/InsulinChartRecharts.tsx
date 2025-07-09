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
import { insulin } from "@/types/models";

// Color palette (same as original)
const colors = [
    { background: "#fca31195", border: "#fca311" },
    { background: "#00304995", border: "#003049" },
    { background: "#d6282895", border: "#d62828" },
    { background: "#2A9D8F95", border: "#2A9D8F" },
    { background: "#3d348b95", border: "#3d348b" },
];

// Custom tooltip for human-readable date
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

export default function InsulinChartRecharts(props: {
    days?: number;
    fetch?: boolean;
    data?: insulin[];
}) {
    const [insulin, setInsulin] = useState<insulin[]>([]);
    const [visibleLines, setVisibleLines] = useState<{
        [name: string]: boolean;
    }>({});
    const daysOfData = props.days || 7;

    // Fetch and prepare data
    const getInsulin = useCallback(async () => {
        try {
            const response = await axios.get(`/api/insulin/get/${daysOfData}`);
            if (response.status === 200) {
                let insulinData = response.data.data.reverse();
                setInsulin(insulinData);
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
            setInsulin(props.data.slice().reverse());
        } else if (props.fetch !== false) {
            getInsulin();
        }
    }, [getInsulin, props.data, props.fetch]);

    // Get unique insulin names
    const getUniqueInsulins = (arr: insulin[]): string[] => {
        let uniqueKeys = new Set<string>();
        arr.forEach((obj) => {
            uniqueKeys.add(obj.name);
        });
        return Array.from(uniqueKeys);
    };

    // Aggregate data by date and insulin name
    const aggregateInsulinData = (
        insulin: insulin[],
        allInsulins: string[]
    ) => {
        const aggregatedData: { [date: string]: { [name: string]: number } } =
            {};
        const emptyInsulinObj: { [name: string]: number } = allInsulins.reduce(
            (acc, current) => ({ ...acc, [current]: 0 }),
            {}
        );
        insulin.forEach((element) => {
            const date = dayjs(element.createdAt).format("YYYY-MM-DD");
            aggregatedData[date] = aggregatedData[date] || {
                ...emptyInsulinObj,
            };
            aggregatedData[date][element.name] += element.units;
        });
        return aggregatedData;
    };

    // Prepare chart data for Recharts
    const allInsulins: string[] = getUniqueInsulins(insulin);
    const aggregatedData = aggregateInsulinData(insulin, allInsulins);
    const chartData = Object.keys(aggregatedData).map((date) => ({
        date,
        ...aggregatedData[date],
        timestamp: new Date(date).getTime(),
    }));

    // Set initial visible lines when insulin types change
    useEffect(() => {
        if (allInsulins.length > 0 && Object.keys(visibleLines).length === 0) {
            const initial: { [name: string]: boolean } = {};
            allInsulins.forEach((name) => (initial[name] = true));
            setVisibleLines(initial);
        }
    }, [allInsulins, visibleLines]);

    // Custom legend for toggling
    const renderLegend = () => (
        <div
            // style={{
            //     display: "flex",
            //     gap: 16,
            //     flexWrap: "wrap",
            //     marginBottom: 8,
            // }}
            className="flex gap-4 flex-wrap mb-2 justify-center"
        >
            {allInsulins.map((name, idx) => (
                <span
                    key={name}
                    onClick={() =>
                        setVisibleLines((prev) => ({
                            ...prev,
                            [name]: !prev[name],
                        }))
                    }
                    style={{
                        color: visibleLines[name]
                            ? colors[idx % colors.length].border
                            : "#ccc",
                        cursor: "pointer",
                        fontWeight: visibleLines[name] ? 600 : 400,
                        textDecoration: visibleLines[name]
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
                            background: colors[idx % colors.length].border,
                            borderRadius: 2,
                            marginRight: 6,
                            opacity: visibleLines[name] ? 1 : 0.3,
                        }}
                    ></span>
                    {name}
                </span>
            ))}
        </div>
    );

    // Find min/max for domain
    const minTime = chartData.length
        ? Math.min(...chartData.map((d) => d.timestamp))
        : undefined;
    const maxTime = chartData.length
        ? Math.max(...chartData.map((d) => d.timestamp))
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

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{ top: 0, right: 0, left: 20, bottom: 0 }}
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
                        tickFormatter={(value) => dayjs(value).format("MMM D")}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickMargin={8}
                        width={20}
                        domain={["auto", "auto"]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {allInsulins.map((name, idx) => (
                        <Line
                            key={name}
                            type="monotone"
                            dataKey={name}
                            stroke={colors[idx % colors.length].border}
                            dot={false}
                            strokeWidth={2.2}
                            connectNulls={true}
                            hide={!visibleLines[name]}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
            {renderLegend()}
        </div>
    );
}
