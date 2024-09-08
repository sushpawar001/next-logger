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
            display: false,
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

    const data = useMemo(
        () => ({
            labels: weight.map((dataElem) => dataElem.createdAt),
            datasets: [
                {
                    label: "Weight",
                    data: weight.map((dataElem) => dataElem.value),
                    borderColor: "#f77f00",
                    backgroundColor: "#E0E0E0",
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
    }, [getWeight, props.data, props.fetch]);

    return <Line options={options} data={data} />;
}
