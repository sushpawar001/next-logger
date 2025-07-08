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

interface WeightData {
    createdAt: string | number;
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
                <div style={{ color: "#f77f00" }}>
                    weight : {payload[0].value}
                </div>
            </div>
        );
    }
    return null;
};

export default function WeightChartRecharts(props: {
    days?: number;
    fetch: boolean;
    data?: WeightData[];
}) {
    const [weight, setWeight] = useState<WeightData[]>([]);
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
        } else if (props.fetch) {
            getWeight();
        }
    }, [getWeight, props.data, props.fetch]);

    // Find min/max for domain
    const minTime = weight.length
        ? Math.min(...weight.map((d) => d.createdAt as number))
        : undefined;
    const maxTime = weight.length
        ? Math.max(...weight.map((d) => d.createdAt as number))
        : undefined;

    // Calculate Y-axis domain with padding
    const weightValues = weight.map((d) => d.value).filter((v) => v !== null);
    const minWeight = weightValues.length ? Math.min(...weightValues) : 0;
    const maxWeight = weightValues.length ? Math.max(...weightValues) : 100;
    const weightRange = maxWeight - minWeight;
    const yDomain = [
        Math.round(Math.max(0, minWeight - weightRange * 0.1)), // 10% padding below, but not less than 0
        Math.round(maxWeight + weightRange * 0.1), // 10% padding above
    ];

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
                data={weight}
                margin={{ top: 0, right: 0, left: 20, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="createdAt"
                    type="number"
                    // domain={
                    //         ["auto", "auto"]
                    // }
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
                    domain={yDomain}
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                    width={20}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f77f00"
                    dot={false}
                    strokeWidth={2.2}
                    connectNulls={true}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
