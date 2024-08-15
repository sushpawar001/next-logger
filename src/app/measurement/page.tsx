"use client";
import MeasurementAdd from "@/components/MeasurementAdd";
import React, { useEffect, useRef, useState } from "react";
import notify from "@/helpers/notify";
import axios from "axios";
import { motion } from "framer-motion";
import formatDate from "@/helpers/formatDate";
import Link from "next/link";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import CombinedMeasurementChart from "@/components/MeasurementChart";
import MeasurementPageSkeleton from "@/components/MeasurementPageSkeleton";


const dataInputs = [
    "Arms",
    "Chest",
    "Abdomen",
    "Waist",
    "Hip",
    "Thighs",
    "Calves",
];

const TdStyle = {
    ThStyle: `w-1/6 lg:min-w-[180px] border-l border-transparent py-3 px-3 text-base font-medium text-white lg:px-4`,
    ThStyleNew: `md:w-[1/9] border-l border-transparent py-1 px-2 md:py-3 md:px-3 text-base font-medium text-white lg:px-4`,
    TdStyle: `text-dark border-b border-l border-[#E8E8E8] bg-[#F3F6FF] py-1 px-2 md:py-2 md:px-3 text-center font-normal text-base`,
    TdStyle2: `text-dark border-b border-[#E8E8E8] bg-white py-1 px-2 md:py-2 md:px-3 text-center font-normal text-base`,
    TdButton: `inline-block px-4 py-1.5 border rounded-md border-primary text-primary hover:bg-primary hover:text-white font-normal text-base`,
    TdButton2: `inline-block px-3 py-1.5 border rounded-md border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-normal text-base`,
};

