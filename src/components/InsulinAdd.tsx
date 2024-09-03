"use client";
import React, { useState, useEffect } from "react";
import notify from "@/helpers/notify";
import axios from "axios";
import InsulinType from "@/models/insulinTypeModel"; // import to avoid error

export default function InsulinAdd(props) {
    const [insulin, setInsulin] = useState("");
    const [insulinType, setInsulinType] = useState("");
    const [userInsulinType, setuserInsulinType] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const changeInsulin = (event: { target: { value: string } }): void => {
        const insulinInput = event.target.value;
        setInsulin(insulinInput);
    };

    const changeInsulinType = (event: { target: { value: string } }): void => {
        const insulinTypeInput = event.target.value;
        setInsulinType(insulinTypeInput);
    };

    const getUserInsulinType = async () => {
        const reponse = await axios.get("api/users/get-insulin/");
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
            const response = await axios.post("/api/insulin/add/", {
                units: insulin,
                name: insulinType,
            });
            notify(response.data.message, "success");
            setInsulinType("");
            setInsulin("");
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
            notify(error.response.data.message, "error");
        }
    };

    useEffect(() => {
        getUserInsulinType();
    }, []);

    return (
        <form
            className="max-w-full mx-auto p-5 md:p-7 rounded-xl bg-white shadow-md"
            onSubmit={submitForm}
        >
            <label
                htmlFor="insulin"
                className="block mb-2 text-sm font-medium text-secondary"
            >
                Insulin Dose (units)
            </label>
            <div className="flex flex-col md:flex-row gap-2">
                <input
                    type="number"
                    id="insulin"
                    className="bg-gray-50 border border-stone-400 text-gray-900 text-sm rounded-xl focus:ring-primary-ring focus:border-primary-ring block w-full lg:w-2/5 p-2.5"
                    placeholder="10 IU"
                    value={insulin}
                    onChange={changeInsulin}
                    required
                />

                <select
                    id="insulinType"
                    value={insulinType}
                    onChange={changeInsulinType}
                    className="bg-gray-50 border border-stone-400 text-gray-900 text-sm rounded-xl focus:ring-primary-ring focus:border-primary-ring block w-full lg:w-2/5 p-2.5 invalid:text-gray-400"
                    required
                >
                    <option value="" disabled>
                        Select Type
                    </option>
                    {userInsulinType.map((data) => (
                        <option key={data._id}>{data.name}</option>
                    ))}
                </select>
                <button
                    type="submit"
                    className="text-white bg-primary hover:bg-primary-dark focus:ring focus:outline-none focus:ring-primary-ring font-medium rounded-xl text-sm w-full lg:w-1/5 py-2.5 text-center transition duration-300"
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
