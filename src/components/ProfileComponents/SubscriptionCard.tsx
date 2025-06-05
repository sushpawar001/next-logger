"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, Zap, AlertTriangle } from "lucide-react";

interface SubscriptionCardProps {
    subscriptionPlan: "trial" | "premium" | "free";
    remainingDays: number;
    subscriptionEndDate: string;
    className?: string;
}

export function SubscriptionCard({
    subscriptionPlan,
    remainingDays,
    subscriptionEndDate,
    className,
}: SubscriptionCardProps) {
    const getPlanIcon = () => {
        switch (subscriptionPlan) {
            case "premium":
                return <Crown className="h-5 w-5 text-white" />;
            case "trial":
                return <Zap className="h-5 w-5 text-white" />;
            default:
                return <Zap className="h-5 w-5 text-white" />;
        }
    };

    const getPlanGradient = () => {
        switch (subscriptionPlan) {
            case "premium":
                return "bg-gradient-to-br from-yellow-500 to-yellow-600";
            case "trial":
                return "bg-gradient-to-br from-blue-500 to-blue-600";
            default:
                return "bg-gradient-to-br from-gray-500 to-gray-600";
        }
    };

    const getPlanBadgeColor = () => {
        switch (subscriptionPlan) {
            case "premium":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "trial":
                return "bg-blue-100 text-blue-800 border-blue-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getUrgencyColor = () => {
        if (remainingDays <= 3) return "text-red-600";
        if (remainingDays <= 7) return "text-orange-600";
        return "text-gray-900";
    };

    const getButtonText = () => {
        if (subscriptionPlan === "trial" || subscriptionPlan === "free")
            return "Upgrade to Premium";
        if (subscriptionPlan === "premium") return "Renew Premium";
    };

    return (
        <Card
            className={`border-purple-100 transition-all duration-300 ${className}`}
        >
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                    <div className={`p-2 rounded-lg ${getPlanGradient()}`}>
                        {getPlanIcon()}
                    </div>
                    Subscription Status
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Plan Badge and Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <Badge className={getPlanBadgeColor() + " w-fit"}>
                        {subscriptionPlan.charAt(0).toUpperCase() +
                            subscriptionPlan.slice(1)}{" "}
                        Plan
                    </Badge>
                    {remainingDays <= 7 && subscriptionPlan !== "free" && (
                        <Badge className="bg-red-100 text-red-800 border-red-200 w-fit">
                            Expires Soon
                        </Badge>
                    )}
                </div>

                {/* Days Remaining and Expiry */}
                {subscriptionPlan !== "free" && (
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 border border-purple-100 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-purple-600 flex-shrink-0" />
                            <div>
                                <div
                                    className={`text-lg md:text-2xl font-bold ${getUrgencyColor()}`}
                                >
                                    {remainingDays} days
                                </div>
                                <div className="text-sm text-gray-600">
                                    remaining
                                </div>
                            </div>
                        </div>
                        <div className="text-left lg:text-right">
                            <div className="text-sm text-gray-600">
                                {subscriptionPlan === "premium"
                                    ? "Renews"
                                    : "Expires"}{" "}
                                on
                            </div>
                            <div className="font-medium text-gray-900">
                                {subscriptionEndDate}
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <div className="flex justify-stretch sm:justify-end">
                    <Button className="w-full sm:w-auto bg-gradient-to-r from-[#5E4AE3] to-[#7C3AED] hover:from-[#5E4AE3]/90 hover:to-[#7C3AED]/90 text-white font-medium py-2.5 px-8 rounded-lg transition-all duration-300 hover:shadow-lg">
                        <Crown className="h-4 w-4 mr-2" />
                        <span className="sm:inline">{getButtonText()}</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
