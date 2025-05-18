"use client";
import React, { useState, useEffect } from "react";
import notify from "@/helpers/notify";
import axios from "axios";
import InsulinType from "@/models/insulinTypeModel"; // import to avoid error
import { DatetimeLocalFormat } from "@/helpers/formatDate";

const dataArray = [{ _id: 1, name: "test" }];
export default function InsulinAdd(props) {
    const [insulin, setInsulin] = useState("");
    const [insulinType, setInsulinType] = useState("");
    const [userInsulinType, setuserInsulinType] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

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
            className="max-w-full mx-auto p-5 md:p-6 rounded-lg bg-white shadow-md"
            onSubmit={submitForm}
        >
            <div className="flex flex-col gap-3">
                <label
                    htmlFor="insulin"
                    className="block text-sm font-medium text-secondary"
                >
                    Insulin Dose (units)
                </label>
                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        type="number"
                        id="insulin"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-ring focus:border-primary-ring block w-full lg:w-1/2 p-2.5"
                        placeholder="10 IU"
                        value={insulin}
                        onChange={changeInsulin}
                        required
                    />
                    <select
                        id="insulinType"
                        value={insulinType}
                        onChange={changeInsulinType}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-ring focus:border-primary-ring block w-full lg:w-1/2 p-2.5 invalid:text-gray-400"
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
                    className="text-white bg-primary hover:bg-primary-dark focus:ring focus:outline-none focus:ring-primary-ring font-medium rounded-lg text-sm w-full  py-2.5 text-center transition duration-300"
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
