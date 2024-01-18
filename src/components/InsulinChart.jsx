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
import formatDate from '@/helpers/formatDate';

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

export default function InsulinChart(props) {
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
    const data = {
        labels: insulin.map((dataElem) => formatDate(dataElem.createdAt)),
        datasets: [
            {
                label: 'Insulin',
                data: insulin.map((dataElem) => dataElem.units),
                borderColor: 'rgb(8,145,178)',
                backgroundColor: 'rgb(207,250,254)',
            }
        ],
    };
    useEffect(() => {
        if (props.data && props.data.length > 0) {
            setInsulin(props.data.reverse())
        } else {
            getInsulin();
        }
    }, [props.data])

    return <Line options={options} data={data} />;
}
