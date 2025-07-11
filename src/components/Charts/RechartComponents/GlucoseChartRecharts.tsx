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

interface GlucoseData {
    createdAt: string | number; // Accept both for input, but will convert to number
    value: number;
}

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
                    {dayjs(label).format("MMM D, YYYY h:mm A")}
                </div>
                <div style={{ color: "#d62828" }}>
                    glucose : {payload[0].value}
                </div>
            </div>
        );
    }
    return null;
};

export default function GlucoseChartRecharts(props: {
    days?: number;
    fetch: boolean;
    data?: GlucoseData[];
}) {
    const [glucose, setGlucose] = useState<GlucoseData[]>([]);
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
        } else if (props.fetch) {
            getGlucose();
        }
    }, [getGlucose, props.data, props.fetch]);

    // Find min/max for domain
    const minTime = glucose.length
        ? Math.min(...glucose.map((d) => d.createdAt as number))
        : undefined;
    const maxTime = glucose.length
        ? Math.max(...glucose.map((d) => d.createdAt as number))
        : undefined;

    // Pad data with null-value points at min and max if needed
    let paddedData = glucose;
    if (glucose.length && minTime !== undefined && maxTime !== undefined) {
        const first = glucose[0];
        const last = glucose[glucose.length - 1];
        if ((first.createdAt as number) > minTime) {
            paddedData = [{ createdAt: minTime, value: null }, ...paddedData];
        }
        if ((last.createdAt as number) < maxTime) {
            paddedData = [...paddedData, { createdAt: maxTime, value: null }];
        }
    }

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
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={paddedData}
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
                    tickFormatter={(value) => dayjs(value).format("MMM D")}
                />
                <YAxis tick={{ fontSize: 12 }} tickMargin={8} width={20} />
                <Tooltip content={<CustomTooltip />} />
                {/* Healthy range: 70-140 mg/dL */}
                <ReferenceArea
                    y1={70}
                    y2={140}
                    fill="#90ee90"
                    fillOpacity={0.18}
                    ifOverflow="extendDomain"
                />
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#d62828"
                    dot={false}
                    strokeWidth={2.2}
                    connectNulls={true}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
