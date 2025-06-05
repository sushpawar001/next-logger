"use client";
import AddNewInsulin from "@/components/ProfileComponents/AddNewInsulin";
import DashboardPreferences from "@/components/ProfileComponents/DashboardPref";
import UserInsulins from "@/components/ProfileComponents/UserInsulins";
import { useState, useEffect, SetStateAction } from "react";
import type { InsulinNameType } from "@/types/models";
import axios from "axios";
import { SubscriptionCard } from "@/components/ProfileComponents/SubscriptionCard";
import ProfilePageSkeleton from "@/components/PageSkeletons/ProfilePageSkeleton";

interface SubscriptionInfo {
    subscriptionPlan: "trial" | "premium" | "free";
    subscriptionEndDate: string;
    remainingDays: number;
}

export default function ProfilePage() {
    const [allAvailableInsulins, setAllAvailableInsulins] = useState<
        InsulinNameType[]
    >([]);
    const [subscriptionInfo, setSubscriptionInfo] =
        useState<SubscriptionInfo | null>(null);
    const [userInsulins, setUserInsulins] = useState<InsulinNameType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [insulinTypesRes, subscriptionRes, userInsulinsRes] =
                    await Promise.all([
                        axios.get("/api/insulin-type/get"),
                        axios.get("/api/users/subscription"),
                        axios.get("/api/users/get-insulin"),
                    ]);

                setAllAvailableInsulins(insulinTypesRes.data.data);
                setSubscriptionInfo(subscriptionRes.data);
                setUserInsulins(userInsulinsRes.data.data);
            } catch (err) {
                console.error("Error fetching profile data:", err);
                setError(
                    "Failed to load profile data. Please try again later."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    if (loading) return <ProfilePageSkeleton />;
    if (error)
        return <div className="text-red-500 text-center p-4">{error}</div>;

    return (
        <div className="h-full py-5 px-5">
            <div className="flex flex-col max-w-screen-lg mx-auto justify-center h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* <DashboardPreferences className="col-span-1 md:col-span-2" /> */}
                    <SubscriptionCard
                        subscriptionPlan={subscriptionInfo?.subscriptionPlan}
                        subscriptionEndDate={
                            subscriptionInfo?.subscriptionEndDate
                        }
                        remainingDays={subscriptionInfo?.remainingDays}
                        className="col-span-1 md:col-span-2"
                    />
                    <UserInsulins
                        className="col-span-1"
                        allAvailableInsulins={allAvailableInsulins}
                        userInsulins={userInsulins}
                        setUserInsulins={setUserInsulins}
                    />
                    <AddNewInsulin
                        className="col-span-1"
                        setAllAvailableInsulins={setAllAvailableInsulins}
                        setUserInsulins={setUserInsulins}
                    />
                </div>
            </div>
        </div>
    );
}
