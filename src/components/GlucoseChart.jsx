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
import { ShortDateformat } from '@/helpers/formatDate';

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
            display: false,
        },
        // annotation: {
        //     annotations: {
        //         line1: {
        //             type: 'line',
        //             yMin: 70,
        //             yMax: 70,
        //             borderColor: 'rgb(220,38,38)',
        //             borderWidth: 2,
        //             borderDash: [5, 7],
        //             label: {
        //                 content: "Dashed Line at 50",
        //                 position: "center",
        //                 display: true
        //             },
        //         },
        //         line2: {
        //             type: 'line',
        //             yMin: 200,
        //             yMax: 200,
        //             borderColor: 'rgb(220,38,38)',
        //             borderWidth: 2,
        //             borderDash: [5, 7]
        //         },
        //     }
        // }
    },
    maintainAspectRatio: false,
    scales: {
        x: {
            ticks: {
                display: false,
                // font: {
                //     size: 10
                // }
            }
        },
    },
    elements: {
        line: {
            lineTension: 0.3 // Increase for smoother curves
        }
    }
};

export default function GlucoseChart(props) {
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
        labels: glucose.map((dataElem) => ShortDateformat(dataElem.createdAt)),
        datasets: [
            {
                label: 'Glucose',
                data: glucose.map((dataElem) => dataElem.value),
                borderColor: 'rgb(8,145,178)',
                backgroundColor: 'rgb(207,250,254)',
            }
        ],
    };
    useEffect(() => {
        if (props.data && props.data.length > 0) {
            setGlucose(props.data.reverse())
        } else {
            getGlucose();
        }
    }, [props.data])

    return <Line options={options} data={data} />;
}
