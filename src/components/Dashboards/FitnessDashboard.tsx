"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import WeightAdd from "../DashboardInputs/WeightAdd";
import MeasurementAdd from "../DashboardInputs/MeasurementAdd";
import MeasurementChartNew from "../Charts/MeasurementChartNew";
import WeightChart from "../Charts/WeightChart";
import type { measurement, weight } from "@/types/models";

export default function FitnessDashboard() {
    const [weightData, setWeightData] = useState<weight[]>([]);
    const [measurementData, setMeasurementData] = useState<measurement[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [measurementResponse, weightResponse] = await Promise.all(
                    [
                        axios.get(`/api/measurements/get/7/`),
                        axios.get(`/api/weight/get/7/`),
                    ]
                );

                if (measurementResponse.status === 200) {
                    setMeasurementData(measurementResponse.data.data);
                } else {
                    console.error(
                        "measurement API request failed with status:",
                        measurementResponse.status
                    );
                }

                if (weightResponse.status === 200) {
                    setWeightData(weightResponse.data.data);
                } else {
                    console.error(
                        "Weight API request failed with status:",
                        weightResponse.status
                    );
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            <div className="h-full bg-background py-5 px-5">
                <div className="flex flex-col max-w-screen-xl mx-auto h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 h-full">
                        <div className="col-span-2 rounded h-full flex flex-col gap-4">
                            <div className="p-4 md:px-6 rounded-xl bg-white shadow-md h-1/2 flex flex-col">
                                <h3 className="block mb-1 p-0 text-sm font-medium text-secondary">
                                    Weight history
                                </h3>
                                <div className="flex-grow">
                                    <WeightChart
                                        data={weightData}
                                        fetch={false}
                                    />
                                </div>
                            </div>
                            <div className="p-4 md:px-6 rounded-xl bg-white shadow-md h-1/2 flex flex-col">
                                <h3 className="block p-0 mb-1 text-sm font-medium text-secondary">
                                    Measurement history
                                </h3>
                                <div className="flex-grow">
                                    <MeasurementChartNew
                                        data={measurementData}
                                        fetch={false}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-span-1 rounded gap-4 flex flex-col">
                            <div className="">
                                <WeightAdd
                                    data={weightData}
                                    setData={setWeightData}
                                />
                            </div>
                            <MeasurementAdd
                                data={measurementData}
                                setData={setMeasurementData}
                                className="flex-grow"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
