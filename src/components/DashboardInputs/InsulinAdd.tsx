"use client";
import { entryTags } from "@/constants/constants";
import React, { useState, useEffect } from "react";
import notify from "@/helpers/notify";
import axios from "axios";
import InsulinType from "@/models/insulinTypeModel"; // import to avoid error
import { DatetimeLocalFormat } from "@/helpers/formatDate";
import { Droplets, Weight, Syringe } from "lucide-react";

export default function InsulinAdd(props) {
    const [insulin, setInsulin] = useState("");
    const [insulinType, setInsulinType] = useState("");
    const [userInsulinType, setuserInsulinType] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectTag, setSelectTag] = useState<string>(null);
    const [sendTime, setSendTime] = useState(false);

    const handleTagChange = (event: { target: { value: string } }) => {
        setSelectTag(event.target.value);
    };

    const handleDateChange = (event: { target: { value: string } }) => {
        setSendTime(true);
        setSelectedDate(new Date(event.target.value));
    };

    const changeInsulin = (event: { target: { value: string } }): void => {
        const insulinInput = event.target.value;
        setInsulin(insulinInput);
    };

    const changeInsulinType = (event: { target: { value: string } }): void => {
        const insulinTypeInput = event.target.value;
        setInsulinType(insulinTypeInput);
    };

    const getUserInsulinType = async () => {
        const reponse = await axios.get("/api/users/get-insulin");
        let sortedData = reponse.data.data.sort(
            (a: { name: string }, b: { name: string }) =>
                a.name.localeCompare(b.name)
        );
        setuserInsulinType(sortedData);
    };

    const submitForm = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await axios.post("/api/insulin/add", {
                units: insulin,
                name: insulinType,
                date: sendTime ? selectedDate : null,
                tag: selectTag,
            });
            notify(response.data.message, "success");
            setInsulinType("");
            setInsulin("");
            setIsSubmitting(false);
            setSelectedDate(new Date());
            setSendTime(false);
            setSelectTag(null);

            if (props.data && props.setData) {
                // Assuming response.data.entry has a 'date' property
                const newEntry = response.data.entry;

                props.setData((prevData) => {
                    // Combine the new entry with the existing data
                    const newData = [newEntry, ...prevData];

                    // Sort the array based on the 'date' property
                    newData.sort(
                        (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                    );

                    return newData;
                });
            }
        } catch (error) {
            notify(error.response.data.message, "error");
        }
    };

    useEffect(() => {
        getUserInsulinType();
    }, []);

    return (
        <form
            className="max-w-full mx-auto p-4 md:px-6 py-5 rounded-lg bg-white border border-purple-100 transition-all duration-300 h-full shadow-md"
            onSubmit={submitForm}
        >
            <div className="flex items-center gap-3 text-lg font-semibold text-gray-900 mb-3">
                <div
                    className={`p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600`}
                >
                    <Syringe className="h-4 w-4 text-white" />
                </div>
                Insulin Dose
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
                            className="border text-sm rounded-lg block w-full px-2.5 py-2 border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] h-10 outline-none"
                            placeholder="10 IU"
                            value={insulin}
                            onChange={changeInsulin}
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
                            value={insulinType}
                            onChange={changeInsulinType}
                            className="border text-sm rounded-lg block w-full px-2.5 py-2 border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] h-10 bg-white outline-none"
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
                        htmlFor="glucose"
                    >
                        Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        id="glucoseDate"
                        className="border text-sm rounded-lg block w-full px-2.5 py-2 placeholder:text-red-500 border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] h-10 bg-white outline-none"
                        value={DatetimeLocalFormat(selectedDate)}
                        // value={selectedDate}
                        onChange={handleDateChange}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label
                        className="text-sm font-medium text-gray-700"
                        htmlFor="glucose"
                    >
                        Measurement Tag
                    </label>
                    <select
                        id="insulin_tag"
                        value={selectTag ?? ""}
                        onChange={handleTagChange}
                        className="border border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] text-gray-900 text-sm rounded-lg  block w-full px-2.5 py-2 invalid:text-gray-400 h-10 bg-white outline-none"
                    >
                        <option value="" disabled>
                            Select Tag
                        </option>
                        {entryTags.map((data) => (
                            <option key={data}>{data}</option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    className="text-white bg-gradient-to-r from-[#5E4AE3] to-[#7C3AED] hover:from-[#5E4AE3]/90 hover:to-[#7C3AED]/90 focus:ring-primary-ring font-medium rounded-lg text-sm w-full py-2 text-center transition-all duration-300"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <span className="loading loading-spinner loading-xs my-auto h-full"></span>
                    ) : (
                        "Submit"
                    )}
                </button>
            </div>

            {/* </div> */}
        </form>
    );
}
