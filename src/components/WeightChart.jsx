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

export default function WeightChart(props) {
    const [weight, setWeight] = useState([])
    const daysOfData = props.days || 7;
    const getWeight = async () => {
        try {
            const response = await axios.get(`/api/weight/get/${daysOfData}/`);
            if (response.status === 200) {
                let weightData = response.data.data.reverse()
                setWeight(weightData);
            }
            else {
                console.error('API request failed with status:', response.status);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const data = {
        labels: weight.map((dataElem) => formatDate(dataElem.createdAt)),
        datasets: [
            {
                label: 'Weight',
                data: weight.map((dataElem) => dataElem.value),
                borderColor: 'rgb(8,145,178)',
                backgroundColor: 'rgb(207,250,254)',
            }
        ],
    };
    useEffect(() => {
        if (props.data && props.data.length > 0) {
            setWeight(props.data.reverse())
        } else {
            getWeight();
        }
    }, [props.data])

    return <Line options={options} data={data} />;
}
