"use client";
import React from "react";
import { Loader2 } from "lucide-react";
import WeightAdd from "../DashboardInputs/WeightAdd";
import MeasurementAdd from "../DashboardInputs/MeasurementAdd";
import MeasurementChartNew from "../Charts/MeasurementChartNew";
import WeightChart from "../Charts/WeightChart";
import type { measurement, weight } from "@/types/models";
import { useEntries } from "@/hooks/queries/useEntries";
import { EMPTY_ROWS } from "@/lib/query/keys";

const DAYS = 7;

export default function FitnessDashboard() {
    // Shares the weight window with DiabetesDashboard and /weight.
    const weightQuery = useEntries<weight>("weight", DAYS);
    const measurementQuery = useEntries<measurement>("measurements", DAYS);

    const weightData = weightQuery.data ?? (EMPTY_ROWS as weight[]);
    const measurementData = measurementQuery.data ?? (EMPTY_ROWS as measurement[]);

    return (
        <>
            <div className="h-full bg-background py-5 px-5">
                <div className="flex flex-col max-w-screen-xl mx-auto h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 h-full">
                        <div className="col-span-2 rounded h-full flex flex-col gap-4">
                            <div className="p-4 md:px-6 rounded-lg bg-white shadow-md h-1/2 flex flex-col">
                                <h3 className="block mb-1 p-0 text-sm font-medium text-secondary">
                                    Weight history
                                </h3>
                                <div className="grow">
                                    {weightQuery.isPending ? (
                                        <div className="h-full flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                                        </div>
                                    ) : (
                                        <WeightChart
                                            data={weightData}
                                            fetch={false}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="p-4 md:px-6 rounded-lg bg-white shadow-md h-1/2 flex flex-col">
                                <h3 className="block p-0 mb-1 text-sm font-medium text-secondary">
                                    Measurement history
                                </h3>
                                <div className="grow">
                                    {measurementQuery.isPending ? (
                                        <div className="h-full flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                                        </div>
                                    ) : (
                                        <MeasurementChartNew
                                            data={measurementData}
                                            fetch={false}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="col-span-1 rounded gap-4 flex flex-col">
                            <div className="">
                                <WeightAdd />
                            </div>
                            <MeasurementAdd className="grow" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
