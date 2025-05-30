"use client";
import { entryTags } from "@/constants/constants";
import { DatetimeLocalFormat } from "@/helpers/formatDate";
import notify from "@/helpers/notify";
import axios from "axios";
import { Droplets } from "lucide-react";
import { useState } from "react";

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
            setSendTime(false);
            setSelectTag(null);
            setSelectedDate(new Date());
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
            className="max-w-full mx-auto p-4 md:px-6 py-5 rounded-lg bg-white border border-purple-100 transition-all duration-300 h-full"
            onSubmit={submitForm}
        >
            <div className="flex items-center gap-3 text-lg font-semibold text-gray-900 mb-6">
                <div
                    className={`p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600`}
                >
                    <Droplets className="h-4 w-4 text-white" />
                </div>
                Blood Glucose
            </div>
            <div className="flex flex-col space-y-3">
                <div className="space-y-2">
                    <label
                        className="text-sm font-medium text-gray-700"
                        htmlFor="glucose"
                    >
                        Glucose Level
                    </label>
                    <input
                        type="number"
                        id="glucose"
                        className="border text-sm rounded-lg block w-full px-2.5 py-2 border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] h-10"
                        placeholder="98 mg/dl"
                        value={glucose}
                        onChange={changeGlucose}
                        required
                    />
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
                        className="border text-sm rounded-lg block w-full px-2.5 py-2 placeholder:text-red-500 border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] h-10"
                        value={DatetimeLocalFormat(selectedDate)}
                        // value={selectedDate}
                        onChange={handleDateChange}
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
                        value={selectTag ?? ""}
                        onChange={handleTagChange}
                        className="border border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] text-gray-900 text-sm rounded-lg  block w-full px-2.5 py-2 invalid:text-gray-400 h-10"
                    >
                        <option value="">Select Tag</option>
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
    );
}
