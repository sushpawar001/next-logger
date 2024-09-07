"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { glucose, weight } from "@/types/models";
import WeightAdd from "@/components/DashboardInputs/WeightAdd";
import GlucoseChart from "@/components/Charts/GlucoseChart";
import WeightChart from "@/components/Charts/WeightChart";
import GlucoseAdd from "@/components/DashboardInputs/GlucoseAdd";
import InsulinAdd from "@/components/DashboardInputs/InsulinAdd";

export default function DiabetesDashboard() {
    const [glucoseData, setGlucoseData] = useState<glucose[]>([]);
    const [weightData, setWeightData] = useState<weight[]>([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [glucoseResponse, weightResponse] = await Promise.all([
                    axios.get(`/api/glucose/get/7/`),
                    axios.get(`/api/weight/get/7/`),
                ]);

                if (glucoseResponse.status === 200) {
                    setGlucoseData(glucoseResponse.data.data);
                } else {
                    console.error(
                        "Glucose API request failed with status:",
                        glucoseResponse.status
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
        <div className="h-full flex justify-center items-center bg-background py-5 px-5 md:px-20">
            <div className="w-full md:w-fit grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                <div className="col-span-1">
                    <div className="w-full">
                        <div className="mb-3 md:mb-5 mx-auto p-4 md:px-6 rounded-xl bg-white shadow-md">
                            <h3 className="block p-0 text-sm font-medium text-secondary">
                                Glucose history
                            </h3>
                            <div className="h-full">
                                <GlucoseChart
                                    data={glucoseData}
                                    fetch={false}
                                />
                            </div>
                        </div>
                        <div className="h-full mx-auto p-4 md:px-6 rounded-xl bg-white shadow-md">
                            <h3 className="block text-sm font-medium text-secondary">
                                Weight history
                            </h3>
                            <div>
                                <WeightChart data={weightData} fetch={false} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-span-1">
                    <div className="w-full">
                        <div className="mb-4 md:mb-6">
                            <GlucoseAdd
                                data={glucoseData}
                                setData={setGlucoseData}
                            />
                        </div>
                        <div className="mb-4 md:mb-6">
                            <InsulinAdd />
                        </div>
                        <div>
                            <WeightAdd
                                data={weightData}
                                setData={setWeightData}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
