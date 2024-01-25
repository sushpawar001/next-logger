'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import moment from 'moment-timezone';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
);

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
    },
    maintainAspectRatio: false,
    scales: {
        x: {
            ticks: {
                display: true,
            }
        },
    },
    elements: {
        line: {
            lineTension: 0.3 // Increase for smoother curves
        }
    }
};

export default function InsulinChartSeparate(props) {
    const [insulin, setInsulin] = useState([])
    const daysOfData = props.days || 7;
    const getInsulin = async () => {
        try {
            const response = await axios.get(`/api/insulin/get/${daysOfData}/`);
            if (response.status === 200) {
                let insulinData = response.data.data.reverse()
                setInsulin(insulinData);
            }
            else {
                console.error('API request failed with status:', response.status);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const aggregateInsulinData = useCallback(
        (insulin) => {
            const aggregatedData = {};

            insulin.forEach(element => {
                const date = moment.utc(element.createdAt).tz('Asia/Kolkata').format('DD MMM YY');
                aggregatedData[date] = aggregatedData[date] || { Actrapid: 0, Lantus: 0 };
                aggregatedData[date][element.name] += element.units;
            });
            return aggregatedData;
        },
        [],
    )

    const getChartData = (aggregatedData) => {
        const labels = Object.keys(aggregatedData);
        const datasets = [
            {
                label: 'ActrapidData',
                data: labels.map(createdAt => aggregatedData[createdAt].Actrapid),
                borderColor: '#0E7C7B',
                backgroundColor: '#A3F5F3',
            },
            {
                label: 'LantusData',
                data: labels.map(createdAt => aggregatedData[createdAt].Lantus),
                borderColor: '#202125',
                backgroundColor: '#BEBFC6',
            }
        ];

        return { labels, datasets };
    };

    useEffect(() => {
        if (props.data && props.data.length > 0) {
            setInsulin(props.data.reverse())
        } else {
            getInsulin();
        }
    }, [props.data])

    // const aggregatedData = aggregateInsulinData(insulin);
    // const ChartData = getChartData(aggregatedData)

    const aggregatedData = useMemo(() => aggregateInsulinData(insulin), [aggregateInsulinData, insulin]);
    const ChartData = useMemo(() => getChartData(aggregatedData), [aggregatedData]);


    return <Line options={options} data={ChartData} />;
}
