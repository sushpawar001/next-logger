"use client";
import React, { useEffect, useRef, useState } from "react";
import GlucoseAdd from "@/components/DashboardInputs/GlucoseAdd";
import GlucoseChart from "@/components/Charts/GlucoseChart";
import formatDate from "@/helpers/formatDate";
import notify from "@/helpers/notify";
import axios from "axios";
import Link from "next/link";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import PopUpModal from "@/components/PopUpModal";
import { Calendar } from "lucide-react";
const TdStyle = {
    ThStyle: `lg:min-w-[180px] border-l border-transparent py-3 px-3 text-base font-medium text-white lg:px-4`,
    TdStyle: `text-dark border-b border-l border-[#E8E8E8] bg-[#F3F6FF] py-2 px-3 text-center font-normal text-base`,
    TdStyle2: `text-dark border-b border-[#E8E8E8] bg-white py-2 px-3 text-center font-normal text-base`,
    TdButton: `inline-block px-4 py-1.5 border rounded-md border-primary text-primary hover:bg-primary hover:text-white font-normal text-base`,
    TdButton2: `inline-block px-3 py-1.5 border rounded-md border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-normal text-base`,
};

export default function GlucosePage() {
    const [glucoseData, setGlucoseData] = useState([]);
    const [daysOfData, setDaysOfData] = useState(7);
    const [loading, setLoading] = useState(true);
    const [parent] = useAutoAnimate({ duration: 400 });

    useEffect(() => {
        setLoading(true);
        const getGlucoseData = async () => {
            try {
                axios
                    .get(`/api/glucose/get/${daysOfData}/`)
                    .then((response) => {
                        if (response.status === 200) {
                            setGlucoseData(response.data.data);
                        } else {
                            console.error(
                                "API request failed with status:",
                                response.status
                            );
                        }
                    });
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        getGlucoseData();
    }, [daysOfData]);

    const changeDaysOfData = (event: { target: { value: string } }) => {
        const daysInput = event.target.value;
        setDaysOfData(parseInt(daysInput));
    };

    const deleteData = async (id) => {
        try {
            const deletedData = await axios.delete(`/api/glucose/delete/${id}`);
            let updatedData = glucoseData.filter((obj) => obj._id !== id);
            setGlucoseData(updatedData);
            notify("Glucose data deleted!", "success");
        } catch (error) {
            console.log(error);
        }
    };

    if (loading === true) {
        return <LoadingSkeleton />;
    }

    return (
        <section className="h-full flex justify-center items-center bg-background p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">
                <DataPeriodSelectCard
                    daysOfData={daysOfData}
                    changeDaysOfData={changeDaysOfData}
                    className="col-span-3"
                />
                <div className="mb-4 md:mb-6 mx-auto p-3 md:px-6 rounded-lg bg-white border border-purple-100 transition-all duration-300 shadow h-full w-full col-span-2">
                    <h3 className="block p-0 text-lg font-semibold text-gray-900 mb-3">
                        Glucose Trends
                    </h3>
                    <div className="h-72">
                        <GlucoseChart data={glucoseData} fetch={false} />
                    </div>
                </div>
                <div className="w-full">
                    <GlucoseAdd data={glucoseData} setData={setGlucoseData} />
                </div>
                <div className="bg-white p-4 rounded-lg shadow col-span-3">
                    <div className="flex flex-wrap ">
                        <div className="max-w-full overflow-x-auto rounded-lg">
                            <div className="mb-2 grid grid-cols-2">
                                <h3 className="my-auto ml-1 text-lg font-medium text-gray-900">
                                    Glucose History
                                </h3>
                            </div>
                            <table className="table-auto ">
                                <thead className="text-center bg-secondary">
                                    <tr>
                                        <th
                                            className={`${TdStyle.ThStyle} rounded-tl-lg`}
                                        >
                                            {" "}
                                            Blood Glucose{" "}
                                        </th>
                                        <th className={TdStyle.ThStyle}>
                                            {" "}
                                            DateTime{" "}
                                        </th>
                                        <th
                                            className={`${TdStyle.ThStyle} rounded-tr-lg`}
                                        >
                                            {" "}
                                            Action{" "}
                                        </th>
                                    </tr>
                                </thead>

                                <tbody ref={parent}>
                                    {glucoseData.map((obj) => {
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
                <div className="flex gap-2">
                    <Link href={`/glucose/${_id}`} className={TdStyle.TdButton}>
                        Edit
                    </Link>
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

export function DataPeriodSelectCard({
    daysOfData,
    changeDaysOfData,
    className = "",
}: {
    daysOfData: number;
    changeDaysOfData: (event: { target: { value: string } }) => void;
    className?: string;
}) {
    return (
        <div className={`bg-white p-4 rounded-lg border border-purple-100 transition-all duration-300 shadow flex items-center justify-between ${className}`}>
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#5E4AE3] to-[#7C3AED]">
                    <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Data Period</h3>
                    <p className="text-sm text-gray-500">
                        Select time range for analysis
                    </p>
                </div>
            </div>
            <select
                id="daysOfDataInput"
                value={daysOfData}
                onChange={changeDaysOfData}
                className="border text-gray-900 text-sm rounded-lg  block p-2.5 w-32 border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] outline-none"
            >
                <option defaultValue="7">7</option>
                <option>14</option>
                <option>30</option>
                <option>90</option>
                <option>365</option>
                <option value={365 * 100}>All</option>
            </select>
        </div>
    );
}
