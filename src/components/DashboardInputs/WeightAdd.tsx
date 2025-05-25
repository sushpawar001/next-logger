"use client";
import notify from "@/helpers/notify";
import axios from "axios";
import React, { useState } from "react";
import { DatetimeLocalFormat } from "@/helpers/formatDate";
import { entryTags } from "@/constants/constants";

export default function WeightAdd(props) {
    const [weight, setWeight] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [sendTime, setSendTime] = useState(false);
    const [selectTag, setSelectTag] = useState<string>(null);

    const handleTagChange = (event: { target: { value: string } }) => {
        setSelectTag(event.target.value);
    };

    const handleDateChange = (event: { target: { value: string } }) => {
        setSendTime(true);
        setSelectedDate(new Date(event.target.value));
    };
    const changeWeight = (event: { target: { value: string } }) => {
        setWeight(event.target.value);
    };

    const submitForm = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await axios.post("/api/weight/add/", {
                value: weight,
            });
            notify(response.data.message, "success");
            setWeight("");
            setIsSubmitting(false);

            if (props.data && props.setData) {
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
            className="max-w-full mx-auto p-4 md:px-6 py-5 rounded-lg bg-white shadow"
            onSubmit={submitForm}
        >
            <div className="flex flex-col gap-3">
                <label
                    htmlFor="weight"
                    className="block text-sm font-medium text-secondary dark:text-white"
                >
                    Your Body Weight (kg)
                </label>
                <input
                    type="number"
                    id="weight"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-ring focus:border-primary-ring block w-full px-2.5 py-2"
                    placeholder="72 kg"
                    value={weight}
                    onChange={changeWeight}
                    step="any"
                    required
                />
                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        type="datetime-local"
                        id="glucoseDate"
                        className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-primary-ring focus:border-primary-ring block w-full px-2.5 py-2 placeholder:text-red-500 md:w-2/3"
                        value={DatetimeLocalFormat(selectedDate)}
                        onChange={handleDateChange}
                    />
                    <select
                        id="insulin_tag"
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
                    className="text-white bg-primary hover:bg-primary-dark focus:ring focus:outline-none focus:ring-primary-ring font-medium rounded-lg text-sm w-full py-2 text-center transition duration-300"
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
    );
}
