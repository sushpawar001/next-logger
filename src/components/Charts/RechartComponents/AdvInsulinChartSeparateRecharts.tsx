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
import { simpleMovingAverage } from "@/helpers/statsHelpers";
import getMovingAvgInterval from "@/helpers/getMovingAvgInterval";

const colors = [
    { background: "#fca31195", border: "#fca311", maBorder: "#DF2935" },
    { background: "#00304995", border: "#003049", maBorder: "#48ACF0" },
    { background: "#d6282895", border: "#d62828", maBorder: "#1f2937" },
    { background: "#2A9D8F95", border: "#2A9D8F", maBorder: "#3d348b" },
    { background: "#3d348b95", border: "#3d348b", maBorder: "#2A9D8F" },
];

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

export default function AdvInsulinChartSeparateRecharts(props: {
    days?: number;
    fetch?: boolean;
    data?: insulin[];
}) {
    const [insulinData, setInsulinData] = useState<insulin[]>([]);
    const [maInterval, setMaInterval] = useState(1);
    // Add visibleLines state for toggling
    const [visibleLines, setVisibleLines] = useState<{
        [key: string]: boolean;
    }>({});
    const daysOfData = props.days || 7;

    const getInsulin = useCallback(async () => {
        try {
            const response = await axios.get(`/api/insulin/get/${daysOfData}`);
            if (response.status === 200) {
                let data = response.data.data.reverse();
                setInsulinData(data);
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
        if (props.data && props.data.length > 0) {
            setInsulinData(props.data.slice().reverse());
            setMaInterval(getMovingAvgInterval(daysOfData));
        } else {
            getInsulin();
        }
    }, [getInsulin, props.data]);

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
        insulinArr: insulin[],
        allInsulins: string[]
    ) => {
        const aggregatedData: { [date: string]: { [name: string]: number } } =
            {};
        const emptyInsulinObj: { [name: string]: number } = allInsulins.reduce(
            (acc, current) => ({ ...acc, [current]: 0 }),
            {}
        );
        insulinArr.forEach((element) => {
            const date = dayjs(element.createdAt).format("YYYY-MM-DD");
            aggregatedData[date] = aggregatedData[date] || {
                ...emptyInsulinObj,
            };
            aggregatedData[date][element.name] += element.units;
        });
        return aggregatedData;
    };

    const allInsulins: string[] = getUniqueInsulins(insulinData);
    const aggregatedData = aggregateInsulinData(insulinData, allInsulins);
    // Prepare chart data with moving averages
    const chartData = Object.keys(aggregatedData).map((date) => {
        const entry: any = { date, timestamp: new Date(date).getTime() };
        allInsulins.forEach((name) => {
            entry[name] = aggregatedData[date][name];
        });
        return entry;
    });
    // Add moving average for each insulin type
    allInsulins.forEach((name) => {
        const values = chartData.map((d) => d[name]);
        const maValues = simpleMovingAverage(values, maInterval);
        chartData.forEach((d, i) => {
            d[`${name}_ma`] = maValues[i];
        });
    });

    // Set initial visible lines when insulin types change
    useEffect(() => {
        if (allInsulins.length > 0 && Object.keys(visibleLines).length === 0) {
            const initial: { [key: string]: boolean } = {};
            allInsulins.forEach((name) => {
                initial[name] = true;
                initial[`${name}_ma`] = true;
            });
            setVisibleLines(initial);
        }
    }, [allInsulins, visibleLines]);

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

    // Custom legend for toggling
    const renderLegend = () => (
        <div className="flex gap-4 flex-wrap mb-2 justify-center">
            {allInsulins.map((name, idx) => (
                <span key={name} className="flex items-center gap-2">
                    <span
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
                    <span
                        onClick={() =>
                            setVisibleLines((prev) => ({
                                ...prev,
                                [`${name}_ma`]: !prev[`${name}_ma`],
                            }))
                        }
                        style={{
                            color: visibleLines[`${name}_ma`]
                                ? colors[idx % colors.length].maBorder
                                : "#ccc",
                            cursor: "pointer",
                            fontWeight: visibleLines[`${name}_ma`] ? 600 : 400,
                            textDecoration: visibleLines[`${name}_ma`]
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
                                background:
                                    colors[idx % colors.length].maBorder,
                                borderRadius: 2,
                                marginRight: 6,
                                opacity: visibleLines[`${name}_ma`] ? 1 : 0.3,
                            }}
                        ></span>
                        {name} MA
                    </span>
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
                        {/* Remove <Legend /> */}
                        {allInsulins.map((name, idx) => [
                            <Line
                                key={name}
                                type="monotone"
                                dataKey={name}
                                name={`${name}`}
                                stroke={colors[idx % colors.length].border}
                                dot={false}
                                strokeWidth={2.2}
                                connectNulls={true}
                                hide={!visibleLines[name]}
                            />,
                            <Line
                                key={name + "_ma"}
                                type="monotone"
                                dataKey={`${name}_ma`}
                                name={`${name} MA (${maInterval})`}
                                stroke={colors[idx % colors.length].maBorder}
                                dot={false}
                                strokeWidth={2.2}
                                connectNulls={true}
                                hide={!visibleLines[`${name}_ma`]}
                            />,
                        ])}
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div style={{ height: 48, marginTop: 8, overflow: "hidden" }}>
                {renderLegend()}
            </div>
        </div>
    );
}
