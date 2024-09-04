"use client";
import React, { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    LinearScale,
    TimeScale,
    TimeSeriesScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import "chartjs-adapter-moment";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { measurement } from "@/types/models";

ChartJS.register(
    LinearScale,
    TimeScale,
    TimeSeriesScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
        legend: {
            position: "top",
        },
    },
    maintainAspectRatio: false,
    scales: {
        x: {
            type: "timeseries",
            time: {
                unit: 'day',
            },
            ticks: {
                display: true,
            },
        },
    },
    elements: {
        line: {
            tension: 0.3, // Increase for smoother curves
        },
    }
};

const lineChartColorMap = {
    arms: { color: "#1565c0", hidden: true, backgroundColor: "#88bbf1" },
    chest: { color: "#009688", hidden: true, backgroundColor: "#51f7dc" }, // Green
    abdomen: { color: "#8bc34a", hidden: false, backgroundColor: "#e6f3d4" }, // Teal
    waist: { color: "#ff9800", hidden: true, backgroundColor: "#ffe585" }, // Orange
    hip: { color: "#f44336", hidden: true, backgroundColor: "#ffccc8" }, // Red
    thighs: { color: "#ad1457", hidden: true, backgroundColor: "#f1439f" }, // Purple
    calves: { color: "#404048", hidden: true, backgroundColor: "#747483" }, // Gray
};

export default function MeasurementChartNew(props: {
    days?: number;
    fetch: boolean;
    data?: measurement[];
}) {
    const [measurementData, setMeasurementData] = useState<measurement[]>([]);
    const daysOfData = props.days || 14;
    const getMeasurementData = async () => {
        try {
            const response = await axios.get(`/api/measurements/get/${daysOfData}/`);
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
    };
    const data: ChartData<"line"> = {
        labels: measurementData.map((dataElem) => dataElem.createdAt),
        datasets: [
            ...Object.entries(lineChartColorMap).map(([key, value]) => ({
                label: key,
                data: measurementData.map((dataElem) => dataElem[key]),
                borderColor: value.color,
                backgroundColor: value.backgroundColor,
                hidden: value.hidden,
            }))
        ],
    };
    useEffect(() => {
        if (props.fetch === false) {
            setMeasurementData(props.data.slice().reverse());
        } else {
            getMeasurementData();
        }
    }, [props.data, props.fetch]);

    return <Line options={options} data={data} />;
}
