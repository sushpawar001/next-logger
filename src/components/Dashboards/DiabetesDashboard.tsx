"use client";
import GlucoseChartRecharts from "@/components/Charts/RechartComponents/GlucoseChartRecharts";
import WeightChartRecharts from "@/components/Charts/RechartComponents/WeightChartRecharts";
import GlucoseAdd from "@/components/DashboardInputs/GlucoseAdd";
import InsulinAdd from "@/components/DashboardInputs/InsulinAdd";
import WeightAdd from "@/components/DashboardInputs/WeightAdd";
import { glucose, weight } from "@/types/models";
import { Loader2 } from "lucide-react";
import { useEntries } from "@/hooks/queries/useEntries";
import { EMPTY_ROWS } from "@/lib/query/keys";

const DAYS = 7;

export default function DiabetesDashboard() {
    // The same windows the /glucose and /weight pages default to, so navigating
    // between them costs no request.
    const glucoseQuery = useEntries<glucose>("glucose", DAYS);
    const weightQuery = useEntries<weight>("weight", DAYS);

    const glucoseData = glucoseQuery.data ?? (EMPTY_ROWS as glucose[]);
    const weightData = weightQuery.data ?? (EMPTY_ROWS as weight[]);

    return (
        <div className="h-full flex justify-center items-center py-5 px-5 md:px-10 bg-zinc-50">
            <div className="w-full md:w-fit grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5">
                <div className="w-full md:col-span-3">
                    <div className="p-3 md:px-6 rounded-lg bg-white border border-border transition-all duration-300 shadow-md">
                        <h3 className="block p-0 text-lg font-semibold text-gray-900 mb-3">
                            Glucose history
                        </h3>
                        <div className="h-44 md:h-56">
                            {glucoseQuery.isPending ? (
                                <div className="h-full flex flex-1 items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                                </div>
                            ) : (
                                <div className="h-full w-full">
                                    <GlucoseChartRecharts
                                        data={glucoseData.map((g) => ({
                                            value: g.value,
                                            createdAt:
                                                g.createdAt instanceof Date
                                                    ? g.createdAt.toISOString()
                                                    : g.createdAt || "",
                                        }))}
                                        fetch={false}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="w-full md:col-span-3">
                    <div className="h-full p-3 md:px-6 rounded-lg bg-white border border-border transition-all duration-300 shadow-md">
                        <h3 className="block p-0 text-lg font-semibold text-gray-900 mb-3">
                            Weight history
                        </h3>
                        <div className="h-44 md:h-56">
                            {weightQuery.isPending ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                                </div>
                            ) : (
                                <WeightChartRecharts
                                    data={weightData.map((w) => ({
                                        value: w.value,
                                        createdAt:
                                            w.createdAt instanceof Date
                                                ? w.createdAt.toISOString()
                                                : w.createdAt || "",
                                    }))}
                                    fetch={false}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="w-full md:col-span-2">
                    <GlucoseAdd />
                </div>
                <div className="w-full md:col-span-2">
                    <InsulinAdd />
                </div>
                <div className="w-full md:col-span-2">
                    <WeightAdd />
                </div>
            </div>
        </div>
    );
}
