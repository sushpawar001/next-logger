"use client";
import { DatetimeLocalFormat } from "@/helpers/formatDate";
import notify from "@/helpers/notify";
import axios from "axios";
import React, { useState } from "react";

const dataArray = [{ _id: 1, name: "test" }];
export default function GlucoseAdd(props) {
    const [glucose, setGlucose] = useState("");
    const [tags, setTags] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const changeGlucose = (event: { target: { value: string } }): void => {
        setGlucose(event.target.value);
    };

    const submitForm = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await axios.post(
                "/api/glucose/add/",
                { value: glucose },
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
            className="max-w-full mx-auto p-5 md:p-7 rounded-lg bg-white shadow-md"
            onSubmit={submitForm}
        >
            <div className="flex flex-col gap-3">
                <label
                    htmlFor="glucose"
                    className="block text-sm font-medium text-secondary dark:text-white"
                >
                    Your Blood Glucose
                </label>
                <input
                    type="number"
                    id="glucose"
                    className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-primary-ring focus:border-primary-ring block w-full p-2.5"
                    placeholder="98 mg/dl"
                    value={glucose}
                    onChange={changeGlucose}
                    required
                />
                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        type="datetime-local"
                        id="glucoseDate"
                        className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-primary-ring focus:border-primary-ring block w-full p-2.5 placeholder:text-red-500 md:w-2/3"
                        value={DatetimeLocalFormat(selectedDate)}
                        // value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(new Date(e.target.value));
                        }}
                        required
                    />
                    <select
                        id="glucose_tag"
                        value={""}
                        onChange={() => {}}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-ring focus:border-primary-ring block w-full p-2.5 invalid:text-gray-400 md:w-1/3"
                        required
                    >
                        <option value="" disabled>
                            Select Tag
                        </option>
                        {dataArray.map((data) => (
                            <option key={data._id}>{data.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    className="text-white bg-primary hover:bg-primary-dark focus:ring focus:outline-none focus:ring-primary-ring font-medium rounded-lg text-sm w-full py-2.5 text-center transition duration-300"
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
