"use client";
import React, { useEffect, useState, useCallback } from "react";
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
import type { ChartData, ChartOptions } from "chart.js";
import "chartjs-adapter-dayjs-4";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { simpleMovingAverage } from "@/helpers/statsHelpers";
import getMovingAvgInterval from "@/helpers/getMovingAvgInterval";

ChartJS.register(
    LinearScale,
    TimeScale,
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
            display: true,
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

export default function AdvGlucoseChart(props: {
    days?: number;
    fetch: boolean;
    data?: {}[];
}) {
    const [glucose, setGlucose] = useState([]);
    const daysOfData = props.days || 7;
    const [maInterval, setMaInterval] = useState(1);

    const getGlucose = useCallback(async () => {
        try {
            const response = await axios.get(`/api/glucose/get/${daysOfData}`);
            if (response.status === 200) {
                let glucoseData = response.data.data.reverse();
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
    const data: ChartData<"line"> = {
        labels: glucose.map((dataElem) => dataElem.createdAt),
        datasets: [
            {
                label: "Glucose",
                data: glucose.map((dataElem) => dataElem.value),
                borderColor: "#d62828",
                backgroundColor: "#d6282850",
                pointRadius: 0,
            },
            {
                label: `Moving Average (${maInterval})`,
                data: simpleMovingAverage(
                    glucose.map((dataElem) => dataElem.value),
                    maInterval
                ),
                borderColor: "#1f2937",
                backgroundColor: "#1f293750",
                pointRadius: 0,
            },
        ],
    };
    useEffect(() => {
        if (props.fetch === false) {
            setGlucose(props.data.slice().reverse());
        } else {
            getGlucose();
        }
    }, [getGlucose, props.data, props.fetch]);

    return <Line options={options} data={data} />;
}
