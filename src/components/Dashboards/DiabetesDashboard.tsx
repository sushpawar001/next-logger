"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { glucose, weight } from "@/types/models";
import WeightAdd from "@/components/DashboardInputs/WeightAdd";
import GlucoseChart from "@/components/Charts/GlucoseChart";
import WeightChart from "@/components/Charts/WeightChart";
import GlucoseAdd from "@/components/DashboardInputs/GlucoseAdd";
import InsulinAdd from "@/components/DashboardInputs/InsulinAdd";
import { InputFormCard } from "../DashboardInputs/InputFormCard";
import { Droplets, Weight, Syringe } from "lucide-react"

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
            <div className="w-full md:w-fit grid grid-cols-1 md:grid-cols-6 gap-3 md:gap-5">
                <div className="w-full md:col-span-3">
                    <div className="p-4 md:px-6 rounded-lg bg-white shadow">
                        <h3 className="block p-0 text-sm font-medium text-secondary mb-1">
                            Glucose history
                        </h3>
                        <div className="md:h-56">
                            <GlucoseChart data={glucoseData} fetch={false} />
                        </div>
                    </div>
                </div>
                <div className="w-full md:col-span-3">
                    <div className="h-full p-4 md:px-6 rounded-lg bg-white shadow">
                        <h3 className="block text-sm font-medium text-secondary mb-1">
                            Weight history
                        </h3>
                        <div className="md:h-56">
                            <WeightChart data={weightData} fetch={false} />
                        </div>
                    </div>
                </div>

                <div className="w-full md:col-span-2">
                    <div className="">
                        {/* <GlucoseAdd
                            data={glucoseData}
                            setData={setGlucoseData}
                        /> */}
                        <InputFormCard
                title="Blood Glucose"
                icon={Droplets}
                gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                fields={[
                  {
                    label: "Glucose Level",
                    type: "input",
                    placeholder: "98 mg/dl",
                    value: "98",
                  },
                  {
                    label: "Date & Time",
                    type: "datetime",
                    value: "2025-05-27T11:52",
                  },
                  {
                    label: "Measurement Type",
                    type: "select",
                    placeholder: "Select Type",
                    options: ["Fasting", "Post-meal", "Random", "Bedtime"],
                    value: "Fasting",
                  },
                ]}
              />
                    </div>
                </div>
                <div className="w-full md:col-span-2">
                    <div className="">
                        <InsulinAdd />
                    </div>
                </div>
                <div className="w-full md:col-span-2">
                    <div>
                        <WeightAdd data={weightData} setData={setWeightData} />
                    </div>
                </div>
            </div>
        </div>
    );
}
