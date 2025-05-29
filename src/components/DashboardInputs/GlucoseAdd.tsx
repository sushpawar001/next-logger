"use client";
import { entryTags } from "@/constants/constants";
import { DatetimeLocalFormat } from "@/helpers/formatDate";
import notify from "@/helpers/notify";
import axios from "axios";
import React, { useState } from "react";

export default function GlucoseAdd(props) {
    const [glucose, setGlucose] = useState("");
    const [sendTime, setSendTime] = useState(false);
    const [selectTag, setSelectTag] = useState<string>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const changeGlucose = (event: { target: { value: string } }): void => {
        setGlucose(event.target.value);
    };

    const handleTagChange = (event: { target: { value: string } }) => {
        setSelectTag(event.target.value);
    };

    const handleDateChange = (event: { target: { value: string } }) => {
        setSendTime(true);
        setSelectedDate(new Date(event.target.value));
    };

    const submitForm = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await axios.post(
                "/api/glucose/add/",
                {
                    value: glucose,
                    date: sendTime ? selectedDate : null,
                    tag: selectTag,
                },
                { withCredentials: true }
            );
            notify(response.data.message, "success");
            setGlucose("");
            setIsSubmitting(false);

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
            console.error(error);
            notify(
                error.response?.data?.message || "An error occurred",
                "error"
            );
        }
    };
    return (
        <form
            className="max-w-full mx-auto p-4 md:px-6 py-5 rounded-lg border border-purple-100 transition-all duration-300"
            onSubmit={submitForm}
        >
            <div className="flex flex-col gap-3">
                <label
                    htmlFor="glucose"
                    className="block text-sm font-medium text-gray-900"
                >
                    Your Blood Glucose
                </label>
                <input
                    type="number"
                    id="glucose"
                    className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-primary-ring focus:border-primary-ring block w-full px-2.5 py-2"
                    placeholder="98 mg/dl"
                    value={glucose}
                    onChange={changeGlucose}
                    required
                />
                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        type="datetime-local"
                        id="glucoseDate"
                        className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-primary-ring focus:border-primary-ring block w-full px-2.5 py-2 placeholder:text-red-500 md:w-2/3"
                        value={DatetimeLocalFormat(selectedDate)}
                        // value={selectedDate}
                        onChange={handleDateChange}
                    />
                    <select
                        id="glucose_tag"
                        value={selectTag ?? ""}
                        onChange={handleTagChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-ring focus:border-primary-ring block w-full px-2.5 py-2 invalid:text-gray-400 md:w-1/3"
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
        </form>
        // </motion.div>
    );
}
