"use client";
import GlucoseChart from "@/components/Charts/GlucoseChart";
import WeightChart from "@/components/Charts/WeightChart";
import GlucoseAdd from "@/components/DashboardInputs/GlucoseAdd";
import InsulinAdd from "@/components/DashboardInputs/InsulinAdd";
import WeightAdd from "@/components/DashboardInputs/WeightAdd";
import { glucose, weight } from "@/types/models";
import axios from "axios";
import { useEffect, useState } from "react";

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
        <div className="h-full flex justify-center items-center py-5 px-5 md:px-10">
            <div className="w-full md:w-fit grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5">
                <div className="w-full md:col-span-3">
                    <div className="p-3 md:px-6 rounded-lg bg-white border border-purple-100 transition-all duration-300 shadow">
                        <h3 className="block p-0 text-lg font-semibold text-gray-900 mb-3">
                            Glucose history
                        </h3>
                        <div className="md:h-56">
                            <GlucoseChart data={glucoseData} fetch={false} />
                        </div>
                    </div>
                </div>
                <div className="w-full md:col-span-3">
                    <div className="h-full p-3 md:px-6 rounded-lg bg-white border border-purple-100 transition-all duration-300 shadow">
                        <h3 className="block p-0 text-lg font-semibold text-gray-900 mb-3">
                            Weight history
                        </h3>
                        <div className="md:h-56">
                            <WeightChart data={weightData} fetch={false} />
                        </div>
                    </div>
                </div>

                <div className="w-full md:col-span-2">
                    <GlucoseAdd data={glucoseData} setData={setGlucoseData} />
                </div>
                <div className="w-full md:col-span-2">
                    <InsulinAdd />
                </div>
                <div className="w-full md:col-span-2">
                    <WeightAdd data={weightData} setData={setWeightData} />
                </div>
            </div>
        </div>
    );
}
