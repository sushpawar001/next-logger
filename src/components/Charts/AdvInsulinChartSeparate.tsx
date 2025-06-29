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
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { ChartData, ChartOptions } from "chart.js";
import { insulin, insulinName } from "@/types/models";
import getMovingAvgInterval from "@/helpers/getMovingAvgInterval";
import { simpleMovingAverage } from "@/helpers/statsHelpers";
import { complementaryColor } from "@/helpers/complementaryColor";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

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

export default function AdvInsulinChartSeparate(props) {
    const [insulin, setInsulin] = useState<insulin[]>([]);
    const [maInterval, setMaInterval] = useState(1);
    const daysOfData = props.days || 7;
    const getInsulin = useCallback(async () => {
        try {
            const response = await axios.get(`/api/insulin/get/${daysOfData}`);
            if (response.status === 200) {
                let insulinData = response.data.data.reverse();
                setInsulin(insulinData);
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

    const aggregateInsulinData = useCallback(
        (insulin: insulin[], allInsulins: string[]) => {
            const aggregatedData: aggregatedDataType = {};
            const emptyInsulinObj: {} = allInsulins.reduce(
                (acc, current) => ({ ...acc, [current]: 0 }),
                {}
            );

            insulin.forEach((element) => {
                const date = dayjs
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
        { background: "#fca31195", border: "#fca311", maBorder: "#DF2935" },
        { background: "#00304995", border: "#003049", maBorder: "#48ACF0" },
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
                pointRadius: 0,
            };
            const MAobj = {
                label: `${data} Data MA`,
                data: simpleMovingAverage(
                    labels.map(
                        (createdAt) => aggregatedData[createdAt][data]
                    ) as number[],
                    maInterval
                ),
                borderColor: colors[idx].maBorder,
                backgroundColor: colors[idx].maBorder,
                pointRadius: 0,
            };
            datasets.push(obj);
            datasets.push(MAobj);
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
