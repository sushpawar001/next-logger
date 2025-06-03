"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import axios from "axios";
import moment from "moment-timezone";
import type { ChartData, ChartOptions } from "chart.js";
import { insulin, insulinName } from "@/types/models";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);
type aggregatedDataType = { [date: string]: { [name: string]: number } };

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

export default function InsulinChartSeparate(props) {
    const [insulin, setInsulin] = useState<insulin[]>([]);
    const daysOfData = props.days || 7;
    const getInsulin = useCallback(
        async () => {
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
        },
        [daysOfData]
    );

    const aggregateInsulinData = useCallback(
        (insulin: insulin[], allInsulins: string[]) => {
            const aggregatedData: aggregatedDataType = {};
            const emptyInsulinObj: {} = allInsulins.reduce(
                (acc, current) => ({ ...acc, [current]: 0 }),
                {}
            );

            insulin.forEach((element) => {
                const date = moment
                    .utc(element.createdAt)
                    .tz("Asia/Kolkata")
                    .format("DD MMM YY");
                aggregatedData[date] = aggregatedData[date] || {
                    ...emptyInsulinObj,
                };
                aggregatedData[date][element.name] += element.units;
            });
            return aggregatedData;
        },
        []
    );

    const getUniqueInsulins = (arr: insulin[]): string[] => {
        let uniqueKeys = new Set<string>();
        arr.forEach((obj) => {
            uniqueKeys.add(obj.name);
        });
        return Array.from(uniqueKeys);
    };

    const colors = [
        { background: "#fca31195", border: "#fca311" },
        { background: "#00304995", border: "#003049" },
        { background: "#d6282895", border: "#d62828" },
        { background: "#2A9D8F95", border: "#2A9D8F" },
        { background: "#3d348b95", border: "#3d348b" },
    ];

    const getChartData = (
        aggregatedData: aggregatedDataType,
        InsulinObj: string[]
    ) => {
        const labels = Object.keys(aggregatedData);
        const datasets = [];
        InsulinObj.forEach((data, idx) => {
            const obj = {
                label: `${data} Data`,
                data: labels.map(
                    (createdAt) => aggregatedData[createdAt][data]
                ),
                borderColor: colors[idx].border,
                backgroundColor: colors[idx].background,
            };
            datasets.push(obj);
            return obj;
        });
        return { labels, datasets };
    };

    useEffect(() => {
        if (props.data && props.data.length > 0) {
            setInsulin(props.data.slice().reverse());
        } else {
            getInsulin();
        }
    }, [getInsulin, props.data]);

    const allInsulins: string[] = getUniqueInsulins(insulin);
    const aggregatedData = aggregateInsulinData(insulin, allInsulins);
    const ChartData = getChartData(aggregatedData, allInsulins);
    // console.log(ChartData);

    // const aggregatedData = useMemo(
    //     () => aggregateInsulinData(insulin, allInsulins),
    //     [aggregateInsulinData, allInsulins, insulin]
    // );
    // const ChartData: ChartData<"line"> = useMemo(
    //     () => getChartData(aggregatedData, allInsulins),
    //     [allInsulins, aggregatedData]
    // );

    return <Line options={options} data={ChartData} />;
}
