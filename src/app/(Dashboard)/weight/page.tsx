"use client";
import React, { useEffect, useRef, useState } from "react";
import formatDate from "@/helpers/formatDate";
import notify from "@/helpers/notify";
import axios from "axios";
import Link from "next/link";
import WeightAdd from "@/components/DashboardInputs/WeightAdd";
import WeightChart from "@/components/Charts/WeightChart";
import PopUpModal from "@/components/PopUpModal";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import DataPeriodSelectCard from "@/components/DataPeriodSelectCard";
import { History, Edit, Trash2 } from "lucide-react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

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
    const [loading, setLoading] = useState(true);
    const [parent] = useAutoAnimate({ duration: 400 });

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
            } finally {
                setLoading(false);
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

    if (loading === true) {
        return <LoadingSkeleton />;
    }
    return (
        <section className="h-full flex justify-center items-center bg-background p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">
                <DataPeriodSelectCard
                    daysOfData={daysOfData}
                    changeDaysOfData={changeDaysOfData}
                    className="md:col-span-3"
                />
                <div className="mx-auto p-4 md:px-6 md:py-5 rounded-lg bg-white border border-purple-100 transition-all duration-300 shadow h-full w-full md:col-span-2 flex flex-col">
                    <h3 className="block p-0 text-lg font-semibold text-gray-900 mb-3">
                        Weight Trends
                    </h3>
                    <div className="h-72 flex-grow">
                        <WeightChart data={weightData} fetch={false} />
                    </div>
                </div>
                <div className="w-full">
                    <WeightAdd data={weightData} setData={setWeightData} />
                </div>
                <div className="border border-purple-100 transition-all duration-300 shadow p-4 md:px-6 rounded-lg md:col-span-3">
                    <div className="max-w-full overflow-x-auto rounded-lg">
                        <div className="flex items-center gap-3 text-lg font-semibold text-gray-900 mb-3">
                            <div
                                className={`p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600`}
                            >
                                <History className="h-4 w-4 text-white" />
                            </div>
                            Weight History
                        </div>
                        <div className="rounded-lg border border-purple-100 overflow-hidden w-full">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-[#5E4AE3] to-[#7C3AED] hover:from-[#5E4AE3] hover:to-[#7C3AED]">
                                        <TableHead className="text-white font-medium">
                                            Body Weight
                                        </TableHead>
                                        <TableHead className="text-white font-medium">
                                            DateTime
                                        </TableHead>
                                        <TableHead className="text-white font-medium">
                                            Tag
                                        </TableHead>
                                        <TableHead className="text-white font-medium text-center">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody ref={parent}>
                                    {weightData.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center py-8 text-gray-500"
                                            >
                                                No weight entries found for the
                                                selected period.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        weightData.map((entry, index) => (
                                            <TableRow
                                                key={entry.id}
                                                className={`hover:bg-purple-50 transition-colors ${
                                                    index % 2 === 0
                                                        ? "bg-white"
                                                        : "bg-gray-50/50"
                                                }`}
                                            >
                                                <TableCell className="font-medium text-gray-900">
                                                    {entry.value} kg
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {formatDate(
                                                        entry.createdAt
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 min-w-12 md:min-w-20 justify-center">
                                                        {entry.tag ?? "--"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link
                                                            href={`/weight/${entry._id}`}
                                                            className={
                                                                TdStyle.TdButton
                                                            }
                                                        >
                                                            <Edit className="h-5 w-5" />
                                                        </Link>
                                                        <PopUpModal
                                                            delete={() => {
                                                                deleteData(
                                                                    entry._id
                                                                );
                                                            }}
                                                            buttonContent={
                                                                <Trash2 className="h-5 w-5" />
                                                            }
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
