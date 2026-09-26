"use client";
import AddNewInsulin from "@/components/ProfileComponents/AddNewInsulin";
import UserInsulins from "@/components/ProfileComponents/UserInsulins";
import AccountCard from "@/components/ProfileComponents/AccountCard";
import { useEffect, useState } from "react";
import type { InsulinNameType } from "@/types/models";
import { SubscriptionCard } from "@/components/ProfileComponents/SubscriptionCard";
import ExportDataCard from "@/components/ProfileComponents/ExportDataCard";
import ProfilePageSkeleton from "@/components/PageSkeletons/ProfilePageSkeleton";
import {
    PageHeader,
    Panel,
    PanelHead,
    PanelSub,
    PanelTitle,
} from "@/components/app-ui/layout";
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
            <Panel className="text-center text-status-low">
                Failed to load profile data. Please try again later.
            </Panel>
        );

    return (
        <>
            <PageHeader
                title="Profile"
                subtitle="Your account, plan and preferences."
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
                <div className="flex min-w-0 flex-col gap-4 lg:col-span-8 lg:gap-5">
                    <AccountCard />

                    <Panel aria-labelledby="insulins-title">
                        <PanelHead>
                            <div>
                                <PanelTitle id="insulins-title">My insulins</PanelTitle>
                                <PanelSub>
                                    These appear in the insulin form and on charts.
                                </PanelSub>
                            </div>
                        </PanelHead>
                        <UserInsulins
                            allAvailableInsulins={allAvailableInsulins}
                            userInsulins={userInsulins}
                            setUserInsulins={setUserInsulins}
                        />
                        <AddNewInsulin
                            className="mt-5 border-t border-border pt-5"
                            allAvailableInsulins={allAvailableInsulins}
                        />
                    </Panel>

                    {/* DashboardPreferences stays unmounted until /dashboard
                        reads the layout setting; only the diabetes dashboard
                        is wired up. */}
                </div>

                <div className="flex min-w-0 flex-col gap-4 lg:col-span-4 lg:gap-5">
                    <SubscriptionCard
                        subscriptionPlan={subscriptionInfo?.subscriptionPlan}
                        subscriptionEndDate={subscriptionInfo?.subscriptionEndDate}
                        remainingDays={subscriptionInfo?.remainingDays}
                    />
                    <ExportDataCard />
                </div>
            </div>
        </>
    );
}
