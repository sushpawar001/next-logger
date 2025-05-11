"use client";
import AdvGlucoseChart from "@/components/Charts/AdvGlucoseChart";
import AdvInsulinChartSeparate from "@/components/Charts/AdvInsulinChartSeparate";
import AdvWeightChart from "@/components/Charts/AdvWeightChart";
import React, { useEffect, useRef, useState } from "react";

export default function ChartPage() {
    const [daysOfData, setDaysOfData] = useState(365);
    const changeDaysOfData = (event: { target: { value: string } }) => {
        const daysInput = event.target.value;
        setDaysOfData(parseInt(daysInput));
    };
    return (
        <div className="h-full bg-background py-5 px-5">
            <div className="flex flex-col max-w-screen-xl mx-auto h-full">
                <div className="grid md:grid-cols-2 gap-3 md:gap-5 h-full">
                    <div className="md:col-span-2 w-full flex gap-4">
                        <div className="md:w-3/5 rounded-xl flex flex-col gap-0.5 bg-white shadow-md p-2.5">
                            <h2 className="font-bold text-gray-900 my-auto text-xl">
                                Analytics Overview
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Track your health metrics over time
                            </p>
                        </div>
                        <div className="md:w-2/5 rounded-xl flex gap-4 bg-white shadow-md p-2.5">
                            <label className="my-auto ml-1 font-medium text-gray-900 w-2/5">
                                Select Duration
                            </label>
                            <select
                                id="daysOfDataInput"
                                value={daysOfData}
                                onChange={changeDaysOfData}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-ring focus:border-primary block p-2.5 w-3/5"
                            >
                                <option defaultValue="7">7</option>
                                <option>14</option>
                                <option>30</option>
                                <option>90</option>
                                <option>365</option>
                                <option value={365 * 100}>All</option>
                            </select>
                        </div>
                    </div>
                    <div className="md:col-span-2 w-full p-2.5 md:p-5 rounded-xl bg-white shadow-md h-96">
                        <AdvWeightChart fetch={true} days={daysOfData} />
                    </div>
                    <div className="md:col-span-2 w-full p-2.5 md:p-5 rounded-xl bg-white shadow-md h-96">
                        <AdvInsulinChartSeparate
                            fetch={true}
                            days={daysOfData}
                        />
                    </div>
                    <div className="md:col-span-2 w-full p-2.5 md:p-5 rounded-xl bg-white shadow-md h-96">
                        <AdvGlucoseChart fetch={true} days={daysOfData} />
                    </div>
                </div>
            </div>
        </div>
    );
}
