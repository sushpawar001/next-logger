"use client";
import notify from "@/helpers/notify";
import axios from "axios";
import React, { ChangeEvent, useState } from "react";

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
export default function MeasurementAdd({data = null, setData = null, className = ""}) {
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
                "/api/measurements/add/",
                { measurements: measurements },
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
            className={`max-w-full p-5 md:p-7 rounded-xl bg-white shadow-md flex items-center justify-center ${className}`}
            onSubmit={submitForm}
        >
            <div className="grid grid-cols-4 gap-2.5 w-full">
                {dataInputs.map((input) => (
                    <MeasurementInput
                        key={input}
                        label={input}
                        id={input}
                        onChange={changeMeasurements}
                        value={measurements[input]}
                    />
                ))}
                <div className="col-span-4 grid grid-cols-4 gap-1">
                    <button
                        type="submit"
                        className="text-white bg-primary hover:bg-primary-dark focus:ring focus:outline-none focus:ring-primary-ring font-medium rounded-xl text-sm w-full px-5 py-2.5 text-center transition duration-300 col-span-3"
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
                        className="text-white bg-red-500 hover:bg-red-600 focus:ring focus:outline-none focus:ring-red-300 font-medium rounded-xl text-sm w-full px-5 py-2.5 text-center transition duration-300 col-span-1"
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

export function MeasurementInput({
    label,
    id,
    onChange,
    value,
}: {
    label: string;
    id: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    value: string;
}) {
    const LabelText = label.charAt(0).toUpperCase() + label.slice(1);
    return (
        <>
            <label
                htmlFor={id}
                className="block text-sm font-medium text-secondary  my-auto mr-2"
            >
                {LabelText}
            </label>
            <input
                type="number"
                step={0.1}
                min={0}
                id={id}
                name={id}
                className="bg-gray-50 border border-stone-400  text-sm rounded-xl focus:ring-primary-ring focus:border-primary-ring block w-full p-2 col-span-3"
                placeholder={LabelText}
                value={value}
                onChange={onChange}
                required
            />
        </>
    );
}
