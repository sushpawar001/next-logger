import notify from "@/helpers/notify";
import React, { useState, SetStateAction } from "react";
import { FaPlus } from "react-icons/fa6";
import axios from "axios";
import type { InsulinNameType } from "@/types/models";

export default function AddNewInsulin({
    className = "",
    allAvailableInsulins = [],
    setAllAvailableInsulins = () => {},
    setUserInsulins,
}: {
    className?: string;
    allAvailableInsulins?: InsulinNameType[];
    setAllAvailableInsulins?: React.Dispatch<SetStateAction<InsulinNameType[]>>;
    setUserInsulins: React.Dispatch<SetStateAction<InsulinNameType[]>>;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newInsulinType, setNewInsulinType] = useState("");

    const changeNewInsulinType = (event: { target: { value: string } }) => {
        const newInsulinTypeInput = event.target.value;
        setNewInsulinType(newInsulinTypeInput);
    };

    const submitNewInsulin = async (e) => {
        e.preventDefault();
        try {
            if (
                !allAvailableInsulins.some(
                    (obj) =>
                        obj.name.toLowerCase() === newInsulinType.toLowerCase()
                )
            ) {
                const response = await axios.post("/api/insulin-type/add", {
                    name: newInsulinType,
                });
                notify(response.data.message, "success");
                setNewInsulinType("");
                setAllAvailableInsulins((data) => [
                    ...data,
                    response.data.entry,
                ]);

                const addResponse = await axios.post(
                    "/api/users/add-insulin",
                    {
                        name: response.data.entry.name,
                    }
                );
                setUserInsulins((data) => [...data, addResponse.data.insulin]);
            } else {
                notify("Insulin already exists!", "error");
                setNewInsulinType("");
            }
        } catch (error) {
            let e = error.response.data.error || "Something went wrong!";
            notify(e, "error");
        }
    };

    return (
        <div
            className={`p-5 md:p-7 rounded-lg bg-white border border-purple-100 transition-all duration-300 shadow ${className}`}
        >
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4 md:mb-6">
                <FaPlus className="text-xl" />
                <h2>Add New Insulin</h2>
            </div>
            <form className="flex gap-2" onSubmit={submitNewInsulin}>
                <input
                    type="text"
                    id="insulin"
                    className="border text-sm rounded-lg block w-full px-2.5 py-2 border-purple-200 focus:border-[#5E4AE3] focus:ring-[#5E4AE3] h-10"
                    placeholder="Enter new insulin name"
                    value={newInsulinType}
                    onChange={changeNewInsulinType}
                    required
                />
                <button
                    type="submit"
                    className="text-white primary-gradient focus:outline-none font-medium rounded-lg text-sm w-2/5 lg:w-1/5 py-2.5 text-center transition duration-300 disabled:bg-primary/50"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <span className="loading loading-spinner loading-xs my-auto h-full"></span>
                    ) : (
                        "Add"
                    )}
                </button>
            </form>
        </div>
    );
}
