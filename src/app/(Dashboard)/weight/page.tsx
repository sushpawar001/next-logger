"use client";
import React, { useEffect, useRef, useState } from "react";
import formatDate from "@/helpers/formatDate";
import notify from "@/helpers/notify";
import axios from "axios";
import Link from "next/link";
import WeightAdd from "@/components/DashboardInputs/WeightAdd";
import WeightChart from "@/components/Charts/WeightChart";
import PopUpModal from "@/components/PopUpModal";

const TdStyle = {
    ThStyle: `border-l border-transparent py-3 px-3 text-sm xl:text-base font-medium text-white lg:px-4`,
    // ThStyle: `w-1/6 xl:min-w-[180px] border-l border-transparent py-3 px-3 text-base font-medium text-white lg:px-4`,
    TdStyle: `text-dark border-b border-l border-[#E8E8E8] bg-[#F3F6FF] py-2 px-3 text-center font-normal text-sm xl:text-base`,
    TdStyle2: `text-dark border-b border-[#E8E8E8] bg-white py-2 px-3 text-center font-normal text-sm xl:text-base`,
    TdButton: `inline-block px-4 py-1.5 border rounded-md border-primary text-primary hover:bg-primary hover:text-white font-normal text-sm xl:text-base`,
    TdButton2: `inline-block px-3 py-1.5 border rounded-md border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-normal text-sm xl:text-base`,
};

export default function WeightPage() {
    const [weightData, setWeightData] = useState([]);
    const [daysOfData, setDaysOfData] = useState(7);

    useEffect(() => {
        const getWeightData = async () => {
            try {
                const response = await axios.get(
                    `/api/weight/get/${daysOfData}/`
                );
                if (response.status === 200) {
                    setWeightData(response.data.data);
                } else {
                    console.error(
                        "API request failed with status:",
                        response.status
                    );
                }
            } catch (error) {
                console.log(error);
            }
        };
        getWeightData();
    }, [daysOfData]);

    const changeDaysOfData = (event) => {
        const daysInput = event.target.value;
        setDaysOfData(daysInput);
    };

    const deleteData = async (id) => {
        try {
            const deletedData = await axios.delete(`/api/weight/delete/${id}`);
            let updatedData = weightData.filter((obj) => obj._id !== id);
            setWeightData(updatedData);
            notify("Weight data deleted!", "success");
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <section className="h-full flex justify-center items-center bg-background p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white p-4 rounded-xl shadow order-1 md:order-first">
                    <div className="flex flex-wrap">
                        <div className="w-full overflow-x-auto rounded-xl">
                            <div className="mb-2 grid grid-cols-2">
                                <h3 className="my-auto ml-1 text-lg font-medium text-gray-900">
                                    Weight History
                                </h3>
                                <select
                                    id="daysOfDataInput"
                                    value={daysOfData}
                                    onChange={changeDaysOfData}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-ring focus:border-primary-ring block w-full p-2.5"
                                >
                                    <option defaultValue="7">7</option>
                                    <option>14</option>
                                    <option>30</option>
                                    <option>90</option>
                                    <option>365</option>
                                    <option value={365 * 100}>All</option>
                                </select>
                            </div>
                            <div className="max-h-96 overflow-y-auto w-full">
                                <table className="table-auto w-full">
                                    <thead className="text-center bg-secondary sticky top-0 z-10">
                                        <tr>
                                            <th
                                                className={`${TdStyle.ThStyle} rounded-tl-lg`}
                                            >
                                                Weight
                                            </th>
                                            <th className={TdStyle.ThStyle}>
                                                DateTime
                                            </th>
                                            <th
                                                className={`${TdStyle.ThStyle} rounded-tr-lg`}
                                            >
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {weightData.map((obj) => {
                                            return (
                                                <TableRow
                                                    key={obj._id}
                                                    data={obj}
                                                    delete={deleteData}
                                                />
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="mb-4 md:mb-6 mx-auto px-10 py-5 rounded-md bg-white shadow h-72">
                        <WeightChart data={weightData} fetch={false} />
                    </div>
                    <WeightAdd data={weightData} setData={setWeightData} />
                </div>
            </div>
        </section>
    );
}

function TableRow(props) {
    const { value, createdAt, _id } = props.data;
    return (
        <tr>
            <td className={TdStyle.TdStyle}>{value}</td>
            <td className={TdStyle.TdStyle2}>{formatDate(createdAt)}</td>
            <td className={TdStyle.TdStyle}>
                <div className="flex gap-2 justify-center items-center">
                    <Link href={`/weight/${_id}`} className={TdStyle.TdButton}>
                        Edit
                    </Link>
                    {/* <button className={TdStyle.TdButton2} onClick={() => { props.delete(_id) }}>Delete</button> */}
                    <PopUpModal
                        delete={() => {
                            props.delete(_id);
                        }}
                    />
                </div>
            </td>
        </tr>
    );
}
