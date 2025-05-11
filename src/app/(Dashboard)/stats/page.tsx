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

export default function Stats() {
    const [glucoseData, setGlucoseData] = useState<glucose[]>([]);
    const [glucoseDataOld, setGlucoseDataOld] = useState<glucose[]>([]);
    const [weightData, setWeightData] = useState<weight[]>([]);
    const [weightDataOld, setWeightDataOld] = useState<weight[]>([]);
    const [insulinData, setInsulinData] = useState<insulin[]>([]);
    const [daysOfData, setDaysOfData] = useState(7);
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

    const TdStyle = {
        // ThStyle: `w-1/6 min-w-[100px] border-l border-transparent px-3 py-2 text-base font-medium text-white lg:px-4`,
        ThStyle: `border-l border-transparent py-3 px-3 text-sm xl:text-base font-medium text-white lg:px-4 text-center`,
        // TdStyle2: `text-dark border border-[#E8E8E8] bg-white p-2 text-center font-normal text-base`,
        TdStyle2: `text-dark border border-[#E8E8E8] bg-white py-2 px-3 text-center font-normal text-sm xl:text-base`,
    };

    const changeDaysOfData = (event: { target: { value: string } }) => {
        const daysInput = event.target.value;
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
                    axios.get(`/api/weight/get-range/${daysOfData}/`),
                    axios.get(`/api/insulin/get/${daysOfData}/`),
                    axios.get(`/api/glucose/get-range/${daysOfData}/`),
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
        <div className="h-full flex justify-center items-center bg-background py-5 px-5 md:px-20">
            <div className="w-full md:w-fit grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                <div className="bg-white p-2 xl:p-4 shadow-md md:col-span-2 rounded-xl flex gap-1.5 lg:gap-3">
                    <select
                        id="daysOfDataInput"
                        value={daysOfData}
                        onChange={changeDaysOfData}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-ring focus:border-primary block w-3/5 lg:w-4/5 p-2.5"
                    >
                        <option defaultValue="7">7</option>
                        <option>14</option>
                        <option>30</option>
                        <option>90</option>
                        <option>365</option>
                        <option value={365 * 100}>All</option>
                    </select>
                    <Link
                        href="/charts"
                        className="inline-flex items-center px-1.5 md:px-3 py-2 text-xs md:text-sm font-medium text-center text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none w-2/5 lg:w-1/5 gap-2 justify-center"
                    >
                        <FaChartLine className="text-xl" />
                        See Charts
                    </Link>
                </div>
                <div className="bg-white shadow-md md:col-span-2 rounded-xl md:flex gap-1">
                    <div
                        className={`w-full md:w-1/4 p-2 xl:p-4 rounded-t-xl md:rounded-l-xl md:rounded-tr-none  ${
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

                    <div className="w-full md:w-3/4 m-auto p-3 xl:p-4 text-gray-500 flex gap-2.5">
                        <LuInfo className="m-auto text-xl" />
                        <p className="text-xs md:text-sm">
                            Estimated HbA1c is based on your average glucose
                            levels. Minimum 3 months of data required for better
                            estimates.
                        </p>
                    </div>
                </div>
                <GlucoseTile
                    TdStyle={TdStyle}
                    glucoseStats={glucoseStats}
                    glucoseStatsOld={glucoseStatsOld}
                />

                <WeightTile
                    TdStyle={TdStyle}
                    weightStats={weightStats}
                    weightStatsOld={weightStatsOld}
                />

                {insulinData.length > 0
                    ? Object.entries(insulinStats).map((data, index) => (
                          <InsulinTile
                              key={index}
                              TdStyle={TdStyle}
                              data={data}
                          />
                      ))
                    : ""}
            </div>
        </div>
    );
}

function GlucoseTile({
    TdStyle,
    glucoseStats,
    glucoseStatsOld,
}: {
    TdStyle: {
        ThStyle: string;
        TdStyle2: string;
    };
    glucoseStats: statsObjType;
    glucoseStatsOld: statsObjType;
}) {
    return (
        <div className="bg-white p-3 xl:p-6 shadow-md rounded-xl">
            <h2 className="mb-3 text-lg xl:text-xl font-medium text-gray-900">
                Glucose:
            </h2>
            <table className="table table-auto">
                <thead>
                    <tr className="bg-secondary">
                        <th className={`${TdStyle.ThStyle} rounded-tl-lg`}>
                            Param
                        </th>
                        <th className={`${TdStyle.ThStyle}`}>Previous</th>
                        <th className={`${TdStyle.ThStyle} rounded-tr-lg`}>
                            Current
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className={TdStyle.TdStyle2}>Mean:</td>
                        <td className={TdStyle.TdStyle2}>
                            {glucoseStatsOld.mean.toFixed(2)}
                        </td>
                        <td className={TdStyle.TdStyle2}>
                            {glucoseStats.mean < glucoseStatsOld.mean ? (
                                <span className="text-green-500 ml-2">
                                    {glucoseStats.mean.toFixed(2) + " ↓"}
                                </span>
                            ) : (
                                <span className="text-red-500 ml-2">
                                    {glucoseStats.mean.toFixed(2) + " ↑"}
                                </span>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td className={TdStyle.TdStyle2}>Median:</td>
                        <td className={TdStyle.TdStyle2}>
                            {glucoseStatsOld.median.toFixed(2)}
                        </td>
                        <td className={TdStyle.TdStyle2}>
                            {glucoseStats.median < glucoseStatsOld.median ? (
                                <span className="text-green-500 ml-2">
                                    {glucoseStats.median.toFixed(2) + " ↓"}
                                </span>
                            ) : (
                                <span className="text-red-500 ml-2">
                                    {glucoseStats.median.toFixed(2) + " ↑"}
                                </span>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td className={TdStyle.TdStyle2}>Mode:</td>
                        <td className={TdStyle.TdStyle2}>
                            {glucoseStatsOld.mode.length > 2
                                ? glucoseStatsOld.mode.slice(0, 2).toString() +
                                  "..."
                                : glucoseStatsOld.mode.toString()}
                        </td>
                        <td className={TdStyle.TdStyle2}>
                            {glucoseStats.mode.length > 2
                                ? glucoseStats.mode.slice(0, 2).toString() +
                                  "..."
                                : glucoseStats.mode.toString()}
                        </td>
                    </tr>
                    <tr>
                        <td className={TdStyle.TdStyle2}>Min:</td>
                        <td className={TdStyle.TdStyle2}>
                            {glucoseStatsOld.min}
                        </td>
                        <td className={TdStyle.TdStyle2}>
                            {glucoseStats.min < glucoseStatsOld.min ? (
                                <span className="text-green-500 ml-2">
                                    {glucoseStats.min.toFixed(2) + " ↓"}
                                </span>
                            ) : (
                                <span className="text-red-500 ml-2">
                                    {glucoseStats.min.toFixed(2) + " ↑"}
                                </span>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td className={TdStyle.TdStyle2}>Max:</td>
                        <td className={TdStyle.TdStyle2}>
                            {glucoseStatsOld.max}
                        </td>
                        <td className={TdStyle.TdStyle2}>
                            {glucoseStats.max < glucoseStatsOld.max ? (
                                <span className="text-green-500 ml-2">
                                    {glucoseStats.max.toFixed(2) + " ↓"}
                                </span>
                            ) : (
                                <span className="text-red-500 ml-2">
                                    {glucoseStats.max.toFixed(2) + " ↑"}
                                </span>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

function WeightTile({
    TdStyle,
    weightStats,
    weightStatsOld,
}: {
    TdStyle: {
        ThStyle: string;
        TdStyle2: string;
    };
    weightStats: statsObjType;
    weightStatsOld: statsObjType;
}) {
    return (
        <div className="bg-white p-3 xl:p-6 shadow-md rounded-xl">
            <h2 className="mb-3 text-lg xl:text-xl font-medium text-gray-900">
                Weight:
            </h2>
            <table className="table table-auto">
                <thead>
                    <tr className="bg-secondary">
                        <th className={`${TdStyle.ThStyle} rounded-tl-lg`}>
                            Param
                        </th>
                        <th className={`${TdStyle.ThStyle}`}>Previous</th>
                        <th className={`${TdStyle.ThStyle} rounded-tr-lg`}>
                            Current
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className={TdStyle.TdStyle2}>Mean:</td>
                        <td className={TdStyle.TdStyle2}>
                            {weightStatsOld.mean.toFixed(2)}
                        </td>
                        <td className={TdStyle.TdStyle2}>
                            {weightStats.mean < weightStatsOld.mean ? (
                                <span className="text-green-500 ml-2">
                                    {weightStats.mean.toFixed(2) + " ↓"}
                                </span>
                            ) : (
                                <span className="text-red-500 ml-2">
                                    {weightStats.mean.toFixed(2) + " ↑"}
                                </span>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td className={TdStyle.TdStyle2}>Median:</td>
                        <td className={TdStyle.TdStyle2}>
                            {weightStatsOld.median.toFixed(2)}
                        </td>
                        <td className={TdStyle.TdStyle2}>
                            {weightStats.median < weightStatsOld.median ? (
                                <span className="text-green-500 ml-2">
                                    {weightStats.median.toFixed(2) + " ↓"}
                                </span>
                            ) : (
                                <span className="text-red-500 ml-2">
                                    {weightStats.median.toFixed(2) + " ↑"}
                                </span>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td className={TdStyle.TdStyle2}>Mode:</td>
                        <td className={TdStyle.TdStyle2}>
                            {weightStatsOld.mode.length > 2
                                ? weightStatsOld.mode.slice(0, 2).toString() +
                                  "..."
                                : weightStatsOld.mode.toString()}
                        </td>
                        <td className={TdStyle.TdStyle2}>
                            {weightStats.mode.length > 2
                                ? weightStats.mode.slice(0, 2).toString() +
                                  "..."
                                : weightStats.mode.toString()}
                        </td>
                    </tr>
                    <tr>
                        <td className={TdStyle.TdStyle2}>Min:</td>
                        <td className={TdStyle.TdStyle2}>
                            {weightStatsOld.min}
                        </td>
                        <td className={TdStyle.TdStyle2}>
                            {weightStats.min < weightStatsOld.min ? (
                                <span className="text-green-500 ml-2">
                                    {weightStats.min.toFixed(2) + " ↓"}
                                </span>
                            ) : (
                                <span className="text-red-500 ml-2">
                                    {weightStats.min.toFixed(2) + " ↑"}
                                </span>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td className={TdStyle.TdStyle2}>Max:</td>
                        <td className={TdStyle.TdStyle2}>
                            {weightStatsOld.max}
                        </td>
                        <td className={TdStyle.TdStyle2}>
                            {weightStats.max < weightStatsOld.max ? (
                                <span className="text-green-500 ml-2">
                                    {weightStats.max.toFixed(2) + " ↓"}
                                </span>
                            ) : (
                                <span className="text-red-500 ml-2">
                                    {weightStats.max.toFixed(2) + " ↑"}
                                </span>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

function InsulinTile(props) {
    return (
        <div className="bg-white p-3 xl:p-6 shadow-md rounded-xl">
            <h2 className="mb-3 text-lg xl:text-xl font-medium text-gray-900">
                Insulin: {props.data[0]}
            </h2>
            <table className="table table-auto">
                <thead>
                    <tr className="bg-secondary">
                        <th
                            className={`${props.TdStyle.ThStyle} rounded-tl-lg`}
                        >
                            Param
                        </th>
                        <th
                            className={`${props.TdStyle.ThStyle} rounded-tr-lg`}
                        >
                            Value
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className={props.TdStyle.TdStyle2}>Mean:</td>
                        <td className={props.TdStyle.TdStyle2}>
                            {props.data[1].mean.toFixed(2)}
                        </td>
                    </tr>
                    <tr>
                        <td className={props.TdStyle.TdStyle2}>Median:</td>
                        <td className={props.TdStyle.TdStyle2}>
                            {props.data[1].median.toFixed(2)}
                        </td>
                    </tr>
                    <tr>
                        <td className={props.TdStyle.TdStyle2}>Mode:</td>
                        <td className={props.TdStyle.TdStyle2}>
                            {props.data[1].mode.toString()}
                        </td>
                    </tr>
                    <tr>
                        <td className={props.TdStyle.TdStyle2}>Min:</td>
                        <td className={props.TdStyle.TdStyle2}>
                            {props.data[1].min}
                        </td>
                    </tr>
                    <tr>
                        <td className={props.TdStyle.TdStyle2}>Max:</td>
                        <td className={props.TdStyle.TdStyle2}>
                            {props.data[1].max}
                        </td>
                    </tr>
                    <tr>
                        <td className={props.TdStyle.TdStyle2}>Daily Avg:</td>
                        <td className={props.TdStyle.TdStyle2}>
                            {props.data[1].dailyAvg.toFixed(2)}
                        </td>
                    </tr>
                    <tr>
                        <td className={props.TdStyle.TdStyle2}>Total:</td>
                        <td className={props.TdStyle.TdStyle2}>
                            {props.data[1].sum}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
