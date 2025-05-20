"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import notify from "@/helpers/notify";
import { DatetimeLocalFormat } from "@/helpers/formatDate";
import { useRouter } from "next/navigation";

export default function EditEntry({ params }) {
    const [data, setData] = useState({ units: "", name: "", createdAt: "" });
    const router = useRouter();
    useEffect(() => {
        const getData = async () => {
            const entryData = await axios.get(
                `/api/insulin/get-one/${params.entryId}`
            );
            const entryCopy = entryData.data.data;
            entryCopy.createdAt = DatetimeLocalFormat(entryCopy.createdAt);
            setData(entryCopy);
        };
        getData();
    }, [params.entryId]);
    const changeValue = (event) => {
        setData({ ...data, units: event.target.value });
    };
    const changeDate = (event) => {
        setData({ ...data, createdAt: event.target.value });
    };
    const changeInsulinType = (event) => {
        setData({ ...data, name: event.target.value });
    };

    const submitForm = async (e) => {
        e.preventDefault();
        try {
            data.createdAt = new Date(data.createdAt).toISOString();
            const response = await axios.put(
                `/api/insulin/update/${params.entryId}`,
                data
            );
            console.log(response);
            notify(response.data.message, "success");
            router.push("/insulin/");
        } catch (error) {
            console.log(error);
            notify(error.response.data.message, "error");
        }
    };

    return (
        <section className="h-full flex justify-center items-center bg-background p-5">
            <div className="bg-white p-5 rounded-xl shadow w-full max-w-md">
                <h3 className="text-center mb-5 font-semibold text-lg text-gray-900">
                    Edit insulin entry
                </h3>
                <form onSubmit={submitForm}>
                    <div className="flex flex-col gap-3">
                        <div>
                            <label
                                htmlFor="insulinUpdate"
                                className="block mb-2 text-sm font-medium text-gray-900"
                            >
                                Insulin entry (units):
                            </label>
                            <input
                                type="number"
                                id="insulinUpdate"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-ring focus:border-primary block w-full p-2.5"
                                value={data.units}
                                onChange={changeValue}
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="insulinType"
                                className="block mb-2 text-sm font-medium text-gray-900"
                            >
                                Insulin type:
                            </label>

                            <select
                                id="insulinType"
                                value={data.name}
                                onChange={changeInsulinType}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-ring focus:border-primary block w-full p-2.5"
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="Actrapid">Actrapid</option>
                                <option value="Lantus">Lantus</option>
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="insulinDate"
                                className="block mb-2 text-sm font-medium text-gray-900"
                            >
                                Entry date:
                            </label>
                            <input
                                type="datetime-local"
                                id="insulinDate"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-ring focus:border-primary block w-full p-2.5"
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
