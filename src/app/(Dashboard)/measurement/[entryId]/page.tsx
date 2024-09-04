"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import notify from "@/helpers/notify";
import { DatetimeLocalFormat } from "@/helpers/formatDate";
import { useRouter } from "next/navigation";
import { MeasurementInput } from "@/components/DashboardInputs/MeasurementAdd";

const dataInputs = [
    "arms",
    "chest",
    "abdomen",
    "waist",
    "hip",
    "thighs",
    "calves",
];

export default function EditEntry({ params }) {
    const [data, setData] = useState({
        arms: "",
        chest: "",
        abdomen: "",
        waist: "",
        hip: "",
        thighs: "",
        calves: "",
        createdAt: "",
    });
    const router = useRouter();
    useEffect(() => {
        const getData = async () => {
            const entryData = await axios.get(
                `/api/measurements/get-one/${params.entryId}`
            );
            const entryCopy = entryData.data.data;
            entryCopy.createdAt = DatetimeLocalFormat(entryCopy.createdAt);
            setData(entryCopy);
        };
        getData();
    }, [params.entryId]);
    const changeValue = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData({ ...data, [name]: value });
    };
    const changeDate = (event) => {
        setData({ ...data, createdAt: event.target.value });
    };

    const submitForm = async (e) => {
        e.preventDefault();
        try {
            data.createdAt = new Date(data.createdAt).toISOString();
            const response = await axios.put(
                `/api/measurements/update/${params.entryId}`,
                data
            );
            console.log(response);
            notify(response.data.message, "success");
            router.push("/measurement/");
        } catch (error) {
            console.log(error);
            notify(error.response.data.message, "error");
        }
    };

    return (
        <section className="h-full flex justify-center items-center bg-background p-5">
            <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
                <form onSubmit={submitForm}>
                    <h3 className="text-center mb-5 font-semibold text-lg text-gray-900">
                        Edit insulin entry
                    </h3>
                    <div className="grid grid-cols-4 gap-2.5">
                        {dataInputs.map((input) => (
                            <MeasurementInput
                                key={input}
                                label={input}
                                id={input}
                                onChange={changeValue}
                                value={data[input]}
                            />
                        ))}

                        <label
                            htmlFor="glucoseDate"
                            className="block text-sm font-medium text-secondary my-auto mr-2"
                        >
                            Entry Time:
                        </label>
                        <input
                            type="datetime-local"
                            id="glucoseDate"
                            className="bg-gray-50 border border-stone-400 text-gray-900 text-sm rounded-xl focus:ring-primary-ring focus:border-primary-ring block w-full p-2 col-span-3"
                            value={data.createdAt}
                            onChange={changeDate}
                            required
                        />
                        <button
                            type="submit"
                            className="text-white bg-primary hover:bg-primary-dark focus:ring focus:outline-none focus:ring-primary-ring font-medium rounded-xl text-sm w-full sm:w-auto px-5 py-2.5 text-center col-span-4"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
