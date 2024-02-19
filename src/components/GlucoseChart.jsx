'use client';
import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import 'chartjs-adapter-moment';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
    LinearScale,
    TimeScale,
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
            display: false,
        },
    },
    maintainAspectRatio: false,
    scales: {
        x: {
            type: 'time',
            time: {
                unit: 'day'
            },
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

export default function GlucoseChartTime(props) {
    const [glucose, setGlucose] = useState([])
    const daysOfData = props.days || 7;
    const getGlucose = async () => {
        try {
            const response = await axios.get(`/api/glucose/get/${daysOfData}/`);
            if (response.status === 200) {
                let glucoseData = response.data.data.reverse()
                setGlucose(glucoseData);
            }
            else {
                console.error('API request failed with status:', response.status);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const data = {
        // labels: glucose.map((dataElem) => ShortDateformat(dataElem.createdAt)),
        labels: glucose.map((dataElem) => dataElem.createdAt),
        datasets: [
            {
                label: 'Glucose',
                data: glucose.map((dataElem) => dataElem.value),
                borderColor: '#d62828',
                backgroundColor: '#E0E0E0',
            }
        ],
    };
    useEffect(() => {
        if (props.data && props.data.length > 0) {
            setGlucose(props.data.slice().reverse())
        } else {
            getGlucose();
        }
    }, [props.data])

    return <Line options={options} data={data} />;
}