export default function MeasurementsPage() {
    const [measurementData, setMeasurementData] = useState([]);
    const [daysOfData, setDaysOfData] = useState(7);
    const [loading, setLoading] = useState(true);
    const [parent] = useAutoAnimate({ duration: 500 });

    useEffect(() => {
        setLoading(true);
        const getMeasurementData = async () => {
            try {
                axios
                    .get(`/api/measurements/get/${daysOfData}/`)
                    .then((response) => {
                        if (response.status === 200) {
                            setMeasurementData(response.data.data);
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
        getMeasurementData();
    }, [daysOfData]);

    const changeDaysOfData = (event: { target: { value: string } }) => {
        const daysInput = event.target.value;
        setDaysOfData(parseInt(daysInput));
    };

    const deleteData = async (id) => {
        try {
            const deletedData = await axios.delete(
                `/api/measurements/delete/${id}`
            );
            let updatedData = measurementData.filter((obj) => obj._id !== id);
            setMeasurementData(updatedData);
            notify("Measurements data deleted!", "success");
        } catch (error) {
            console.log(error);
        }
    };

    if (loading === true) {
        return <MeasurementPageSkeleton />;
    }
    return (
        // <div className="h-full flex justify-center items-center bg-background py-5 px-5 md:px-20">
        <div className="h-full bg-background py-5 px-5">
            <div className="flex flex-col max-w-screen-xl mx-auto">
                <div className="grid md:grid-cols-3 mb-5 gap-5">
                    <MeasurementAdd
                        data={measurementData}
                        setData={setMeasurementData}
                        className="order-2 md:order-1"
                    />
                    <CombinedMeasurementChart
                        data={measurementData}
                        className="col-span-1 md:col-span-2 max-w-full p-5 min-h-96 md:min-h-0 order-1 md:order-2"
                    />
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md">
                    <div className="flex flex-wrap">
                        <div className="max-w-full w-full overflow-x-auto rounded-lg">
                            <div className="mb-2 grid grid-cols-2">
                                <h3 className="my-auto ml-1 text-lg font-medium text-gray-900">
                                    Measurement History
                                </h3>
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
                            <div className="max-h-96 overflow-y-auto">
                                <table className="table-auto w-full">
                                    <thead className="text-center bg-secondary sticky top-0 z-10">
                                        <tr>
                                            <th
                                                className={`${TdStyle.ThStyleNew} rounded-tl-lg`}
                                            >
                                                {dataInputs[0]}
                                            </th>
                                            {dataInputs.slice(1).map((obj) => {
                                                return (
                                                    <th
                                                        className={
                                                            TdStyle.ThStyleNew
                                                        }
                                                        key={obj}
                                                    >
                                                        {obj}
                                                    </th>
                                                );
                                            })}
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
                                        {measurementData.map((obj) => {
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
            </div>
        </div>
    );
}

function TableRow(props) {
    const { arms, chest, abdomen, waist, hip, thighs, calves, createdAt, _id } =
        props.data;
    return (
        <tr>
            <td className={TdStyle.TdStyle}>{arms}</td>
            <td className={TdStyle.TdStyle2}>{chest}</td>
            <td className={TdStyle.TdStyle}>{abdomen}</td>
            <td className={TdStyle.TdStyle2}>{waist}</td>
            <td className={TdStyle.TdStyle}>{hip}</td>
            <td className={TdStyle.TdStyle2}>{thighs}</td>
            <td className={TdStyle.TdStyle}>{calves}</td>
            <td className={TdStyle.TdStyle2}>{formatDate(createdAt)}</td>
            <td className={TdStyle.TdStyle}>
                <div className="flex gap-2">
                    <Link
                        href={`/measurement/${_id}`}
                        className={TdStyle.TdButton}
                    >
                        Edit
                    </Link>
                    <Modal
                        delete={() => {
                            props.delete(_id);
                        }}
                    />
                </div>
            </td>
        </tr>
    );
}

function Modal(props: { delete: () => void }) {
    const [modalOpen, setModalOpen] = useState(false);
    const trigger = useRef(null);
    const modal = useRef(null);

    const variants = {
        open: { opacity: 1, scale: 1 },
        closed: { opacity: 0, scale: 0.6 },
    };

    // close on click outside
    useEffect(() => {
        const clickHandler = ({ target }) => {
            if (!modal.current) return;
            if (
                !modalOpen ||
                modal.current.contains(target) ||
                trigger.current.contains(target)
            )
                return;
            setModalOpen(false);
        };
        document.addEventListener("click", clickHandler);
        return () => document.removeEventListener("click", clickHandler);
    });

    // close if the esc key is pressed
    useEffect(() => {
        const keyHandler = ({ keyCode }) => {
            if (!modalOpen || keyCode !== 27) return;
            setModalOpen(false);
        };
        document.addEventListener("keydown", keyHandler);
        return () => document.removeEventListener("keydown", keyHandler);
    });

    return (
        <>
            <button
                ref={trigger}
                onClick={() => setModalOpen(true)}
                className={TdStyle.TdButton2}
            >
                Delete
            </button>
            {/* modal  */}
            <div
                className={`fixed left-0 top-0 flex h-full min-h-screen w-full items-center justify-center bg-dark/90 px-4 py-5 ${
                    modalOpen ? "block" : "hidden"
                }`}
            >
                <motion.div
                    animate={modalOpen ? "open" : "closed"}
                    variants={variants}
                    transition={{
                        type: "spring",
                        duration: 0.3,
                        stiffness: 100,
                    }}
                    ref={modal}
                    onFocus={() => setModalOpen(true)}
                    onBlur={() => setModalOpen(false)}
                    className="w-full max-w-[500px] rounded-[20px] bg-white px-8 py-12 text-center md:px-[70px] md:py-[60px]"
                >
                    <h3 className="pb-[18px] text-xl font-semibold text-secondary dark:text-white sm:text-2xl">
                        Do you really want to delete this?
                    </h3>
                    <span
                        className={`mx-auto mb-6 inline-block h-1 w-[90px] rounded bg-primary`}
                    ></span>
                    <div className="-mx-3 flex flex-wrap">
                        <div className="w-1/2 px-3">
                            <button
                                className="block w-full rounded-xl border-primary bg-primary p-3 text-center text-base font-medium text-white transition hover:bg-primary-dark"
                                onClick={() => setModalOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                        <div className="w-1/2 px-3">
                            <button
                                className="block w-full rounded-xl bg-red-600 border border-stroke p-3 text-center text-base font-medium transition hover:border-red-800 hover:bg-red-800 text-white"
                                onClick={() => {
                                    props.delete();
                                    setModalOpen(false);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
