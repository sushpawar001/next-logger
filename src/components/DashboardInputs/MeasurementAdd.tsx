"use client";
import notify from "@/helpers/notify";
import axios from "axios";
import { Ruler } from "lucide-react";
import React, { ChangeEvent, useState } from "react";
import { entryTags } from "@/constants/constants";
import MeasurementInput from "../MeasurementInput";

const dataInputs = [
    "arms",
    "chest",
    "abdomen",
    "waist",
    "hip",
    "thighs",
    "calves",
];

// export default function MeasurementAdd(props) {
export default function MeasurementAdd({
    data = null,
    setData = null,
    className = "",
}) {
    const [measurements, setMeasurements] = useState({
        arms: "",
        chest: "",
        abdomen: "",
        waist: "",
        hip: "",
        thighs: "",
        calves: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectTag, setSelectTag] = useState<string>(null);

    const handleTagChange = (event: { target: { value: string } }) => {
        setSelectTag(event.target.value);
    };

    const changeMeasurements = (event: ChangeEvent<HTMLInputElement>) => {
        const name = event.target.name;
        const value = event.target.value;
        setMeasurements((m) => ({
            ...m,
            [name]: value,
        }));
    };
    const submitForm = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        console.log(measurements);
        setIsSubmitting(true);
        try {
            const response = await axios.post(
                "/api/measurements/add",
                { measurements: measurements, tag: selectTag },
                { withCredentials: true }
            );
            notify(response.data.message, "success");
            setMeasurements({
                arms: "",
                chest: "",
                abdomen: "",
                waist: "",
                hip: "",
                thighs: "",
                calves: "",
            });
            setIsSubmitting(false);

            if (data && setData) {
                // Assuming response.data.entry has a 'date' property
                const newEntry = response.data.entry;

                setData((prevData) => {
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

    const setRandomValues = () => {
        setMeasurements({
            arms: Math.round(Math.random() * 100).toString(),
            chest: Math.round(Math.random() * 100).toString(),
            abdomen: Math.round(Math.random() * 100).toString(),
            waist: Math.round(Math.random() * 100).toString(),
            hip: Math.round(Math.random() * 100).toString(),
            thighs: Math.round(Math.random() * 100).toString(),
            calves: Math.round(Math.random() * 100).toString(),
        });
    };

    const resetForm = () => {
        if (!isSubmitting) {
            setMeasurements({
                arms: "",
                chest: "",
                abdomen: "",
                waist: "",
                hip: "",
                thighs: "",
                calves: "",
            });
        }
    };
    return (
        <form
            className={`max-w-full mx-auto p-4 md:px-6 py-5 rounded-lg bg-white border border-purple-100 transition-all duration-300 h-full shadow-md ${className}`}
            onSubmit={submitForm}
        >
            <div className="flex items-center gap-3 text-lg font-semibold text-gray-900 mb-3">
                <div
                    className={`p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600`}
                >
                    <Ruler className="h-4 w-4 text-white" />
                </div>
                Measurement
            </div>
            <div className="space-y-2">
                {dataInputs.map((input) => (
                    <MeasurementInput
                        key={input}
                        label={input}
                        id={input}
                        onChange={changeMeasurements}
                        value={measurements[input]}
                    />
                ))}
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
                        className="border border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] text-gray-900 text-sm rounded-lg  block w-full px-2.5 py-2 invalid:text-gray-400 h-9 bg-white"
                    >
                        <option value="" disabled>
                            Select Tag
                        </option>
                        {entryTags.map((data) => (
                            <option key={data}>{data}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col md:flex-row gap-1">
                    <button
                        type="submit"
                        className="text-white font-medium rounded-lg text-sm w-full py-2 text-center transition-all duration-300 primary-gradient md:w-2/3"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="loading loading-spinner loading-xs my-auto h-full"></span>
                        ) : (
                            "Submit"
                        )}
                    </button>
                    <button
                        type="reset"
                        className="text-white font-medium rounded-lg text-sm w-full md:w-1/3 py-2 text-center transition-all duration-300 bg-destructive hover:bg-destructive/90"
                        disabled={isSubmitting}
                        onClick={resetForm}
                    >
                        {isSubmitting ? (
                            <span className="loading loading-spinner loading-xs my-auto h-full"></span>
                        ) : (
                            "Reset"
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
