"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import FitnessDashboard from "@/components/Dashboards/FitnessDashboard";
import DiabetesDashboard from "@/components/Dashboards/DiabetesDashboard";
import { getDashboardLayout } from "@/helpers/getDashboardLayout";

export default function Dashboard() {
    const [layoutSettings, setLayoutSettings] = useState<string | null>(null);

    useEffect(() => {
        const getLayout = async () => {
            const layout = await getDashboardLayout();
            setLayoutSettings(layout);
        };
        getLayout();
    }, []);

    if (layoutSettings == null || typeof window === "undefined") {
        return (
            <div className="w-full h-full flex justify-center items-center font-bold text-secondary text-xl gap-2">
                <p>Loading</p>
                <span className="loading-dots loading size-10"></span>
            </div>
        );
    }

    return layoutSettings === "fitness" ? (
        <FitnessDashboard />
    ) : (
        <DiabetesDashboard />
    );
}
