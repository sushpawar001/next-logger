"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { mean, median, mode, min, max, sum } from "mathjs";
import { glucose, weight, insulin } from "@/types/models";

interface statsObjType {
    mean: number;
    median: number;
    mode: number[];
    min: number;
    max: number;
    sum?: number;
}

export default function Stats() {
    const [glucoseData, setGlucoseData] = useState<glucose[]>([]);
    const [weightData, setWeightData] = useState<weight[]>([]);
    const [insulinData, setInsulinData] = useState<insulin[]>([]);
    const [daysOfData, setDaysOfData] = useState(7);
    const [glucoseStats, setGlucoseStats] = useState<statsObjType>({
        mean: 0,
        median: 0,
        mode: [0],
        min: 0,
        max: 0,
    });

    const [weighteStats, setWeightStats] = useState<statsObjType>({
        mean: 0,
        median: 0,
        mode: [0],
        min: 0,
        max: 0,
    });

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
                const [glucoseResponse, weightResponse, insulinResponse] =
                    await Promise.all([
                        axios.get(`/api/glucose/get/${daysOfData}/`),
                        axios.get(`/api/weight/get/${daysOfData}/`),
                        axios.get(`/api/insulin/get/${daysOfData}/`),
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
        } else {
            setGlucoseStats({
                mean: 0,
                median: 0,
                mode: [0],
                min: 0,
                max: 0,
            });
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
            setWeightStats({
                mean: 0,
                median: 0,
                mode: [0],
                min: 0,
                max: 0,
            });
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
                insulinsStatsObj[key] = {
                    mean: mean(insulinsArrObj[key]),
                    median: median(insulinsArrObj[key]),
                    mode: mode(insulinsArrObj[key]),
                    min: min(insulinsArrObj[key]),
                    max: max(insulinsArrObj[key]),
                    sum: sum(insulinsArrObj[key]),
                };
            });

            setInsulinStats(insulinsStatsObj);
        } else {
            setInsulinStats({});
        }
    }, [insulinData]);

    return (
        <div className="h-full flex justify-center items-center bg-background py-5 px-5 md:px-20">
            <div className="w-full md:w-fit grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                <div className="bg-white p-2 xl:p-4 shadow-md md:col-span-2 rounded-xl">
                    <select
                        id="daysOfDataInput"
                        value={daysOfData}
                        onChange={changeDaysOfData}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-ring focus:border-primary block w-full p-2.5"
                    >
                        <option defaultValue="7">7</option>
                        <option>14</option>
                        <option>30</option>
                        <option>90</option>
                        <option>365</option>
                        <option value={365 * 100}>All</option>
                    </select>
                </div>
                <div className="bg-white p-3 xl:p-6 shadow-md rounded-xl">
                    <h2 className="mb-3 text-lg xl:text-xl font-medium text-gray-900">
                        Glucose:
                    </h2>
                    <table className="table table-auto">
                        <thead>
                            <tr className="bg-secondary">
                                <th
                                    className={`${TdStyle.ThStyle} rounded-tl-lg`}
                                >
                                    Param
                                </th>
                                <th
                                    className={`${TdStyle.ThStyle} rounded-tr-lg`}
                                >
                                    Value
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className={TdStyle.TdStyle2}>Mean:</td>
                                <td className={TdStyle.TdStyle2}>
                                    {glucoseStats.mean.toFixed(2)}
                                </td>
                            </tr>
                            <tr>
                                <td className={TdStyle.TdStyle2}>Median:</td>
                                <td className={TdStyle.TdStyle2}>
                                    {glucoseStats.median.toFixed(2)}
                                </td>
                            </tr>
                            <tr>
                                <td className={TdStyle.TdStyle2}>Mode:</td>
                                <td className={TdStyle.TdStyle2}>
                                    {glucoseStats.mode.toString()}
                                </td>
                            </tr>
                            <tr>
                                <td className={TdStyle.TdStyle2}>Min:</td>
                                <td className={TdStyle.TdStyle2}>
                                    {glucoseStats.min}
                                </td>
                            </tr>
                            <tr>
                                <td className={TdStyle.TdStyle2}>Max:</td>
                                <td className={TdStyle.TdStyle2}>
                                    {glucoseStats.max}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="bg-white p-3 xl:p-6 shadow-md rounded-xl">
                    <h2 className="mb-3 text-lg xl:text-xl font-medium text-gray-900">
                        Weight:
                    </h2>
                    <table className="table table-auto">
                        <thead>
                            <tr className="bg-secondary">
                                <th
                                    className={`${TdStyle.ThStyle} rounded-tl-lg`}
                                >
                                    Param
                                </th>
                                <th
                                    className={`${TdStyle.ThStyle} rounded-tr-lg`}
                                >
                                    Value
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className={TdStyle.TdStyle2}>Mean:</td>
                                <td className={TdStyle.TdStyle2}>
                                    {weighteStats.mean.toFixed(2)}
                                </td>
                            </tr>
                            <tr>
                                <td className={TdStyle.TdStyle2}>Median:</td>
                                <td className={TdStyle.TdStyle2}>
                                    {weighteStats.median.toFixed(2)}
                                </td>
                            </tr>
                            <tr>
                                <td className={TdStyle.TdStyle2}>Mode:</td>
                                <td className={TdStyle.TdStyle2}>
                                    {weighteStats.mode.toString()}
                                </td>
                            </tr>
                            <tr>
                                <td className={TdStyle.TdStyle2}>Min:</td>
                                <td className={TdStyle.TdStyle2}>
                                    {weighteStats.min}
                                </td>
                            </tr>
                            <tr>
                                <td className={TdStyle.TdStyle2}>Max:</td>
                                <td className={TdStyle.TdStyle2}>
                                    {weighteStats.max}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {insulinData.length > 0
                    ? Object.entries(insulinStats).map((data, index) => (
                          <div
                              className="bg-white p-3 xl:p-6 shadow-md rounded-xl"
                              key={index}
                          >
                              <h2 className="mb-3 text-lg xl:text-xl font-medium text-gray-900">
                                  Insulin: {data[0]}
                              </h2>
                              <table className="table table-auto">
                                  <thead>
                                      <tr className="bg-secondary">
                                          <th
                                              className={`${TdStyle.ThStyle} rounded-tl-lg`}
                                          >
                                              Param
                                          </th>
                                          <th
                                              className={`${TdStyle.ThStyle} rounded-tr-lg`}
                                          >
                                              Value
                                          </th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      <tr>
                                          <td className={TdStyle.TdStyle2}>
                                              Mean:
                                          </td>
                                          <td className={TdStyle.TdStyle2}>
                                              {data[1].mean.toFixed(2)}
                                          </td>
                                      </tr>
                                      <tr>
                                          <td className={TdStyle.TdStyle2}>
                                              Median:
                                          </td>
                                          <td className={TdStyle.TdStyle2}>
                                              {data[1].median.toFixed(2)}
                                          </td>
                                      </tr>
                                      <tr>
                                          <td className={TdStyle.TdStyle2}>
                                              Mode:
                                          </td>
                                          <td className={TdStyle.TdStyle2}>
                                              {data[1].mode.toString()}
                                          </td>
                                      </tr>
                                      <tr>
                                          <td className={TdStyle.TdStyle2}>
                                              Min:
                                          </td>
                                          <td className={TdStyle.TdStyle2}>
                                              {data[1].min}
                                          </td>
                                      </tr>
                                      <tr>
                                          <td className={TdStyle.TdStyle2}>
                                              Max:
                                          </td>
                                          <td className={TdStyle.TdStyle2}>
                                              {data[1].max}
                                          </td>
                                      </tr>
                                      <tr>
                                          <td className={TdStyle.TdStyle2}>
                                              Total:
                                          </td>
                                          <td className={TdStyle.TdStyle2}>
                                              {data[1].sum}
                                          </td>
                                      </tr>
                                  </tbody>
                              </table>
                          </div>
                      ))
                    : ""}
            </div>
        </div>
    );
}
