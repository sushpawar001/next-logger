"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { mean, median, mode, min, max, sum } from "mathjs";
import { glucose, weight, insulin } from "@/types/models";
import { getDailyInsulinValues, getHba1cValue } from "@/helpers/statsHelpers";
import { FaChartLine, FaInfoCircle } from "react-icons/fa";
import { LuInfo } from "react-icons/lu";
import Link from "next/link";
import { set } from "mongoose";
import { ChartLine, Droplets } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BarChart3, TrendingUp } from "lucide-react";
import { StatsTableCard } from "@/components/StatsTableCard";

interface statsObjType {
    mean: number;
    median: number;
    mode: number[];
    min: number;
    max: number;
    sum?: number;
    dailyAvg?: number;
}
const statsObj = {
    mean: 0,
    median: 0,
    mode: [0],
    min: 0,
    max: 0,
};

const daysOfDataOptions = [
    { value: 7, label: "7 days" },
    { value: 14, label: "14 days" },
    { value: 30, label: "30 days" },
    { value: 90, label: "90 days" },
    { value: 365, label: "365 days" },
    { value: 365 * 100, label: "All" },
];
export default function Stats() {
    const [glucoseData, setGlucoseData] = useState<glucose[]>([]);
    const [glucoseDataOld, setGlucoseDataOld] = useState<glucose[]>([]);
    const [weightData, setWeightData] = useState<weight[]>([]);
    const [weightDataOld, setWeightDataOld] = useState<weight[]>([]);
    const [insulinData, setInsulinData] = useState<insulin[]>([]);
    const [daysOfData, setDaysOfData] = useState(90);
    const [isLoading, setIsLoading] = useState(false);
    const [glucoseStats, setGlucoseStats] = useState<statsObjType>(statsObj);
    const [estHbA1c, setEstHbA1c] = useState(0);
    const [riskLevel, setRiskLevel] = useState("normal");
    const [riskText, setRiskText] = useState("Normal");

    const [glucoseStatsOld, setGlucoseStatsOld] =
        useState<statsObjType>(statsObj);

    const [weightStats, setWeightStats] = useState<statsObjType>(statsObj);
    const [weightStatsOld, setWeightStatsOld] =
        useState<statsObjType>(statsObj);

    const [insulinStats, setInsulinStats] = useState<{
        [key: string]: statsObjType;
    }>({});

    const changeDaysOfData = (value: string) => {
        console.log(value);
        const daysInput = value;
        setDaysOfData(parseInt(daysInput));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [
                    WeightRangeDataResponse,
                    insulinResponse,
                    GlucoseRangeDataResponse,
                ] = await Promise.all([
                    axios.get(`/api/weight/get-range/${daysOfData}`),
                    axios.get(`/api/insulin/get/${daysOfData}`),
                    axios.get(`/api/glucose/get-range/${daysOfData}`),
                ]);

                if (GlucoseRangeDataResponse.status === 200) {
                    setGlucoseData(
                        GlucoseRangeDataResponse.data.data.daysAgoData
                    );
                    setGlucoseDataOld(
                        GlucoseRangeDataResponse.data.data.prevDaysAgoData
                    );
                } else {
                    console.error(
                        "Range API request failed with status:",
                        GlucoseRangeDataResponse.status
                    );
                }

                if (WeightRangeDataResponse.status === 200) {
                    setWeightData(
                        WeightRangeDataResponse.data.data.daysAgoData
                    );
                    setWeightDataOld(
                        WeightRangeDataResponse.data.data.prevDaysAgoData
                    );
                } else {
                    console.error(
                        "Weight API request failed with status:",
                        WeightRangeDataResponse.status
                    );
                }

                if (insulinResponse.status === 200) {
                    setInsulinData(insulinResponse.data.data);
                } else {
                    console.error(
                        "Weight API request failed with status:",
                        insulinResponse.status
                    );
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [daysOfData]);

    useEffect(() => {
        if (glucoseData.length > 0) {
            const glucoseArr = glucoseData.map((data) => data.value);

            setGlucoseStats({
                mean: mean(glucoseArr),
                median: median(glucoseArr),
                mode: mode(glucoseArr),
                min: min(glucoseArr),
                max: max(glucoseArr),
            });

            const hba1c = getHba1cValue(mean(glucoseArr));
            setEstHbA1c(hba1c);

            if (hba1c >= 8.5) {
                setRiskLevel("high");
                setRiskText("High Risk");
            } else if (hba1c >= 7) {
                setRiskLevel("moderate");
                setRiskText("Moderate Risk");
            }
        } else {
            setGlucoseStats(statsObj);
        }
    }, [glucoseData]);

    useEffect(() => {
        if (weightData.length > 0) {
            const weightArr = weightData.map((data) => data.value);

            setWeightStats({
                mean: mean(weightArr),
                median: median(weightArr),
                mode: mode(weightArr),
                min: min(weightArr),
                max: max(weightArr),
            });
        } else {
            setWeightStats(statsObj);
        }
    }, [weightData]);

    useEffect(() => {
        if (insulinData.length > 0) {
            const insulinsArrObj = {};
            insulinData.forEach((insulin) => {
                if (!(insulin.name in insulinsArrObj)) {
                    insulinsArrObj[insulin.name] = [];
                }
                insulinsArrObj[insulin.name].push(insulin.units);
            });
            const insulinsStatsObj = {};

            Object.keys(insulinsArrObj).forEach((key) => {
                const tempData = insulinData.filter(
                    (data) => data.name === key
                );
                const daily = getDailyInsulinValues(tempData);

                insulinsStatsObj[key] = {
                    mean: mean(insulinsArrObj[key]),
                    median: median(insulinsArrObj[key]),
                    mode: mode(insulinsArrObj[key]),
                    min: min(insulinsArrObj[key]),
                    max: max(insulinsArrObj[key]),
                    sum: sum(insulinsArrObj[key]),
                    dailyAvg: mean(daily),
                };
            });

            setInsulinStats(insulinsStatsObj);
        } else {
            setInsulinStats({});
        }
    }, [insulinData]);

    useEffect(() => {
        if (glucoseDataOld.length > 0) {
            const glucoseArr = glucoseDataOld.map((data) => data.value);

            setGlucoseStatsOld({
                mean: mean(glucoseArr),
                median: median(glucoseArr),
                mode: mode(glucoseArr),
                min: min(glucoseArr),
                max: max(glucoseArr),
            });
        } else {
            setGlucoseStatsOld(statsObj);
        }
    }, [glucoseDataOld]);

    useEffect(() => {
        if (weightDataOld.length > 0) {
            const weightArr = weightDataOld.map((data) => data.value);

            setWeightStatsOld({
                mean: mean(weightArr),
                median: median(weightArr),
                mode: mode(weightArr),
                min: min(weightArr),
                max: max(weightArr),
            });
        } else {
            setWeightStatsOld(statsObj);
        }
    }, [weightDataOld]);

    if (isLoading === true) {
        return (
            <div className="w-full h-full flex justify-center items-center font-bold text-secondary text-xl gap-2">
                <p>Loading</p>
                <span className="loading-dots loading size-10"></span>
            </div>
        );
    }

    return (
        <div className="h-full flex justify-center items-center bg-background py-5 px-5 lg:px-20">
            <div className="w-full lg:w-fit grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                <Card className="border-purple-100 shadow-md transition-all duration-300 lg:col-span-2">
                    <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-[#5E4AE3] to-[#7C3AED]">
                                    <BarChart3 className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-900">
                                        Analytics Overview
                                    </h1>
                                    <p className="text-gray-600 lg:mt-1 text-sm">
                                        Track your health metrics over time
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full lg:w-fit">
                                <Select
                                    value={daysOfData.toString()}
                                    onValueChange={changeDaysOfData}
                                >
                                    <SelectTrigger className="lg:w-32 border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {daysOfDataOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value.toString()}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Link href="/charts">
                                    <Button className="bg-gradient-to-r from-[#5E4AE3] to-[#7C3AED] hover:from-[#5E4AE3]/90 hover:to-[#7C3AED]/90 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:shadow-lg">
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        See Charts
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="bg-white border border-purple-100 transition-all duration-300 shadow-md lg:col-span-2 rounded-lg lg:flex gap-1">
                    <div
                        className={`w-full lg:w-fit p-2 xl:p-4 rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none  ${
                            riskLevel === "high"
                                ? "bg-red-50 text-red-900"
                                : riskLevel === "moderate"
                                ? "bg-amber-50 text-amber-900"
                                : "bg-green-50 text-green-900"
                        }`}
                    >
                        <div className="flex gap-2 font-semibold">
                            <h2 className="text-sm xl:text-base">
                                Estimated HbA1c
                            </h2>
                            <p
                                className={`text-xs my-auto px-3 py-0.5 rounded-full ${
                                    riskLevel === "high"
                                        ? "bg-red-100 text-red-900"
                                        : riskLevel === "moderate"
                                        ? "bg-amber-100 text-amber-900"
                                        : "bg-green-100 text-green-900"
                                }`}
                            >
                                {riskText}
                            </p>
                        </div>
                        <h2 className="text-xl xl:text-3xl font-bold ">
                            {estHbA1c}%
                        </h2>
                    </div>

                    <div className="w-full lg:w-3/4 m-auto p-3 xl:p-4 text-gray-600 flex gap-2.5">
                        <LuInfo className="m-auto text-xl" />
                        <p className="text-xs lg:text-sm">
                            Estimated HbA1c is based on your average glucose
                            levels. Minimum 3 months of data required for better
                            estimates.
                        </p>
                    </div>
                </div>
                <StatsTableCard
                    title="Glucose Statistics"
                    icon={Droplets}
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                    newData={glucoseStats}
                    oldData={glucoseDataOld.length > 0 ? glucoseStatsOld : null}
                />

                <StatsTableCard
                    title="Weight Statistics"
                    icon={Droplets}
                    gradient="bg-gradient-to-br from-orange-500 to-orange-600"
                    newData={weightStats}
                    oldData={weightDataOld.length > 0 ? weightStatsOld : null}
                />

                {insulinData.length > 0
                    ? Object.entries(insulinStats).map((data, index) => (
                          <StatsTableCard
                              key={data[0]}
                              title={`Insulin: ${data[0]}`}
                              icon={Droplets}
                              gradient="bg-gradient-to-br from-green-500 to-green-600"
                              newData={data[1]}
                          />
                      ))
                    : ""}
            </div>
        </div>
    );
}
