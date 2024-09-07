import axios from "axios";
import React, { useEffect, useState, SetStateAction, useRef } from "react";
import { FaSyringe } from "react-icons/fa";
import type { InsulinNameType } from "@/types/models";
import notify from "@/helpers/notify";
import autoAnimate from "@formkit/auto-animate";

export default function UserInsulins({
    className = "",
    allAvailableInsulins,
    userInsulins,
    setUserInsulins,
}: {
    className?: string;
    allAvailableInsulins: InsulinNameType[];
    userInsulins: InsulinNameType[];
    setUserInsulins: React.Dispatch<SetStateAction<InsulinNameType[]>>;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [selectedInsulin, setSelectedInsulin] = useState("");
    const parent = useRef(null);

    const submitInsulin = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const response = await axios.post("/api/users/bulk-add-insulin/", {
                insulinData: userInsulins,
            });
            setIsSubmitting(false);
            setIsChanged(false);
            notify(response.data.message, "success");
        } catch (error) {
            notify(error.response.data.message, "error");
            console.error(error);
        }
    };

    const selectInsulinAndAdd = (e) => {
        e.preventDefault();
        const newInsulin = e.target.value;
        if (!userInsulins.find((data) => data.name === newInsulin)) {
            setIsChanged(true);
            setSelectedInsulin(newInsulin);
            let currentSelected = allAvailableInsulins.find(
                (data) => data.name === newInsulin
            );
            setUserInsulins([...userInsulins, currentSelected]);
            setSelectedInsulin("");
        }
    };

    const removeInsulin = (e) => {
        e.preventDefault();
        const removedInsulin = e.target.value;
        setUserInsulins(
            userInsulins.filter((data) => data.name !== removedInsulin)
        );
        setIsChanged(true);
    };

    useEffect(() => {
        parent.current && autoAnimate(parent.current);
    }, [parent]);

    return (
        <div
            className={`p-5 md:p-7 rounded-xl bg-white shadow-md ${className}`}
        >
            <div className="flex items-center gap-2 font-bold text-xl md:text-2xl text-secondary mb-4 md:mb-6">
                <FaSyringe className="text-xl" />
                <h2>Your Insulins</h2>
            </div>
            <form className="flex gap-2 mb-4" onSubmit={submitInsulin}>
                <select
                    id="insulinType"
                    value={selectedInsulin}
                    onChange={selectInsulinAndAdd}
                    className="bg-gray-50 border border-stone-400 text-gray-900 text-sm rounded-xl focus:ring-primary-ring focus:border-primary-ring block w-full p-2.5 invalid:text-gray-400"
                >
                    <option value="" disabled>
                        Select Insulin
                    </option>
                    {allAvailableInsulins.map((data) => (
                        <option key={data._id} value={data.name}>
                            {data.name}
                        </option>
                    ))}
                </select>
                <button
                    type="submit"
                    className="text-white bg-primary hover:bg-primary-dark focus:ring focus:outline-none focus:ring-primary-ring font-medium rounded-xl text-sm w-2/5 lg:w-1/5 py-2.5 text-center transition duration-300 disabled:bg-primary/50"
                    disabled={isSubmitting || !isChanged}
                >
                    {isSubmitting ? (
                        <span className="loading loading-spinner loading-xs my-auto h-full"></span>
                    ) : (
                        "Save"
                    )}
                </button>
            </form>
            <div className="flex flex-wrap gap-1" ref={parent}>
                {userInsulins.map((data) => (
                    <div
                        key={data._id}
                        className="text-sm text-center text-white bg-secondary hover:bg-secondary/90 py-0.5 px-2.5 rounded-full flex items-center justify-center gap-1 w-fit"
                    >
                        <p>{data.name}</p>
                        <button
                            className="p-1 text-white/85"
                            value={data.name}
                            onClick={removeInsulin}
                        >
                            x
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
