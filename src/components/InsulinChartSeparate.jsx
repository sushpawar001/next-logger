'use client';
import React, { useEffect, useState } from 'react';
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
import annotationPlugin from 'chartjs-plugin-annotation';
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
    annotationPlugin,
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
                display: false
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

    const aggregateInsulinData = (insulin) => {
        const aggregatedData = {};

        insulin.forEach(element => {
            const date = moment.utc(element.createdAt).tz('Asia/Kolkata').format('DD MMM YY');
            aggregatedData[date] = aggregatedData[date] || { Actrapid: 0, Lantus: 0 };
            aggregatedData[date][element.name] += element.units;
        });
        return aggregatedData;
    };

    const getChartData = (aggregatedData) => {
        const labels = Object.keys(aggregatedData);
        const datasets = [
            {
                label: 'ActrapidData',
                data: labels.map(createdAt => aggregatedData[createdAt].Actrapid),
                borderColor: 'rgb(8,145,178)',
                backgroundColor: 'rgb(207,250,254)',
            },
            {
                label: 'LantusData',
                data: labels.map(createdAt => aggregatedData[createdAt].Lantus),
                borderColor: 'rgb(220,38,38)',
                backgroundColor: 'rgb(254,226,226)',
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

    const aggregatedData = aggregateInsulinData(insulin);
    const ChartData = getChartData(aggregatedData)

    return <Line options={options} data={ChartData} />;
}
