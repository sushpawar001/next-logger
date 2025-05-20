import { getDashboardLayout, setDashboardLayoutLocal } from "@/helpers/getDashboardLayout";
import notify from "@/helpers/notify";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaUserGear, FaPlus } from "react-icons/fa6";

const layoutSettingsOptions = ["Fitness", "Diabetes"];

export default function DashboardPreferences({
    className = "",
}: {
    className?: string;
}) {
    const [layoutSettings, setLayoutSettings] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isChanged, setIsChanged] = useState(false);

    useEffect(() => {
        const getLayout = async () => {
            const layout = await getDashboardLayout();
            setLayoutSettings(layout);
        };
        getLayout();
    }, []);

    const changeValue = (event) => {
        setLayoutSettings(event.target.value);
        setIsChanged(true);
    };

    const submitValue = async (event) => {
        event.preventDefault();
        if (isChanged) {
            setIsSubmitting(true);
            const response = await axios.post("/api/users/set-layout/", {
                layoutSettings: layoutSettings,
            });
            setDashboardLayoutLocal(layoutSettings);
            setIsSubmitting(false);
            setIsChanged(false);
            notify(response.data.message, "success");
        }
    };

    return (
        <div
            className={`p-5 md:p-7 rounded-xl bg-white shadow ${className}`}
        >
            <div className="flex items-center gap-2 font-bold text-xl md:text-2xl text-secondary mb-4 md:mb-6">
                <FaUserGear className="text-xl" />
                <h2>Dashboard Preferences</h2>
            </div>
            <form onSubmit={submitValue}>
                <label
                    htmlFor="dashboardType"
                    className="block mb-2 text-sm font-medium text-secondary"
                >
                    Select dashboard type
                </label>
                <div className="flex flex-col md:flex-row gap-2">
                    <select
                        id="dashboardType"
                        value={layoutSettings}
                        onChange={changeValue}
                        className="bg-gray-50 border border-stone-400 text-gray-900 text-sm rounded-xl focus:ring-primary-ring focus:border-primary-ring block w-full p-2.5 invalid:text-gray-400"
                        required
                    >
                        <option value="" disabled>
                            Select Type
                        </option>
                        {layoutSettingsOptions.map((data) => (
                            <option key={data} value={data.toLowerCase()}>
                                {data}
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="text-white bg-primary hover:bg-primary-dark focus:ring focus:outline-none focus:ring-primary-ring font-medium rounded-xl text-sm w-full lg:w-1/5 py-2.5 text-center transition duration-300 disabled:bg-primary/50"
                        disabled={isSubmitting || !isChanged}
                    >
                        {isSubmitting ? (
                            <span className="loading loading-spinner loading-xs my-auto h-full"></span>
                        ) : (
                            "Save"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
