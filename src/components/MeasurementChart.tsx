import React, { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const lineChartColorMap = {
    arms: { color: "#1565c0", show: false },
    chest: { color: "#009688", show: false }, // Green
    abdomen: { color: "#8bc34a", show: true }, // Teal
    waist: { color: "#ff9800", show: false }, // Orange
    hip: { color: "#f44336", show: false }, // Red
    thighs: { color: "#ad1457", show: false }, // Purple
    calves: { color: "#404048", show: false }, // Gray
};

export default function CombinedMeasurementChart({ data, className = "" }) {
    const [lineProps, setLineProps] = useState(lineChartColorMap);
    const [reverseData, setReverseData] = useState([]);
    const selectLine = (e) => {
        const newLineProps = { ...lineProps };
        newLineProps[e.dataKey].show = !newLineProps[e.dataKey].show;
        setLineProps(newLineProps);
    };

    useEffect(() => {
        console.log(data);
        setReverseData(data.slice().reverse());
    }, [data]);

    return (
        <ResponsiveContainer
            className={`rounded-xl bg-white shadow-md ${className}`}
        >
            <LineChart
                data={reverseData}
                margin={{
                    top: 0,
                    right: 10,
                    left: 0,
                    bottom: 0,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis width={40} padding={{ top: 10, bottom: 10 }} />
                <Tooltip />
                <Legend onClick={selectLine} />
                {Object.keys(lineChartColorMap).map((input) => (
                    <Line
                        key={input}
                        type="monotone"
                        dataKey={input}
                        stroke={lineChartColorMap[input].color}
                        strokeWidth={2.5}
                        hide={lineProps[input].show === false}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
}
