"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
    Chart as ChartJS,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import "chartjs-adapter-moment";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { weight } from "@/types/models";
import type { ChartData, ChartOptions } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";

ChartJS.register(
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    zoomPlugin
);

const calculateMovingAverage = (data, windowSize) => {
    const movingAverage = [];
    for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - windowSize + 1);
        const end = i + 1;
        const sum = data.slice(start, end).reduce((acc, val) => acc + val, 0);
        movingAverage.push(sum / (end - start));
    }
    return movingAverage;
};

export const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
        legend: {
            display: true,
        },
        zoom: {
            pan: {
                enabled: true,
                mode: "xy",
            },
            zoom: {
                wheel: {
                    enabled: true,
                },
                pinch: {
                    enabled: true,
                },
                mode: "xy",
                onZoomComplete({ chart }) {
                    // This update is needed to display up to date zoom level in the title.
                    // Without this, previous zoom level is displayed.
                    // The reason is: title uses the same beforeUpdate hook, and is evaluated before zoom.
                    chart.update("none");
                },
            },
        },
    },
    maintainAspectRatio: false,
    scales: {
        x: {
            type: "time",
            time: {
                unit: "day",
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
    },
};

export default function WeightChart(props: {
    days?: number;
    fetch: boolean;
    data?: {}[];
}) {
    const [weight, setWeight] = useState([]);
    const daysOfData = props.days || 7;
    const getWeight = useCallback(async () => {
        try {
            const response = await axios.get(`/api/weight/get/${daysOfData}/`);
            if (response.status === 200) {
                let weightData = response.data.data.reverse();
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

    const movingAverage = calculateMovingAverage(
        weight.map((dataElem) => dataElem.value),
        7
    );

    const data = useMemo(
        () => ({
            labels: weight.map((dataElem) => dataElem.createdAt),
            datasets: [
                {
                    label: "Weight",
                    data: weight.map((dataElem) => dataElem.value),
                    borderColor: "#fca311",
                    backgroundColor: "#fca31195",
                },
                {
                    label: "Weight MA",
                    data: movingAverage,
                    borderColor: "#000000",
                    backgroundColor: "#00000095",
                    pointRadius: 0,
                    hidden: true,
                },
            ],
        }),
        [weight]
    );

    useEffect(() => {
        if (props.fetch === false) {
            setWeight(props.data.slice().reverse());
        } else {
            getWeight();
        }
    }, [props.data, props.fetch]);

    return <Line options={options} data={data} />;
}
