"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import notify from "@/helpers/notify";
import { DatetimeLocalFormat } from "@/helpers/formatDate";
import { useRouter } from "next/navigation";
import { entryTags } from "@/constants/constants";
import { Droplets, ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditEntry({ params }) {
    const [data, setData] = useState({
        units: "",
        name: "",
        createdAt: "",
        tag: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userInsulinType, setuserInsulinType] = useState([]);
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

    const changeTag = (event) => {
        setData({ ...data, tag: event.target.value });
    };

    const deleteData = async (id: string) => {
        try {
            const deletedData = await axios.delete(`/api/insulin/delete/${id}`);
            notify("Insulin data deleted!", "success");
            router.push("/insulin/");
        } catch (error) {
            console.log(error);
        }
    };

    const getUserInsulinType = async () => {
        const reponse = await axios.get("/api/users/get-insulin");
        let sortedData = reponse.data.data.sort(
            (a: { name: string }, b: { name: string }) =>
                a.name.localeCompare(b.name)
        );
        setuserInsulinType(sortedData);
    };

    useEffect(() => {
        getUserInsulinType();
    }, []);

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
        <section className="h-full w-full flex flex-col justify-center items-center bg-background p-5 space-y-6">
            <div className="max-w-2xl mx-auto p-4 md:px-6 py-5 rounded-lg bg-white border border-purple-100 transition-all duration-300 shadow-md w-full">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                            <Droplets className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-gray-900">
                                Edit Insulin Entry
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Update your insulin measurement details
                            </p>
                        </div>
                    </div>
                    <Link
                        href={"/insulin"}
                        className="border-purple-200 hover:bg-purple-50 hover:border-[#5E4AE3] flex items-center gap-2 border rounded-lg px-3 py-2 transition-all duration-300"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Link>
                </div>
            </div>
            <form
                className="max-w-2xl w-full mx-auto p-4 md:px-6 py-5 rounded-lg bg-white border border-purple-100 transition-all duration-300 shadow-md"
                onSubmit={submitForm}
            >
                <div className="flex items-center gap-3 text-lg font-semibold text-gray-900 mb-3">
                    <div
                        className={`p-2 rounded-lg bg-gradient-to-br from-[#5E4AE3] to-[#7C3AED]`}
                    >
                        <Save className="h-4 w-4 text-white" />
                    </div>
                    Insulin
                </div>
                <div className="flex flex-col space-y-3">
                    <div className="flex flex-col md:flex-row md:space-x-3 space-y-2 md:space-y-0">
                        <div className="w-full lg:w-1/2 space-y-2">
                            <label
                                className="text-sm font-medium text-gray-700"
                                htmlFor="glucose"
                            >
                                Dose (units)
                            </label>
                            <input
                                type="number"
                                id="insulin"
                                className="border text-sm rounded-lg block w-full px-2.5 py-2 border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] h-10"
                                placeholder="10 IU"
                                value={data.units}
                                onChange={changeValue}
                                required
                            />
                        </div>
                        <div className="w-full lg:w-1/2 space-y-2">
                            <label
                                className="text-sm font-medium text-gray-700"
                                htmlFor="glucose"
                            >
                                Insulin Type
                            </label>
                            <select
                                id="insulinType"
                                value={data.name}
                                onChange={changeInsulinType}
                                className="border text-sm rounded-lg block w-full px-2.5 py-2 border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] h-10"
                                required
                            >
                                <option value="" disabled>
                                    Select Type
                                </option>
                                {userInsulinType.map((data) => (
                                    <option key={data._id}>{data.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label
                            className="text-sm font-medium text-gray-700"
                            htmlFor="glucoseDate"
                        >
                            Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            id="glucoseDate"
                            className="border text-sm rounded-lg block w-full px-2.5 py-2 placeholder:text-red-500 border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] h-10 outline-none"
                            value={DatetimeLocalFormat(data.createdAt)}
                            onChange={changeDate}
                        />
                    </div>
                    <div className="space-y-2">
                        <label
                            className="text-sm font-medium text-gray-700"
                            htmlFor="glucose_tag"
                        >
                            Measurement Tag
                        </label>
                        <select
                            id="glucose_tag"
                            value={data.tag ?? ""}
                            onChange={changeTag}
                            className="border border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] text-gray-900 text-sm rounded-lg  block w-full px-2.5 py-2 invalid:text-gray-400 h-10 outline-none"
                        >
                            <option value="">Select Tag</option>
                            {entryTags.map((data) => (
                                <option key={data}>{data}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-row gap-2 w-full">
                        <button
                            type="submit"
                            className="text-white bg-gradient-to-r from-[#5E4AE3] to-[#7C3AED] hover:from-[#5E4AE3]/90 hover:to-[#7C3AED]/90 focus:ring-primary-ring font-medium rounded-lg text-sm w-full  md:w-2/3 py-2 text-center transition-all duration-300"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="loading loading-spinner loading-xs my-auto h-full"></span>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Save className="h-4 w-4" />
                                    Update Entry
                                </div>
                            )}
                        </button>
                        <button
                            type="button"
                            className="text-white bg-destructive hover:bg-destructive/90 font-medium rounded-lg text-sm md:w-1/3  w-full py-2 text-center transition-all duration-300"
                            disabled={isSubmitting}
                            onClick={() => deleteData(params.entryId)}
                        >
                            {isSubmitting ? (
                                <span className="loading loading-spinner loading-xs my-auto h-full"></span>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </section>
    );
}
