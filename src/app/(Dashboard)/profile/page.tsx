"use client";
import AddNewInsulin from "@/components/ProfileComponents/AddNewInsulin";
import DashboardPreferences from "@/components/ProfileComponents/DashboardPref";
import UserInsulins from "@/components/ProfileComponents/UserInsulins";
import { useEffect, useState } from "react";
import type { InsulinNameType } from "@/types/models";
import { SubscriptionCard } from "@/components/ProfileComponents/SubscriptionCard";
import ProfilePageSkeleton from "@/components/PageSkeletons/ProfilePageSkeleton";
import {
    useInsulinTypes,
    useSubscription,
    useUserInsulins,
} from "@/hooks/queries/useReferenceData";
import { EMPTY_ROWS } from "@/lib/query/keys";

export default function ProfilePage() {
    const insulinTypes = useInsulinTypes();
    const subscription = useSubscription();
    const savedInsulins = useUserInsulins();

    const allAvailableInsulins = insulinTypes.data ?? (EMPTY_ROWS as InsulinNameType[]);
    const subscriptionInfo = subscription.data;

    /**
     * The user's insulin list is edited as a local draft -- chips are added and
     * removed here and only the Save button posts them. It is seeded from the
     * query rather than read straight off it, because writing an unsaved chip
     * into the cache would make it appear in InsulinAdd's dropdown on other
     * pages.
     */
    const [userInsulins, setUserInsulins] = useState<InsulinNameType[]>([]);

    useEffect(() => {
        if (savedInsulins.data) setUserInsulins(savedInsulins.data);
    }, [savedInsulins.data]);

    if (insulinTypes.isPending || subscription.isPending || savedInsulins.isPending)
        return <ProfilePageSkeleton />;

    if (insulinTypes.isError || subscription.isError || savedInsulins.isError)
        return (
            <div className="text-red-500 text-center p-4">
                Failed to load profile data. Please try again later.
            </div>
        );

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
                        allAvailableInsulins={allAvailableInsulins}
                    />
                </div>
            </div>
        </div>
    );
}
