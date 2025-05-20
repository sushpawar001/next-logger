"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import notify from "@/helpers/notify";
import { DatetimeLocalFormat } from "@/helpers/formatDate";
import { useRouter } from "next/navigation";

export default function EditEntry({ params }) {
    const [data, setData] = useState({ value: "", createdAt: "" });
    const router = useRouter();
    useEffect(() => {
        const getData = async () => {
            const entryData = await axios.get(
                `/api/weight/get-one/${params.entryId}`
            );
            const entryCopy = entryData.data.data;
            entryCopy.createdAt = DatetimeLocalFormat(entryCopy.createdAt);
            setData(entryCopy);
        };
        getData();
    }, [params.entryId]);
    const changeValue = (event) => {
        setData({ ...data, value: event.target.value });
    };
    const changeDate = (event) => {
        setData({ ...data, createdAt: event.target.value });
    };

    const submitForm = async (e) => {
        e.preventDefault();
        try {
            data.createdAt = new Date(data.createdAt).toISOString();
            const response = await axios.put(
                `/api/weight/update/${params.entryId}`,
                data
            );
            notify(response.data.message, "success");
            router.push("/weight/");
        } catch (error) {
            console.log("Error [weight-update]: ", error);
            notify(error.response.data.message, "error");
        }
    };

    return (
        <section className="h-full flex justify-center items-center bg-background p-5">
            <div className="bg-white p-6 rounded-xl shadow w-full max-w-md">
                <h3 className="text-center mb-5 font-semibold text-lg text-gray-900">
                    Edit Weight:
                </h3>
                <form onSubmit={submitForm}>
                    <div className="flex flex-col gap-3">
                        <div>
                            <label
                                htmlFor="weightUpdate"
                                className="block mb-2 text-sm font-medium text-gray-900"
                            >
                                Weight entry:
                            </label>
                            <input
                                type="number"
                                id="weightUpdate"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-ring focus:border-primary block w-full p-2.5 focus:outline"
                                value={data.value}
                                onChange={changeValue}
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="weightDate"
                                className="block mb-2 text-sm font-medium text-gray-900"
                            >
                                Entry time:
                            </label>
                            <input
                                type="datetime-local"
                                id="weightDate"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-ring focus:border-primary block w-full p-2.5 focus:outline"
                                value={data.createdAt}
                                onChange={changeDate}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="text-white bg-primary hover:bg-primary-dark focus:ring focus:outline-none focus:ring-primary-ring font-medium rounded-xl text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
